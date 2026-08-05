# Replace the write-back CMS cache

> Portable plan. All paths are relative to the `engaging` repo root.
> Prepared in a session rooted at `~/Documents/projects`; intended to be executed from a session rooted at `~/Documents/projects/portfolio/engaging`.

## Context

Three earlier pieces of work are committed on `feat/dynamic-experience-metadata`: the `{{experience}}` metadata substitution (`597a2be`), the cookie-banner removal (`78950db`), a coverage restoration (`d43af2f`), and per-device Apple startup images (`6b5c62d`). This plan covers the data layer underneath them.

Today each page calls `getData(query, key, fallback)` and then `saveData(data, page)` **during render**, which `JSON.stringify`s the response back over the TypeScript source file `src/data/cache/{home,cv}.ts`. The intent — keep a committed fallback so a build survives Hygraph being down — is sound. The mechanism is not, and it is measurably broken in three ways:

1. **The write never helps the build that performs it.** It runs during prerender, by which point the old cache values are already compiled into the bundle. On Vercel's read-only filesystem it throws and is swallowed. The fallback only ever updates via a local build plus a git commit.
2. **It corrupts test fixtures.** `saveData.test.ts` doesn't mock `writeFile`, so `pnpm test` overwrites `src/data/cache/home.ts` with `mockHome`. This caused three recovery incidents in one session, once silently reverting a committed change.
3. **It leaks CMS data into client bundles.** Verified against a real build: `Perigree` (the CV street address) appears in `.next/static/chunks/810-*.js`, and the `cacheHome` blob is bundled into the `not-found` and `error` route chunks — ~36 KB of CMS JSON shipped to browsers on routes that don't use it. `Header.tsx` (via `HeaderSkeleton` → `Loading` → `cv/loading` and `cv/download`) pulls the 13 KB `cacheCV`; `Error.tsx` pulls the 4.8 KB `cacheHome`.

Two further problems: the typed object literals mean any change to `TMeta`/`THome`/`TCV` breaks `tsc` until 13 KB of minified JSON is hand-edited (this happened when removing `cookie`), and the single-line blobs produce unreviewable diffs.

**Decisions taken:** full replacement including the revalidation webhook; drop urql for plain `fetch`.

### Why drop urql

Its caching is essentially unused here. `cacheExchange` from `@urql/core` is the *document* cache (not `@urql/exchange-graphcache`, which isn't installed), and `registerUrql` scopes the client to a single server request via React's `cache()`, so nothing survives across requests, ISR revalidations or deploys. There is no client-side urql usage at all — no `Provider`, no `useQuery` — so the client-cache benefits never apply. What remains is per-render deduplication, which `unstable_cache` also provides, plus persistence. The `urql` React package is imported solely for the `gql` template tag.

## Design principle

Separate the two roles the cache currently conflates:

- **Resilience** → an inert, generated JSON *snapshot*, used only as `getData`'s fallback. Server-only, never a client bundle input.
- **Synchronous access** → eliminated. `manifest.ts`, the OG route and `loadGoogleFont` can all be async. The two genuinely-synchronous client consumers need only a few asset URLs, which belong in a small hand-written constants file — not a CMS dump.

---

## Step 1 — Delete `saveData`, fix the bundle leaks

**1a.** Delete `src/data/functions/saveData.ts` and `saveData.test.ts`. Remove the import and the `await saveData(...)` call from `src/app/page.tsx` and `src/app/cv/page.tsx`. `TPages` lives in `saveData.ts` and exists only to type a `pageName` that feeds it — replace with a plain `const pageName = "home"` / `"cv"` (still needed for `getStartupImages(pageName)`), and drop the `TPages` import.

Delete the `vi.mock("@/data/functions/saveData", …)` block and the `it("calls saveData")` case from both page tests.

**1b.** New `src/constants/assets.ts` holding the handful of asset URLs the client components need, copied verbatim from the current cache files (including their `resize=fit:scale,width:*/output=format:webp` segments):

```ts
const logoDarkBackground: TAsset = { url: "https://eu-west-2.graphassets.com/…" };
const logoLightBackground: TAsset = { url: "https://eu-west-2.graphassets.com/…" };
const mugshot: Pick<TMugshot, "image" | "heading"> = { image: { url: "…" }, heading: "Engaging Engineering" };

export { logoDarkBackground, logoLightBackground, mugshot };
```

- `src/components/molecules/Header/Header.tsx:7,13` — import the two logos from `@/constants/assets` instead of destructuring `cacheCV`. Drops 13 KB from the client bundle.
- `src/components/pages/Error/Error.tsx:6,27` — `content = mugshot` from `@/constants/assets`. Drops 4.8 KB. Widen `content`'s type to `Pick<TMugshot, "image" | "heading">` — those are the only fields used.
- `src/components/pages/Error/Error.test.tsx:10,113` — point the fallback assertion at `mugshot` from `@/constants/assets`.

Declarations only, so `assets.ts` needs no test — it's instrumented as covered on import, same as `dimensions.ts`.

## Step 2 — Snapshot replaces the cache

**2a.** Replace `src/data/cache/{home,cv}.ts` with:

```
src/data/snapshot/home.json      # pretty-printed, 2-space indent
src/data/snapshot/cv.json
src/data/snapshot/snapshot.ts    # typed accessor
```

```ts
import type { TCV } from "@/data/types/cv";
import type { THome } from "@/data/types/home";

import cv from "./cv.json";
import home from "./home.json";

const snapshotCV = cv as unknown as TCV;
const snapshotHome = home as unknown as THome;

export { snapshotCV, snapshotHome };
```

`resolveJsonModule` is already enabled. The `as unknown as` cast is the point, not a wart: it is the single seam decoupling the snapshot from the type graph, which is exactly the problem that made removing `cookie` painful. The cast is also unavoidable — `TLink.icon` is a string-literal union, so raw JSON infers `icon: string` and can never structurally satisfy `TCV`. Pretty-printing fixes the unreviewable-diff problem.

Add `"src/data/snapshot/**"` to `coverage.exclude` in `vitest.config.mjs`, alongside the existing `src/data/types/**` and `src/queries/**`.

**2b.** New `src/utils/saveSnapshot.ts`, following the established pattern of `saveToPdf.ts` / `saveStartupImages.ts` — arrow consts, self-invoking IIFE at the bottom, named-export block, run by bare `node`. It fetches both queries and writes `JSON.stringify(data, null, 2)`.

```json
"snapshot": "node --env-file-if-exists=.env.local ./src/utils/saveSnapshot.ts"
```

Three constraints, all verified against this repo:

1. It **cannot** use `src/queries/client.ts` as it stands — `registerUrql` needs React's server request context. Step 3 removes that obstacle by making the client a plain `fetch`.
2. It **cannot** use `@/` aliases — Node's type-stripping doesn't read `tsconfig` `paths`. Use relative imports with explicit `.ts` extensions, as `saveStartupImages.ts` already does (`allowImportingTsExtensions` is enabled). `src/queries/{home,cv}.ts` currently import `@/constants/dimensions` and `@/utils/multiplyToString`; both have no imports of their own, so this is four one-line specifier changes. Webpack resolves explicit `.ts` fine, so Next is unaffected.
3. Must **fail soft** — on any error, log and leave the existing snapshot untouched. Never `process.exit(1)`.

Colocated `saveSnapshot.test.ts` mirroring `saveToPdf.test.ts`: `vi.mock("fs/promises", …)` and a stubbed `global.fetch`. Mocking at the module boundary rather than spying is the structural guarantee that the clobbering problem cannot recur.

**Wire it into `build`**, before `next build`, so the snapshot is fresh at build time — what `saveData` was trying to achieve and failed at. Put it inside the `"build"` string, not a `prebuild` script: pnpm v10 doesn't run pre/post scripts unless `enable-pre-post-scripts=true`.

## Step 3 — Plain `fetch` client, `unstable_cache` for caching

**3a.** Rewrite `src/queries/client.ts` as a plain POST that sends the token. (`src/queries/fetch.ts` is a dead file — zero exports, never imported — containing almost exactly this code; resurrect it or delete it, but don't leave both.)

```ts
const fetchCms = async <Data>(query: string): Promise<Data> => {
  const response = await fetch(process.env.HYGRAPH_ENDPOINT!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HYGRAPH_TOKEN}`,
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
  …
};
```

Change `gql\`…\`` in `src/queries/{home,cv}.ts` to plain template literals and remove the `urql` import. Then remove `urql`, `@urql/core` and `@urql/next` from `package.json`. (`graphql` may also become removable — check nothing else imports it before dropping it.)

This also closes a real gap: the current client sends **no** auth header, so the Hygraph endpoint has to be publicly readable. `HYGRAPH_TOKEN` has been sitting in `.env.local` unused.

**3b.** `cache: "no-store"` on the inner fetch is deliberate. Next's `autoNoCache` is tripped by an `Authorization` header or a POST method whenever the segment's revalidate is 0 — which is the case in the dynamic `/api/og` route. Rather than depend on that resolving favourably, make `unstable_cache` the single caching layer; it caches the *result* and is transport- and context-independent.

```ts
import { unstable_cache } from "next/cache";

const cmsTag = "cms";

const fetchData = async <Data>(query: string, key: string): Promise<Data> => {
  const { data, errors } = await fetchCms<…>(query);

  if (errors) throw new Error(…);

  const item = data?.[key]?.[0];

  if (!item) throw new Error(`${emptyMessage} ${key}`);

  return item;
};

const getData = async <Data>(query: string, key: string, fallback: Data): Promise<Data> => {
  try {
    return await unstable_cache(() => fetchData<Data>(query, key), [key], {
      tags: [cmsTag],
      revalidate,
    })();
  } catch (error) {
    console.error(errorMessage, error);

    return fallback;
  }
};
```

Three load-bearing details:

- **Throw inside, catch outside.** If `fetchData` returned the fallback, `unstable_cache` would persist it for 24 hours and freeze the site on stale data after one transient blip. A rejection never reaches the cache-write path, so failures aren't cached and are retried next request.
- **`keyParts` must include `key`.** The cache key is `cb.toString() + '-' + keyParts.join(',')`. The arrow body stringifies identically at both call sites — `["homes"]` vs `["cvs"]` is the only thing preventing CV data being served to the home page.
- **`revalidate` must match the page's 86400.** `unstable_cache` lowers the segment revalidate to the minimum of the two, so a smaller value here would silently shorten ISR.

Bonus: `/` currently calls Hygraph twice per revalidation (`generateMetadata` and `HomePage`). Same key ⇒ one upstream call.

**3c.** `getData.test.ts` — add `vi.mock("next/cache", () => ({ unstable_cache: vi.fn((cb) => cb) }))`. Cases: success; error → fallback + log; empty result → fallback + log; and `unstable_cache` called with the expected key parts and tag options.

## Step 4 — Rewire the consumers

| File | Change |
| --- | --- |
| `src/app/page.tsx`, `src/app/cv/page.tsx` | Fallback becomes `snapshotHome` / `snapshotCV`. `saveData` gone. |
| `src/app/manifest.ts` | Make async: `const manifest = async (): Promise<MetadataRoute.Manifest> => { const { meta } = await getData<THome>(queryHome, "homes", snapshotHome); … }`. Next awaits metadata handlers. Add `export { revalidate }`. |
| `src/app/api/og/route.tsx` | Move module-scope `imageProps` into `const getImageProps = async (): Promise<OgImageProps> => …` fed by `getData`; `GET` is already async. Add `export { revalidate }`. |
| `src/utils/loadGoogleFont.ts:8` | `text = siteName` from `@/constants/common` — already byte-identical to `cacheHome.meta.title`, so a pure dependency removal with no behaviour change. |
| `Header.tsx`, `Error.tsx` | Step 1b. |

Test edits: `src/tests/app/manifest.test.ts` currently mocks `@/data/cache/home` — swap for a `@/data/functions/getData` mock and `await manifest()`. `src/tests/app/api/og/route.test.tsx` needs a `getData` mock added (it has none today; after this change it's required, and it also insulates the test from `loadGoogleFont`'s real network call).

## Step 5 — On-demand revalidation

New `src/app/api/revalidate/route.ts`:

```ts
import { revalidatePath, revalidateTag } from "next/cache";

import { cmsTag } from "@/data/functions/getData";

const secretHeader = "x-revalidate-secret";
const paths = ["/", "/cv"];

const POST = async (request: Request): Promise<Response> => {
  if (request.headers.get(secretHeader) !== process.env.REVALIDATE_SECRET)
    return new Response(null, { status: 401 });

  revalidateTag(cmsTag);
  paths.forEach((path) => revalidatePath(path));

  return Response.json({ revalidated: true });
};

export { POST, secretHeader, paths };
```

Header-based secret rather than a query param, so it never lands in access logs. The `revalidatePath` calls are belt-and-braces alongside the tag — two lines to remove all doubt. Test at `src/tests/app/api/revalidate/route.test.ts`: mock `next/cache`, assert 401 on bad/missing secret and the happy path.

Once this works, consider raising `revalidate` in `src/constants/common.ts` well above 24 h — the timer becomes a safety net rather than the delivery mechanism.

---

## Vercel setup

1. Project → **Settings → Environment Variables**.
2. Add `REVALIDATE_SECRET` — generate with `openssl rand -hex 32`. Apply to **Production, Preview and Development**.
3. Confirm `HYGRAPH_ENDPOINT` and `HYGRAPH_TOKEN` are present for all three environments. `HYGRAPH_TOKEN` may never have been added, since nothing used it until Step 3 — check rather than assume, or the first deploy after this change returns 401s from Hygraph and silently serves the snapshot.
4. Pull them locally with `vercel env pull .env.local` if you want parity, or add `REVALIDATE_SECRET` to `.env.local` by hand.
5. Redeploy so the new vars are picked up — env changes don't apply to existing deployments.

## Hygraph setup

1. **Project settings → API Access → Permanent Auth Tokens.** Confirm the token in `HYGRAPH_TOKEN` still exists and has *Read* on the published content stage. Create a fresh read-only token if unsure — it only needs `Read` on `Cv` and `Home`.
2. Once Step 3 ships and the app authenticates, consider tightening **API Access → Public Content API** from "read published" to no public access. Do this *after* verifying a deploy works, not before — it's the change most likely to take the site down if the token is wrong.
3. **Project settings → Webhooks → Add webhook.**
   - **Name:** `Revalidate site`
   - **URL:** `https://www.engaging.engineering/api/revalidate`
   - **Method:** POST
   - **Triggers:** Content model `Cv` and `Home`; stage `Published`; actions `Publish` and `Unpublish` (add `Update` only if you publish via update).
   - **Headers:** `x-revalidate-secret` → the same value as `REVALIDATE_SECRET`.
4. Save, then hit **Send test request** and confirm a 200. A 401 means the header value doesn't match Vercel's env var.
5. Hygraph also signs payloads with `gcms-signature`. Verifying it is meaningfully more code and overkill for a personal portfolio — noting it exists rather than recommending it.

---

## Tests and coverage

Coverage is **100% on statements, branches, functions and lines** (istanbul provider, per `vitest.config.mjs`) and must stay there. Run `pnpm coverage`, not `pnpm test`.

| File | Test obligation |
| --- | --- |
| `src/utils/saveSnapshot.ts` | New `saveSnapshot.test.ts`, modelled on `saveToPdf.test.ts`. Mock `fs/promises` and `global.fetch`. Cover the fail-soft branch. |
| `src/data/functions/getData.ts` | Rewrite per 3c — four cases. |
| `src/app/api/revalidate/route.ts` | New test — 401 and happy path. |
| `src/constants/assets.ts` | None — declarations only. |
| `src/data/snapshot/**` | Excluded in config. |

Deletions (`saveData.ts` + its test) leave the denominator together, so coverage is unaffected.

**Known hazard while this work is in progress:** until Step 1 lands, running the test suite overwrites `src/data/cache/home.ts` with mock data. Check `git diff src/data/cache/` before every commit; the real file contains `__typename` keys, the mock version does not.

## Verification

```bash
pnpm snapshot
```

Confirm `src/data/snapshot/*.json` are pretty-printed and hold real CMS data.

```bash
pnpm coverage && pnpm typecheck
```

```bash
pnpm build && pnpm start
```

- **Confirm the leak is gone** — the check that found it originally:
  `grep -rl "Perigree\|Consultant expertise" .next/static/chunks/` should return nothing.
- View source on `/` and `/cv` — metadata unchanged from today's output.
- Fetch `/manifest.webmanifest` and `/api/og`; both should render from live CMS data.
- **Test the fallback path**: temporarily point `HYGRAPH_ENDPOINT` at a bad URL and rebuild. The site should still build and serve snapshot content, with the error logged.
- **Test the webhook**: publish a trivial CMS edit, confirm the live site reflects it within seconds rather than 24 hours.

## Outstanding from the previous plan — CMS edits, still not done

1. CV `meta.description` — replace `over 12 years'` with `over {{experience}} years'`.
2. CV `intro` — restore `{{experience}}` in place of the hardcoded `14 years'`.
3. Remove the `cookie` field from the **Meta** model. The queries no longer request it, so it's orphaned but harmless.
4. Remove root-level `description` from the **CV** and **Home** models — no consumers.
5. Remove root-level `keywords` from both — no consumers; `meta.keywords` feeds the metadata.
6. Remove root-level `title` from both — both pages read `meta.title` for the visible heading *and* the `<title>` tag.

## Notes and uncertainties

- **`unstable_cache` is signposted for eventual deprecation** in favour of `'use cache'`, which in Next 15.5.7 requires the experimental `cacheComponents` flag (verified in `next/dist/build/swc/options.js`). `unstable_cache` is correct today; revisit on a future major.
- **Metadata-route tagging** — `/manifest.webmanifest` currently prerenders with `initialRevalidateSeconds: false`. Adding `export const revalidate` should give it a tagged cache entry, but page tagging was traced more thoroughly than metadata-route tagging. Low stakes; the manifest name/description are cosmetic.
- **Latent OG font bug, out of scope.** `loadGoogleFont()` is called with no arguments, so the Google Fonts request subsets the font to only the glyphs in `"Engaging Engineering"`. `OgImage` renders technology names whose glyphs aren't in that subset. Worth its own look — Step 4's change to `siteName` preserves existing behaviour exactly rather than fixing or worsening it.
- **Order matters for Step 3.** Dropping urql and adding the auth header together means a wrong or missing `HYGRAPH_TOKEN` shows up as a silent fallback to snapshot content, not a loud failure. Verify the token before deploying, and check build logs for the `getData` error line.

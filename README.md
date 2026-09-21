# Engaging Engineering

[![CI](https://github.com/bcwatson22/engaging/actions/workflows/ci.yml/badge.svg)](https://github.com/bcwatson22/engaging/actions/workflows/ci.yml)
![Coverage 100%](https://img.shields.io/badge/coverage-100%25-2EBB4F?labelColor=343B42)

This is a project created with [Next](https://nextjs.org/), [Node](https://nodejs.org/en), [GraphQL](https://graphql.org/), [Vitest](https://vitest.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind](https://tailwindcss.com/) and [Motion](https://motion.dev/) - powered by [Hygraph](https://hygraph.com/), deployed and hosted with [Vercel](https://vercel.com/). Linting and formatting run on [oxlint and oxfmt](https://oxc.rs/). The [Home page](https://www.engaging.engineering/) showcases technologies and expertise offered by Engaging Engineering, the [CV page](https://www.engaging.engineering/cv) is an interactive overview of Billy Watson's vast range of skills and experience, and there is a [Contact page](https://www.engaging.engineering/contact), a [Motes](https://www.engaging.engineering/motes) demo of the WebAssembly particle field behind the Home page, and a [Status page](https://www.engaging.engineering/status) for the render pipeline.

The browser-rendered artifacts the site links to — the CV PDF and the PWA splash screens — are produced by [engaging-worker](https://github.com/bcwatson22/engaging-worker) rather than at build time. [engaging-service](https://github.com/bcwatson22/engaging-service) sits in front of it, queueing those renders and answering the contact form and the status page.

To get it running locally, run `pnpm i` (if you don't have the [pnpm](https://pnpm.io/) package manager installed you can do this with `npm i -g pnpm`) and then `pnpm dev` to spin up the dev server.

## Performance

[PageSpeed Insights](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.engaging.engineering), 26 August 2026, Lighthouse 13.4.1:

| Page                                               | Performance | Accessibility | Best Practices | SEO |
| -------------------------------------------------- | ----------- | ------------- | -------------- | --- |
| [Home](https://www.engaging.engineering/) — mobile | 97          | 100           | 100            | 100 |
| Home — desktop                                     | 100         | 100           | 100            | 100 |
| [CV](https://www.engaging.engineering/cv) — mobile | 99          | 100           | 100            | 100 |
| CV — desktop                                       | 100         | 100           | 100            | 100 |

Mobile is the number worth quoting: it is an emulated Moto G Power on throttled
4G, and it is what Google ranks on. Largest Contentful Paint is still the only
metric not at full marks there — 2.6s on Home, 2.0s on the CV — with everything
else passing comfortably (CLS 0 on both, Total Blocking Time around 40ms and
20ms).

Each figure is the median of three runs, taken after one discarded warm-up run
per page. A single run moves by a point or two either way, which is wide enough
to invent an improvement that is not there — and the warm-up matters more than
that: the LCP element is an image served through `/_next/image`, which took
311ms against a cold edge cache and about 20ms against a warm one. Six
measurements of unchanged code once ranged from 90 to 100 on that alone. The
table is refreshed monthly by a routine, described under
[Maintenance](#maintenance).

The mobile numbers moved from 93 and 94, measured the same way immediately
before the change, when the stylesheet stopped being a second request:
`experimental.inlineCss` puts it in the document, so the critical path is one
deep rather than two, and LCP came down by half a second on Home and nearly a
second on the CV.

These are lab numbers. Field data needs enough real traffic for the Chrome UX
Report to have a sample, and this domain does not have it, so there is nothing
to publish there yet.

Run it yourself with the link above rather than taking these on trust — and note
Chrome's own Lighthouse tab will disagree, mostly because it runs on your machine
and inside your extensions. PageSpeed Insights is the reproducible one.

## Maintenance

Two routines run monthly in GitHub Actions, and both open a pull request rather
than changing anything themselves. Each splits the work the same way: a script
does what can be decided — measuring, taking a median, reading version numbers —
and Claude does the part that needs judgement, then explains it in the PR.

**PageSpeed** (`.github/workflows/pageSpeed.yml`, the 1st of each month) measures
both pages on both strategies as described above, and compares the result with
the table here. A point of movement, or less than 0.2s of LCP, is treated as
noise and the run does nothing, which is the usual outcome. Anything larger
opens a PR updating the table and the sentence under it, saying what moved and
whether it looks like the site or the measurement. It cannot touch application
code.

**Dependencies** (`.github/workflows/dependencies.yml`, the 2nd) raises every
patch and minor version, runs `pnpm verify`, and opens a PR if it passes. If it
fails, Claude finds the package that broke it, drops that one, and ships the
rest with the error that caused it — the first month's run would have dropped
jsdom 30.1.0 for exactly this. It may only edit `package.json` and the lockfile.

Majors are never applied by that routine. The monthly PR lists them and how
long each has been held back, and `.github/workflows/dependencyMajor.yml` takes
one on when asked by name:

```bash
gh workflow run dependencyMajor.yml -f packages="vitest,@vitest/coverage-v8,@vitest/coverage-istanbul"
```

That one may change code, because a major usually needs it — under a rule
against weakening any check to reach green. If the only way through is a lower
threshold or a skipped test, it opens no PR and explains why instead.

The line between the two is the point: unattended, an agent may only raise
versions and drop what breaks, so a bad call is a PR nobody merges. Anything
that edits code to satisfy a dependency is something asked for by name, and
reviewed.

Versions are pinned exactly, and `.npmrc` sets `save-exact` so `pnpm add` keeps
it that way. A version only moves when one of these routines, or a person,
decides it should.

## Stack

### Next

<table>
  <tr>
    <td width="58">
      <img src="https://cdn.simpleicons.org/nextdotjs/000000/FFFFFF" alt="Next icon" width="32" />
    </td>
    <td>
      It uses Next's app router, making use of modern features like Suspense streaming, server components, view transitions between pages, a generated Open Graph image, and manifest, robots and sitemap written as code.
    </td>
  </tr>
</table>

### GraphQL

<table>
  <tr>
    <td width="58">
      <img src="https://cdn.simpleicons.org/graphql/E10098/E10098" alt="GraphQL icon" width="32" />
    </td>
    <td>
      GraphQL is used to query and fetch data from Hygraph's headless endpoint. A small typed <code>fetch</code> client does the talking, and caching is handled by Next's <code>unstable_cache</code> with a tag the CMS webhook revalidates - so a publish refreshes the site within seconds without a rebuild.
    </td>
  </tr>
</table>

### Node

<table>
  <tr>
    <td width="58">
      <img src="https://cdn.simpleicons.org/nodedotjs/5FA04E/5FA04E" alt="Node icon" width="32" />
    </td>
    <td>
      A custom Node script saves local snapshots of the GraphQL query responses, so a CMS outage degrades to the last known-good content rather than an error page. The snapshot is refreshed on every build.
    </td>
  </tr>
</table>

### Vitest

<table>
  <tr>
    <td width="58">
      <img src="https://cdn.simpleicons.org/vitest/068C46/00FF74" alt="Vitest icon" width="32" />
    </td>
    <td>
      100% code coverage, with a blazing fast test runner that also offers enhanced DX and watch mode compared to Jest. The threshold is set in <code>vitest.config.mjs</code> and enforced by CI, so the number on the badge above cannot quietly rot.
    </td>
  </tr>
</table>

### TypeScript

<table>
  <tr>
    <td width="58">
      <img src="https://cdn.simpleicons.org/typescript/3178C6/3178C6" alt="TypeScript icon" width="32" />
    </td>
    <td>
      Of course, everything is strongly typed! To do otherwise in this day and age should be unthinkable.
    </td>
  </tr>
</table>

### Render service

<table>
  <tr>
    <td width="58">
      <img src="https://cdn.simpleicons.org/googlechrome/4285F4/4285F4" alt="Chrome icon" width="32" />
    </td>
    <td>
      The downloadable CV PDF and the PWA splash screens are rendered by driving headless Chrome over the live site. That used to run inside <code>next build</code>, so every deploy downloaded a browser and paid for a full render. Now the same CMS publish that revalidates the site also reaches <a href="https://github.com/bcwatson22/engaging-service">engaging-service</a>, which queues the job on a Redis stream for <a href="https://github.com/bcwatson22/engaging-worker">engaging-worker</a> to render in Go. A production deploy of this site asks the same service to check the artifacts against the pages it just shipped, so a code change reaches the PDF too, not only a content change. The artifacts are stored in R2 and proxied back through this domain.
    </td>
  </tr>
</table>

### oxlint & oxfmt

<table>
  <tr>
    <td width="58">
      <img src="https://cdn.simpleicons.org/oxc/008C89/00F7F1" alt="Oxc icon" width="32" />
    </td>
    <td>
      Linting and formatting are handled by <a href="https://oxc.rs/">oxlint and oxfmt</a> - the Rust-based toolchain that replaced ESLint and Prettier here. The type-aware pass runs as its own CI step, since it is the slow one. Worth noting the tooling is compiled Rust even though every line in this repo is TypeScript.
    </td>
  </tr>
</table>

### Tailwind

<table>
  <tr>
    <td width="58">
      <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4/06B6D4" alt="Tailwind icon" width="32" />
    </td>
    <td>
      Flexibility and speed of development made styling with Tailwind a no-brainer. The clock animation on the Home page was particularly fun to build!
    </td>
  </tr>
</table>

### Motion

<table>
  <tr>
    <td width="58">
      <img src=".github/icons/motion.svg" alt="Motion icon" width="32" />
    </td>
    <td>
      Subtle motion and interactions bring the CV page to life, both via scroll-anchored line animations and scroll-triggered section transitions.
    </td>
  </tr>
</table>

### Hygraph

<table>
  <tr>
    <td width="58">
      <img src=".github/icons/hygraph.png" alt="Hygraph icon" width="32" />
    </td>
    <td>
      Hygraph was chosen as the Headless CMS. Their approach to content modelling, custom components and field validation makes for a really pleasing UX.
    </td>
  </tr>
</table>

### Vercel

<table>
  <tr>
    <td width="58">
      <img src="https://cdn.simpleicons.org/vercel/000000/FFFFFF" alt="Vercel icon" width="32" />
    </td>
    <td>
      Using Vercel to deploy and host any Next project is a dream. Deploys are for code changes only - content reaches the site through the Hygraph publish webhook, which revalidates the cache rather than triggering a build.
    </td>
  </tr>
</table>

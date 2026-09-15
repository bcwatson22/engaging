# Engaging Engineering

[![CI](https://github.com/bcwatson22/engaging/actions/workflows/ci.yml/badge.svg)](https://github.com/bcwatson22/engaging/actions/workflows/ci.yml)
![Coverage 100%](https://img.shields.io/badge/coverage-100%25-2EBB4F?labelColor=343B42)

This is a project created with [Next](https://nextjs.org/), [Node](https://nodejs.org/en), [GraphQL](https://graphql.org/), [Vitest](https://vitest.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind](https://tailwindcss.com/) and [Motion](https://motion.dev/) - powered by [Hygraph](https://hygraph.com/), deployed and hosted with [Vercel](https://vercel.com/). Linting and formatting run on [oxlint and oxfmt](https://oxc.rs/). The [Home page](https://www.engaging.engineering/) showcases technologies and expertise offered by Engaging Engineering, and the [CV page](https://www.engaging.engineering/cv) is an interactive overview of Billy Watson's vast range of skills and experience.

The browser-rendered artifacts the site links to — the CV PDF and the PWA splash screens — are produced by a separate service, [engaging-service](https://github.com/bcwatson22/engaging-service), rather than at build time.

To get it running locally, run `pnpm i` (if you don't have the [pnpm](https://pnpm.io/) package manager installed you can do this with `npm i -g pnpm`) and then `pnpm dev` to spin up the dev server.

## Performance

[PageSpeed Insights](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.engaging.engineering), 15 September 2026, Lighthouse 13.4.1:

| Page                                               | Performance | Accessibility | Best Practices | SEO |
| -------------------------------------------------- | ----------- | ------------- | -------------- | --- |
| [Home](https://www.engaging.engineering/) — mobile | 93          | 100           | 100            | 100 |
| Home — desktop                                     | 100         | 100           | 100            | 100 |
| [CV](https://www.engaging.engineering/cv) — mobile | 99          | 100           | 100            | 100 |
| CV — desktop                                       | 100         | 100           | 100            | 100 |

Mobile is the number worth quoting: it is an emulated Moto G Power on throttled
4G, and it is what Google ranks on. Largest Contentful Paint is the metric that
moves there — a median of 2.6s on Home and 2.1s on the CV — with CLS at 0 on
both and Total Blocking Time around 55ms and 20ms.

Each figure is a median: of three runs for the CV, and of five for Home, whose
mobile score does not settle. Its runs came out at 85, 86, 93, 99 and 100. The
low ones share a render delay of about two seconds on the portrait, which has
long since downloaded: on PageSpeed's slower machines the page's JavaScript
starts before the first paint and holds it back. A sixth run, where three
chunks timed out and no JavaScript ran at all, scored 100 and was left out,
but it says the same thing. That start-up cost is the next thing to take off
the home page.

Two regressions came and went on the way to these. The home page's mobile
score had dropped to 87, with LCP near 4s. The cause was a 0.5s fade-in on every
page: the portrait is the LCP element, and it is not counted as painted until
the fade has let it be, so every load waited out the fade — and Lighthouse's
simulated slow 4G then charged every request that started in that window to
LCP too, which the nav's prefetching made expensive. Bisected with production
builds of each commit and fixed in #35; the page fade is gone, and nothing on
the LCP path may fade in.

Before that, the mobile numbers moved from 93 and 94 to 97 and 99 when the
stylesheet stopped being a second request: `experimental.inlineCss` puts it in
the document, so the critical path is one deep rather than two, and LCP came
down by half a second on Home and nearly a second on the CV.

These are lab numbers. Field data needs enough real traffic for the Chrome UX
Report to have a sample, and this domain does not have it, so there is nothing
to publish there yet.

Run it yourself with the link above rather than taking these on trust — and note
Chrome's own Lighthouse tab will disagree, mostly because it runs on your machine
and inside your extensions. PageSpeed Insights is the reproducible one.

## Stack

### Next

<table>
  <tr>
    <td width="58">
      <img src="https://cdn.simpleicons.org/nextdotjs/000000/FFFFFF" alt="Next icon" width="32" />
    </td>
    <td>
      It uses Next's app router, making use of modern features like Suspense streaming, server components and dynamic favicons (via code), manifest, robots and sitemap.
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
      Custom Node scripts save and retrieve local snapshots of the GraphQL query responses, so a CMS outage degrades to the last known-good content rather than an error page. The snapshot is refreshed on every build.
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
      <img src="https://cdn.simpleicons.org/puppeteer/40B5A4/40B5A4" alt="Puppeteer icon" width="32" />
    </td>
    <td>
      The downloadable CV PDF and the PWA splash screens are rendered by driving headless Chrome over the live site. That used to run inside <code>next build</code>, so every deploy downloaded a browser and paid for a full render. It now lives in <a href="https://github.com/bcwatson22/engaging-service">engaging-service</a>, on a queue, triggered by the same CMS publish that revalidates the site - and the artifacts are proxied back through this domain.
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
      Using Vercel to deploy and host any Next project is a dream, the use of webhooks into Hygraph publishes make it completely seamless to ensure up-to-date content and builds.
    </td>
  </tr>
</table>

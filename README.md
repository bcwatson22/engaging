# Engaging Engineering

[![CI](https://github.com/bcwatson22/engaging/actions/workflows/ci.yml/badge.svg)](https://github.com/bcwatson22/engaging/actions/workflows/ci.yml)
![Coverage 100%](https://img.shields.io/badge/coverage-100%25-brightgreen)

This is a project created with [Next](https://nextjs.org/), [Node](https://nodejs.org/en), [GraphQL](https://graphql.org/), [Vitest](https://vitest.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind](https://tailwindcss.com/) and [Motion](https://motion.dev/) - powered by [Hygraph](https://hygraph.com/), deployed and hosted with [Vercel](https://vercel.com/). Linting and formatting run on [oxlint and oxfmt](https://oxc.rs/). The [Home page](https://www.engaging.engineering/) showcases technologies and expertise offered by Engaging Engineering, and the [CV page](https://www.engaging.engineering/cv) is an interactive overview of Billy Watson's vast range of skills and experience.

The browser-rendered artifacts the site links to — the CV PDF and the PWA splash screens — are produced by a separate service, [engaging-service](https://github.com/bcwatson22/engaging-service), rather than at build time.

To get it running locally, run `pnpm i` (if you don't have the [pnpm](https://pnpm.io/) package manager installed you can do this with `npm i -g pnpm`) and then `pnpm dev` to spin up the dev server.

## Next

<table>
  <tr>
    <td width="58">
      <img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm88pkvdj7j9206mjbkrvrkk6" alt="Next icon" width="32" />
    </td>
    <td>
      It uses Next's app router, making use of modern features like Suspense streaming, server components and dynamic favicons (via code), manifest, robots and sitemap.
    </td>
  </tr>
</table>

## GraphQL

<table>
  <tr>
    <td width="58">
      <img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm3h862c7baty07mnczjsadoq" alt="GraphQL icon" width="32" />
    </td>
    <td>
      GraphQL is used to query and fetch data from Hygraph's headless endpoint. A small typed <code>fetch</code> client does the talking, and caching is handled by Next's <code>unstable_cache</code> with a tag the CMS webhook revalidates - so a publish refreshes the site within seconds without a rebuild.
    </td>
  </tr>
</table>

## Node

<table>
  <tr>
    <td width="58">
      <img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm3h843reblgj07l7ngxmszpx" alt="Node icon" width="32" />
    </td>
    <td>
      Custom Node scripts save and retrieve local snapshots of the GraphQL query responses, so a CMS outage degrades to the last known-good content rather than an error page. The snapshot is refreshed on every build.
    </td>
  </tr>
</table>

## Vitest

<table>
  <tr>
    <td width="58">
      <img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm669n3dj0eki07l1ll2mj10q" alt="Vitest icon" width="32" />
    </td>
    <td>
      100% code coverage, with a blazing fast test runner that also offers enhanced DX and watch mode compared to Jest. The threshold is set in <code>vitest.config.mjs</code> and enforced by CI, so the number on the badge above cannot quietly rot.
    </td>
  </tr>
</table>

## TypeScript

<table>
  <tr>
    <td width="58">
      <img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm3h857ombalp07mnsaxn1xzp" alt="TypeScript icon" width="32" />
    </td>
    <td>
      Of course, everything is strongly typed! To do otherwise in this day and age should be unthinkable.
    </td>
  </tr>
</table>

## Render service

<table>
  <tr>
    <td width="58">
      <img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm88p48y0vspy08mm4zpgwdvx" alt="Puppeteer icon" width="32" />
    </td>
    <td>
      The downloadable CV PDF and the PWA splash screens are rendered by driving headless Chrome over the live site. That used to run inside <code>next build</code>, so every deploy downloaded a browser and paid for a full render. It now lives in <a href="https://github.com/bcwatson22/engaging-service">engaging-service</a>, on a queue, triggered by the same CMS publish that revalidates the site - and the artifacts are proxied back through this domain.
    </td>
  </tr>
</table>

## oxlint & oxfmt

<table>
  <tr>
    <td width="58">
      <img src="https://cdn.simpleicons.org/oxc" alt="Oxc icon" width="32" />
    </td>
    <td>
      Linting and formatting are handled by <a href="https://oxc.rs/">oxlint and oxfmt</a> - the Rust-based toolchain that replaced ESLint and Prettier here. The type-aware pass runs as its own CI step, since it is the slow one. Worth noting the tooling is compiled Rust even though every line in this repo is TypeScript.
    </td>
  </tr>
</table>

## Tailwind

<table>
  <tr>
    <td width="58">
      <img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm3h87lylbm0a07l7j1a78y0z" alt="Tailwind icon" width="32" />
    </td>
    <td>
      Flexibility and speed of development made styling with Tailwind a no-brainer. The clock animation on the Home page was particularly fun to build!
    </td>
  </tr>
</table>

## Motion

<table>
  <tr>
    <td width="58">
      <img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm669n3dz0f3e07mk7qg2n4z3" alt="Motion icon" width="32" />
    </td>
    <td>
      Subtle motion and interactions bring the CV page to life, both via scroll-anchored line animations and scroll-triggered section transitions.
    </td>
  </tr>
</table>

## Hygraph

<table>
  <tr>
    <td width="58">
      <img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm669n3dx0e5s07l33tu0wk61" alt="Hygraph icon" width="32" />
    </td>
    <td>
      Hygraph was chosen as the Headless CMS. Their approach to content modelling, custom components and field validation makes for a really pleasing UX.
    </td>
  </tr>
</table>

## Vercel

<table>
  <tr>
    <td width="58">
      <img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm669n3e50e5w07l3y6quuosf" alt="Vercel icon" width="32" />
    </td>
    <td>
      Using Vercel to deploy and host any Next project is a dream, the use of webhooks into Hygraph publishes make it completely seamless to ensure up-to-date content and builds.
    </td>
  </tr>
</table>

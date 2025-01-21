# Engaging Engineering

This is a project created with [Next](https://nextjs.org/), [Node](https://nodejs.org/en), [GraphQL](https://graphql.org/), [Vitest](https://vitest.dev/), [TypeScript](https://www.typescriptlang.org/), [Tailwind](https://tailwindcss.com/) and [Motion](https://motion.dev/) - powered by [Hygraph](https://hygraph.com/), deployed and hosted with [Vercel](https://vercel.com/). The [Home page](https://www.engaging.engineering/) showcases technologies and expertise offered by Engaging Engineering, and the [CV page](https://www.engaging.engineering/cv) is an interactive overview of Billy Watson's vast range of skills and experience.

To get it running locally, run `pnpm i` (if you don't have the [pnpm](https://pnpm.io/) package manager installed you can do this with `npm i -g pnpm`) and then `pnpm dev` to spin up the dev server.

## Next

<img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm3h83ncpbi5h07mpb71mbnfy" alt="Next icon" width="32" />

It uses Next's app router, making use of modern features like Suspense streaming, server components and dynamic favicons (via code), manifest, robots and sitemap.

## GraphQL

<table>
  <tr>
    <td valign="middle">
      <img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm3h862c7baty07mnczjsadoq" alt="GraphQL icon" width="32" />
    </td>
    <td valign="middle">
      GraphQL is used to query and fetch data from Hygraph's headless endpoint via URQL - ensuring a rapid, typed and sensibly-cached approach to enhance DX.
    </td>
  </tr>
</table>

## Node

<img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm3h843reblgj07l7ngxmszpx" alt="Node icon" width="32" />

Several custom Node functions are used to save and retrieve local versions of GraphQL query responses to ensure up-to-date backups.

## Vitest

<img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm669n3dj0eki07l1ll2mj10q" alt="Node icon" width="32" />

Over 96% code coverage achieved with blazing fast test runner that also offers enhanced DX and watch mode compared to Jest.

## TypeScript

<img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm3h857ombalp07mnsaxn1xzp" alt="TypeScript icon" width="32" />

Of course, everything is strongly typed!

## Tailwind

<img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm3h87lylbm0a07l7j1a78y0z" alt="Tailwind icon" width="32" />

Flexibility and speed of development made the use of Tailwind a no-brainer. The clock animation on the Home page was fiddly but worth it!

## Motion

<img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm669n3dz0f3e07mk7qg2n4z3" alt="Motion icon" width="32" />

Subtle motion and interactions bring the CV page to life, both via scroll-anchored line animations and scroll-triggered section transitions.

## Hygraph

<img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm669n3dx0e5s07l33tu0wk61" alt="Hygraph icon" width="32" />

Hygraph was chosen as the Headless CMS. Their approach to content modelling, custom components and field validation makes for a really pleasing UX.

## Vercel

<img src="https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm669n3e50e5w07l3y6quuosf" alt="Vercel icon" width="32" />

Using Vercel to deploy and host any Next project is a dream, the use of webhooks into Hygraph publishes make it completely seamless to ensure up-to-date content and builds.

import type { TCV } from "../types/cv";

export const mockCV: TCV = {
  title: "Billy Watson",
  description:
    "Creative, personable and collaborative Front End Engineer with over 12 years' experience including React (+ Native), Next, Node and TypeScript.",
  logoLightBackground: {
    url: "https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm2lwg36w435n08l6stxnouwg",
  },
  logoDarkBackground: {
    url: "https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm2lwgbp33vv706mhpi2qr6yu",
  },
  intro:
    "A creative, responsible, motivated Front End Engineer from the Peak District with {{experience}} years' experience including React (+ Native), Next, Node and TypeScript.\n\nI've worked in both agency and client side roles, and graduated with a 1st from Leeds Met University. My interests include scuba diving and mountain biking.",
  address: {
    streetAddress: "20 Perigree Road",
    locality: "Sheffield",
    countryName: "United Kingdom",
    postalCode: "S8 0NE",
  },
  contactLinks: [
    {
      id: "1",
      text: "07518 716298",
      target: "tel:+447518716298",
      icon: "Phone",
    },
    {
      id: "2",
      text: "bcwatson22@gmail.com",
      target: "mailto:bcwatson22@gmail.com",
      icon: "Email",
    },
  ],
  gigs: [
    {
      company: "Pets at Home",
      logo: {
        url: "https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/clubdz0os36r608mjw4nvs4jt",
      },
      city: "Handforth",
      roles: [
        {
          id: "1",
          role: "Principal Front End Engineer",
          dates: ["2024-10-01"],
          capacity: "Contract",
          bullets: [
            "Promoted to most senior FE role to oversee the entire team of 15 engineers ",
            "Focused on improving platform - reduced daily exceptions from millions to tens of thousands; auth enhancements; unblocking E2E tests ",
            "Defined technical direction and coding patterns for consistent and scalable code ",
            "Reviewed upcoming features, collaborating with BE, Design, Product & Delivery to refine and prioritise functionality ",
            "Enhanced UX, performance, accessibility and scalability across codebase ",
          ],
        },
        {
          id: "2",
          role: "Technical Lead",
          dates: ["2023-04-01", "2024-10-01"],
          capacity: "Contract",
          bullets: [
            "Thrice-extended consultant role at large product company, building and delivering their new Next site ",
            "Improved accessibility, usability, performance and conversion rates for users while boosting SEO and reducing churn ",
            "Responsible for completion of vital features like search, find-us, bookings, subscriptions and health plans ",
            "Led three of six development squads, mentoring and upskilling five engineers by  providing expertise ",
            "Drove strategic technical decisions; encouraged performant, scalable and robust coding techniques ",
            "Defined coding standards, critiqued PR’s and encouraged best practices to ensure high code quality and test coverage ",
            "Introduced advanced mocking patterns and accessible strategy for Jest unit tests and Playwright integration tests ",
          ],
        },
      ],
    },
    {
      company: "IAM Cloud",
      logo: {
        url: "https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm2okf596agth07lbn517p2qj",
      },
      city: "Huddersfield",
      roles: [
        {
          id: "3",
          role: "Senior Software Engineer",
          dates: ["2022-09-01", "2023-04-01"],
          capacity: "Contract",
          bullets: [
            "Developed software UI used by thousands of companies and millions of customers",
            "Leveraged advanced React methodologies (use of hooks, callbacks and memoization)",
            "Created extensive unit testing strategy for components, hooks and context",
            "Extended use of Chakra design system, with advanced Storybook implementation",
            "Published packages to NPM with Rush monorepo for consumption by other projects",
            "Utilised Docker to spin up Verdaccio instance, allowing local testing without publishing",
            "Switched to Vite stack instead of Webpack, and explored Vitest instead of Jest",
          ],
        },
      ],
    },
    {
      company: "Pollen",
      logo: {
        url: "https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm2nfyqfdiebo06mhdai9k5rh",
      },
      city: "London",
      roles: [
        {
          id: "4",
          role: "Senior Software Engineer",
          dates: ["2022-04-01", "2022-08-01"],
          capacity: "Permanent",
          bullets: [
            "Led and mentored development team of 4 as a T-shaped engineer at travel company",
            "Used TypeScript and GraphQL extensively in an Agile, product-focused environment",
            "Contributed to component library shared by web (Next) and mobile (React Native)",
            "Thoroughly unit tested code with Jest, explored functional and E2E tests with Cypress",
            "Improved code performance to enhance UX by reducing render and loading times",
            "Drove codebase accessibility audit, boosting usability for all users as well as SEO",
            "Integrated feature flags and implemented AB testing in collaboration with data team",
          ],
        },
      ],
    },
    {
      company: "Absurd",
      logo: {
        url: "https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm2lqorpg1lfh08l6x1lw804x",
      },
      city: "Manchester",
      roles: [
        {
          id: "5",
          role: "Lead Front End Developer",
          dates: ["2021-07-01", "2022-04-01"],
          capacity: "Permanent",
          bullets: [
            "Promoted to lead role after building out multi-faceted team of different seniority",
            "Mentored and line-managed whole team; mapping objectives and running 1-2-1's",
            "Honed bleeding edge agency tech stack - Next, TypeScript, Node, Sass and Jest",
            "Embraced GraphQL, using it in headless instances of Shopify and Contentful",
            "Introduced modern unit testing with Jest // React Testing Library for code confidence",
            "Remained hands-on, developing major projects for Umbro, Lucy & Yak and CitySuites",
            "Involved in strategic decisions like DX, branch strategy and Azure DevOps migration",
          ],
        },
        {
          id: "6",
          role: "Senior Front End Developer",
          dates: ["2018-09-01", "2021-07-01"],
          capacity: "Permanent",
          bullets: [
            "Headhunted for senior role at service design agency after relocation to Manchester",
            "Introduced ES6+, TypeScript, React and React Native as well as GSAP and Webpack",
            "Implemented advanced React concepts like custom hooks, context and suspense",
            "Expanded agency's expertise into mobile via creation of a TypeScript React Native app",
            "Turbocharged performance and SEO of agency website utilising Next and SSR",
            "Developed Alexa app with Node and Lamba, led agency’s official Alexa certification",
            "Championed the PWA, leveraging advantages with an offline-capable Vue project",
          ],
        },
      ],
    },
    {
      company: "Plusnet",
      logo: {
        url: "https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm2ng5fs1ih2j06mhqvaqpfcp",
      },
      city: "Sheffield",
      roles: [
        {
          id: "7",
          role: "Front End Developer",
          dates: ["2016-05-01", "2017-12-01"],
          capacity: "Permanent",
          bullets: [
            "In-house JavaScript expert at major ISP whose site receives millions of hits per year",
            "Mentored placement student during project to rebuild Service Status in React",
            "Introduced unit testing using Mocha and Chai, used Selenium for functional testing",
            "Rebuilt old Grunt build stack in Gulp, saving the department 3 day's dev time per year",
            "Developed new prototype Member Centre in Angular after conducting user testing",
            "Completed code reviews for entire department to encourage clean, manageable code",
          ],
        },
      ],
    },
    {
      company: "Havas Lynx",
      logo: {
        url: "https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb/cm2lqmy9a1kuq08l61zq7supx",
      },
      city: "Manchester",
      roles: [
        {
          id: "8",
          role: "Front End Developer",
          dates: ["2014-03-01", "2015-08-01"],
          capacity: "Permanent",
          bullets: [
            "Promoted to mid-weight following advancement of skills and knowledge as a junior",
            "Key member of development team, initiated and led both individual and team projects",
            "Acted up and ran department during replacement for outgoing Head of Front End",
            "Honed JS skills with use of Knockout, Require and writing custom Handlebars helpers",
            "Mentored junior devs, advising on key decisions and best practices to develop skills",
            "Responsible for scheduling and timelines, hiring freelance resource where necessary",
          ],
        },
        {
          id: "9",
          role: "Junior Front End Developer",
          dates: ["2012-07-01", "2014-03-01"],
          capacity: "Permanent",
          bullets: [
            "Given full time role as a junior developer after impressing during placement",
            "Developed websites, apps and eDetails; including for various client CLM platforms",
            "Collaborated with mobile team for iOS apps, using TeamCity and provisioning profiles",
            "Involved in developing new build stack, moving from Jekyll + Zepto to Grunt + jQuery",
            "Used templating tools like Handlebars, Assemble and Jade to avoid code repetition",
            "Ran rapid prototyping - overnight app development for global company conference",
          ],
        },
        {
          id: "10",
          role: "Placement Developer",
          dates: ["2012-07-01", "2012-07-01"],
          capacity: "Placement",
          bullets: [
            "Offered placement after being headhunted at university Creative Showcase",
            "Furthered experience to modern web technologies including HTML5, Sass and Zepto",
            "Gained exposure to Back End technologies by working on PHP and .NET websites",
          ],
        },
      ],
    },
  ],
  skills:
    "Through my wealth of experience - across agency, in-house and freelance roles - I've gained a vast array of skillsets and expertise in a range of web and native technologies. I specialise in JavaScript and have thorough experience of using modern techniques and frameworks including React, Vue and Angular; but also have the thirst and drive to learn new skills and develop my knowledge to stay at the cutting edge.\n\nAs a T-shaped engineer, I value collaboration with members of the wider project team across different disciplines. Having experience of leading teams and mentoring other engineers, I also find the management side of the job really rewarding, while at the same time cherishing the technical challenge of being an expert engineer. I am passionate about usability and accessibility and how these enhance UX. I am also highly skilled in using creative software including Figma, Sketch and Photoshop.",
  qualifications: [
    {
      institution: "Leeds Metropolitan University",
      location: "West Yorkshire",
      dates: ["2009-09-01", "2012-05-31"],
      description: "First Class BSc (Hons) in Multimedia Technology",
    },
    {
      institution: "Lady Manners School",
      location: "Derbyshire",
      dates: ["2001-09-01", "2008-05-31"],
      description: "12 GCSEs and 3 A-Levels",
    },
  ],
  onlineLinks: [
    {
      text: "Portfolio",
      target: "https://engaging.engineering",
      icon: "Website",
    },
    {
      text: "LinkedIn",
      target: "https://linkedin.com/in/watsonbilly",
      icon: "Profile",
    },
    {
      text: "Github",
      target: "https://github.com/bcwatson22",
      icon: "Repo",
    },
  ],
  references: [
    {
      person: "Tom Tollafield",
      id: "1",
      role: "Head of Software",
      company: "Pets at Home",
      link: {
        text: "LinkedIn",
        target: "https://linkedin.com/in/tom-tollafield-9732ba18 ",
        icon: "Profile",
      },
    },
    {
      person: "Mattia Battiston",
      id: "1",
      role: "Engineering Manager",
      company: "Pollen",
      link: {
        text: "LinkedIn",
        target: "https://linkedin.com/in/mattiabattiston ",
        icon: "Profile",
      },
    },
    {
      person: "Rob Dorsett",
      id: "1",
      role: "Technical Director",
      company: "Absurd",
      link: {
        text: "LinkedIn",
        target: "https://linkedin.com/in/rob-dorsett-6b4378b0 ",
        icon: "Profile",
      },
    },
  ],
};

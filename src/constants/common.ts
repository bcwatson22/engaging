export const siteName = 'Engaging Engineering';
export const domainName = 'https://www.engaging.engineering';

/* The render service. Public, and hardcoded rather than read from the
   environment for the same reason the CSP hardcodes it: a variable that is
   merely missing would produce a page that half-works instead of a build that
   fails. next.config.mjs keeps its own copy because it cannot import this —
   the two must agree, and the CSP is what enforces that they do. */
export const serviceOrigin = 'https://engaging-service.fly.dev';
export const careerStartDate = '2012-06-01';

/* One day in seconds. Route segments cannot import this — Next parses their
   `revalidate` statically, so each page declares the literal itself — but
   unstable_cache is a plain call and must be given the same value, or it
   would silently shorten ISR by lowering the segment's revalidate. */
export const revalidate = 86400;

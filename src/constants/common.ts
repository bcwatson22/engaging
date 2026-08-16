export const siteName = 'Engaging Engineering';
export const domainName = 'https://www.engaging.engineering';
export const careerStartDate = '2012-06-01';

/* One day in seconds. Route segments cannot import this — Next parses their
   `revalidate` statically, so each page declares the literal itself — but
   unstable_cache is a plain call and must be given the same value, or it
   would silently shorten ISR by lowering the segment's revalidate. */
export const revalidate = 86400;

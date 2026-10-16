## Performance

[PageSpeed Insights](https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fwww.engaging.engineering), 26 August 2026, Lighthouse 13.4.1:

| Page                                               | Performance | Accessibility | Best Practices | SEO |
| -------------------------------------------------- | ----------- | ------------- | -------------- | --- |
| [Home](https://www.engaging.engineering/) - mobile | 97          | 100           | 100            | 100 |
| Home - desktop                                     | 100         | 100           | 100            | 100 |
| [CV](https://www.engaging.engineering/cv) - mobile | 99          | 100           | 100            | 100 |
| CV - desktop                                       | 100         | 100           | 100            | 100 |

Mobile is the number worth quoting: it is an emulated Moto G Power on throttled
4G, and it is what Google ranks on. Largest Contentful Paint is still the only
metric not at full marks there - 2.6s on Home, 2.0s on the CV - with everything
else passing comfortably (CLS 0 on both, Total Blocking Time around 40ms and
20ms).

Each figure is the median of three runs, taken after one discarded warm-up run
per page. A single run moves by a point or two either way, which is wide enough
to invent an improvement that is not there - and the warm-up matters more than
that: the LCP element is an image served through `/_next/image`, which took
311ms against a cold edge cache and about 20ms against a warm one. Six
measurements of unchanged code once ranged from 90 to 100 on that alone.

The warm-up narrowed that but did not close it. Two sittings 27 minutes apart
on the same commit later read 99 and 91 on Home mobile, with LCPs of 2.0s and
3.3s, and the three runs inside each sitting agreed with each other to within a
point. Across four sittings that figure reads 2.6s, 3.2s, 2.0s and 3.3s: two
clusters about 1.2s apart rather than scatter, so something switches between
states rather than wobbling. What, is still open: the LCP image is 23KB and
preloaded in the first 350 bytes, while the document is 322KB, which is itself
over a second of transfer on the profile mobile is scored against.

So the site is now measured twice with a gap, and each figure records both
sittings and the range across every run. A single sitting cannot be questioned;
two can disagree, and when they do the routine publishes nothing. It is
described under [Maintenance](#maintenance).

The mobile numbers moved from 93 and 94, measured the same way immediately
before the change, when the stylesheet stopped being a second request:
`experimental.inlineCss` puts it in the document, so the critical path is one
deep rather than two, and LCP came down by half a second on Home and nearly a
second on the CV.

These are lab numbers. Field data needs enough real traffic for the Chrome UX
Report to have a sample, and this domain does not have it, so there is nothing
to publish there yet.

Run it yourself with the link above rather than taking these on trust - and note
Chrome's own Lighthouse tab will disagree, mostly because it runs on your machine
and inside your extensions. PageSpeed Insights is the reproducible one.

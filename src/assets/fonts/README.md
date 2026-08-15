# Fonts

`Nunito-Regular.ttf` — [Nunito](https://fonts.google.com/specimen/Nunito) by
Vernon Adams, Cyreal and Jacques Le Bailly, under the
[SIL Open Font License 1.1](https://openfontlicense.org), which permits
redistribution.

Downloaded from `fonts.gstatic.com` as TrueType rather than WOFF2, because
Satori — which `next/og` uses to rasterise the OG image — cannot decode WOFF2.

It is the full Latin set rather than a subset of the strings currently drawn.
Subsetting would save around 100KB in a file that ships once and is never sent
to a browser, and would break silently the moment a character outside the
subset appeared in the image.

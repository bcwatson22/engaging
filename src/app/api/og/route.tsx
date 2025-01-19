import { ImageResponse } from "next/og";

import { OgImage } from "@/components/organisms/OgImage/OgImage";

import { cacheHome } from "@/data/cache/home";

const fontFamily = "Nunito";

const loadGoogleFont = async (font = fontFamily, text = cacheHome.title) => {
  const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const resource = css.match(
    /src: url\((.+)\) format\('(opentype|truetype)'\)/
  );

  if (resource) {
    const response = await fetch(resource[1]);

    if (response.status == 200) return await response.arrayBuffer();
  }

  throw new Error("Failed to load font data");
};

const GET = async () =>
  new ImageResponse(<OgImage {...cacheHome} />, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: fontFamily,
        data: await loadGoogleFont(),
        style: "normal",
      },
    ],
  });

export { GET };

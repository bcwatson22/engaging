import { ImageResponse } from "next/og";

import { OgImage } from "@/components/organisms/OgImage/OgImage";

import { cacheHome } from "@/data/cache/home";
import { loadGoogleFont } from "@/utils/loadGoogleFont";

const fontFamily = "Nunito";

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

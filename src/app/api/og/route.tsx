import { ImageResponse } from "next/og";

import {
  OgImage,
  type OgImageProps,
} from "@/components/organisms/OgImage/OgImage";

import { cacheHome } from "@/data/cache/home";
import { loadGoogleFont, fontFamily } from "@/utils/loadGoogleFont";

const replaceImageFormat = (
  value: string,
  current = "webp",
  target = "png"
): string => value.replace(current, target);

const imageProps: OgImageProps = {
  ...cacheHome,
  mugshot: {
    ...cacheHome.mugshot,
    image: {
      url: replaceImageFormat(cacheHome.mugshot.image.url),
    },
  },
  technologies: cacheHome.technologies.map((item) => ({
    ...item,
    icon: {
      ...item.icon,
      url: replaceImageFormat(item.icon.url),
    },
  })),
};

const GET = async () =>
  new ImageResponse(<OgImage {...imageProps} />, {
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

import { ImageResponse } from "next/og";

import {
  OgImage,
  type OgImageProps,
} from "@/components/organisms/OgImage/OgImage";
import { getData } from "@/data/functions/getData";
import { snapshotHome } from "@/data/snapshot/snapshot";
import type { THome } from "@/data/types/home";
import { queryHome } from "@/queries/home";
import { formatExperience } from "@/utils/formatExperience";
import { loadGoogleFont, fontFamily } from "@/utils/loadGoogleFont";

const replaceImageFormat = (
  value: string,
  current = "webp",
  target = "png",
): string => value.replace(current, target);

/* Satori cannot decode webp, so every asset URL is swapped to png here. */
const getImageProps = async (): Promise<OgImageProps> => {
  const home = await getData<THome>(queryHome, "homes", snapshotHome);

  return {
    ...home,
    meta: {
      ...home.meta,
      description: formatExperience(home.meta.description),
    },
    mugshot: {
      ...home.mugshot,
      image: {
        url: replaceImageFormat(home.mugshot.image.url),
      },
    },
    technologies: home.technologies.map((item) => ({
      ...item,
      icon: {
        ...item.icon,
        url: replaceImageFormat(item.icon.url),
      },
    })),
  };
};

const GET = async () =>
  new ImageResponse(<OgImage {...await getImageProps()} />, {
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

export { GET, getImageProps };

/* Next parses route segment config statically, so this has to be a plain
   numeric literal here — not an import, a re-export, or arithmetic.
   86400 = one day in seconds. */
export const revalidate = 86400;

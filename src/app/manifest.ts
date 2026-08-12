import type { MetadataRoute } from "next";

import { themeColor } from "@/constants/metadata";
import { getData } from "@/data/functions/getData";
import { snapshotHome } from "@/data/snapshot/snapshot";
import type { THome } from "@/data/types/home";
import { queryHome } from "@/queries/home";
import { formatExperience } from "@/utils/formatExperience";

const iconSizes = [192, 512];

const manifest = async (): Promise<MetadataRoute.Manifest> => {
  const {
    meta: { title, description },
  } = await getData<THome>(queryHome, "homes", snapshotHome);

  return {
    name: title,
    short_name: title,
    description: formatExperience(description),
    start_url: "/",
    display: "standalone",
    background_color: themeColor,
    theme_color: themeColor,
    icons: iconSizes.map((size) => {
      const sizes = `${size}x${size}`;

      return {
        src: `/web-app-manifest-${sizes}.png`,
        sizes,
        type: "image/png",
        purpose: "maskable",
      };
    }),
  };
};

export default manifest;

/* Next parses route segment config statically, so this has to be a plain
   numeric literal here — not an import, a re-export, or arithmetic.
   86400 = one day in seconds. */
export const revalidate = 86400;

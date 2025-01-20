import type { MetadataRoute } from "next";

import { cacheHome } from "@/data/cache/home";
import { themeColor } from "@/constants/metadata";

const { title, description } = cacheHome;

const iconSizes = [192, 512];

const manifest = (): MetadataRoute.Manifest => ({
  name: title,
  short_name: title,
  description,
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
});

export default manifest;

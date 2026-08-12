import type { TMugshot } from "@/components/organisms/Mugshot/Mugshot";

import { siteName } from "./common";

/* The handful of CMS asset URLs that client components need synchronously.
   Held here rather than read from a CMS dump so that no page pulls a whole
   content blob into its client bundle just to render a logo or a fallback. */

const assetHost = "https://eu-west-2.graphassets.com/clua49x6o2fv607l98axy16wb";

const logoDarkBackground: TAsset = {
  url: `${assetHost}/resize=fit:scale,width:896/output=format:webp/cm60oelf4h2g007js2owzxjwv`,
};

const logoLightBackground: TAsset = {
  url: `${assetHost}/resize=fit:scale,width:896/output=format:webp/cm60obbpqh36k07js1noabjnu`,
};

const mugshot: Pick<TMugshot, "image" | "heading"> = {
  image: {
    url: `${assetHost}/resize=fit:scale,width:768/output=format:webp/cm3h7t43hbj9607l7ggon7yd6`,
  },
  heading: siteName,
};

export { logoDarkBackground, logoLightBackground, mugshot };

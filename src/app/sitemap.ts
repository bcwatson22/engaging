import type { MetadataRoute } from "next";
import dayjs from "dayjs";

import { domainName } from "@/constants/common";

const lastModified = dayjs().toISOString();
const changeFrequency = "monthly";

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: domainName,
    lastModified,
    changeFrequency,
    priority: 1,
  },
  {
    url: `${domainName}/cv`,
    lastModified,
    changeFrequency,
    priority: 0.8,
  },
];

export default sitemap;
export { changeFrequency };

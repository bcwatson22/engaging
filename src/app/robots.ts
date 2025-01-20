import type { MetadataRoute } from "next";

import { domainName } from "@/constants/common";

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: ["/", "/api/og/*"],
  },
  sitemap: `${domainName}/sitemap.xml`,
});

export default robots;

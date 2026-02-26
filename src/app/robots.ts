import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/profile/",
        "/session/create",
        "/feedback",
        "/session/*/waiting",
        "/session/*/result",
        "/session/*/reports",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

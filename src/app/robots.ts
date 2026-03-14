import type { MetadataRoute } from "next";

import {
  PROFILE_ROUTE_PREFIX,
  SESSION_CREATE_ROUTE,
  SESSION_MEMBER_ONLY_SUFFIXES,
} from "@/lib/auth/auth-route-groups";
import { SITE_URL } from "@/lib/constants/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        `${PROFILE_ROUTE_PREFIX}/`,
        SESSION_CREATE_ROUTE,
        "/feedback",
        ...SESSION_MEMBER_ONLY_SUFFIXES.map((suffix) => `/session/*/${suffix}`),
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

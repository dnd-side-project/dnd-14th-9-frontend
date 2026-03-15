import type { MetadataRoute } from "next";

import {
  PROFILE_ROUTE_PREFIX,
  SESSION_CREATE_ROUTE,
  SESSION_MEMBER_ONLY_SUFFIXES,
} from "@/lib/auth/auth-route-groups";
import { SITE_URL } from "@/lib/constants/seo";
import { FEEDBACK_ROUTE, ROOT_ROUTE } from "@/lib/routes/route-paths";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ROOT_ROUTE,
      disallow: [
        "/api/",
        `${PROFILE_ROUTE_PREFIX}/`,
        SESSION_CREATE_ROUTE,
        FEEDBACK_ROUTE,
        ...SESSION_MEMBER_ONLY_SUFFIXES.map((suffix) => `/session/*/${suffix}`),
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

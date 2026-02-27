import type { MetadataRoute } from "next";

import { FAVICON_DEFAULT, PWA_ICON_192, PWA_ICON_512 } from "@/lib/constants/assets";
import { SITE_SHORT_DESCRIPTION, SITE_TITLE } from "@/lib/constants/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_TITLE,
    short_name: "각",
    description: SITE_SHORT_DESCRIPTION,
    lang: "ko",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: FAVICON_DEFAULT, sizes: "any", type: "image/x-icon" },
      { src: PWA_ICON_192, sizes: "192x192", type: "image/png" },
      { src: PWA_ICON_512, sizes: "512x512", type: "image/png" },
      { src: PWA_ICON_512, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

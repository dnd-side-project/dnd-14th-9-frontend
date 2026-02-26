import type { Metadata } from "next";

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants/seo";

const DEFAULT_TITLE = `${SITE_NAME} - 모여서 각자 작업`;

const OG_IMAGES = [
  { url: "/og-image.png", width: 1200, height: 630 },
  { url: "/og-image-square.png", width: 600, height: 600 },
];

const INDEXABLE_ROBOTS = {
  index: true,
  follow: true,
  googleBot: { index: true, follow: true },
} as const;

const NO_INDEX_ROBOTS = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false },
} as const;

interface OpenGraphOptions {
  title?: string;
  description?: string;
  url?: string;
  type?: "website" | "article";
  images?: Array<{ url: string; width?: number; height?: number }>;
}

interface PageMetadataOptions {
  title: string;
  description: string;
  pathname?: string;
  noIndex?: boolean;
  openGraph?: OpenGraphOptions;
}

function toAbsoluteUrl(pathname?: string): string {
  if (!pathname) return SITE_URL;
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return new URL(normalized, SITE_URL).toString();
}

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: "%s | 각",
    default: DEFAULT_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ko_KR",
    type: "website",
    images: OG_IMAGES,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: OG_IMAGES.map((img) => img.url),
  },
  icons: {
    icon: "/favicon.ico",
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "각",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_NAVER_VERIFICATION
      ? { "naver-site-verification": process.env.NEXT_PUBLIC_NAVER_VERIFICATION }
      : undefined,
  },
  robots: INDEXABLE_ROBOTS,
};

export function createPageMetadata({
  title,
  description,
  pathname,
  noIndex = false,
  openGraph,
}: PageMetadataOptions): Metadata {
  const ogImages = openGraph?.images && openGraph.images.length > 0 ? openGraph.images : OG_IMAGES;
  const ogTitle = openGraph?.title ?? title;
  const ogDescription = openGraph?.description ?? description;

  return {
    title,
    description,
    alternates: pathname ? { canonical: pathname } : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: openGraph?.url ?? toAbsoluteUrl(pathname),
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: openGraph?.type ?? "website",
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImages.map((img) => img.url),
    },
    robots: noIndex ? NO_INDEX_ROBOTS : undefined,
  };
}

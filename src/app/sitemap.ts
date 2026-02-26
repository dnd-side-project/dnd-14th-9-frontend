import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/constants/seo";

interface SessionListItem {
  sessionId: number;
  startTime: string;
}

interface SessionListApiResponse {
  result: {
    sessions: SessionListItem[];
  };
}

async function getPublicSessionUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const apiBase = process.env.NEXT_PUBLIC_BACKEND_API_BASE;
    if (!apiBase) return [];

    const res = await fetch(`${apiBase}/sessions?size=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];

    const data: SessionListApiResponse = await res.json();
    return data.result.sessions.map((session) => ({
      url: `${SITE_URL}/session/${session.sessionId}`,
      lastModified: new Date(session.startTime),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sessionUrls = await getPublicSessionUrls();

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    {
      url: `${SITE_URL}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...sessionUrls,
  ];
}

import type { Metadata } from "next";

import { sessionApi } from "@/features/session/api";
import { SessionPageContent } from "@/features/session/components/SessionPageContent";
import { createDynamicPageMetadata } from "@/lib/seo/metadata";

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({ params }: SessionPageProps): Promise<Metadata> {
  const { sessionId } = await params;

  try {
    const { result } = await sessionApi.getDetail(sessionId);
    return createDynamicPageMetadata({
      title: result.title,
      description: result.summary || `${result.category} 세션에 참여하세요.`,
      pathname: `/session/${sessionId}`,
      openGraph: {
        images: result.imageUrl ? [{ url: result.imageUrl }] : undefined,
      },
    });
  } catch {
    return createDynamicPageMetadata({
      title: "세션 상세",
      description: "모각작 세션 정보를 확인하세요.",
    });
  }
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;

  return <SessionPageContent sessionId={sessionId} />;
}

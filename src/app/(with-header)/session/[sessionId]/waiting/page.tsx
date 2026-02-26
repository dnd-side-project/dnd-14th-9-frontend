import { WaitingRoomContent } from "@/features/lobby/components/WaitingRoomContent";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "대기실",
  description: "세션 시작을 기다리는 중입니다.",
  noIndex: true,
});

interface WaitingRoomPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  const { sessionId } = await params;

  return <WaitingRoomContent sessionId={sessionId} />;
}

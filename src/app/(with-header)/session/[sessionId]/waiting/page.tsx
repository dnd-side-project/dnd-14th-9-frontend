import type { Metadata } from "next";

import { WaitingRoomContent } from "@/features/lobby/components/WaitingRoomContent";

export const metadata: Metadata = {
  title: "대기실",
  description: "세션 시작을 기다리는 중입니다.",
};

interface WaitingRoomPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  const { sessionId } = await params;

  return <WaitingRoomContent sessionId={sessionId} />;
}

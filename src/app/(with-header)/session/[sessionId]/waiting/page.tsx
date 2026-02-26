import { WaitingRoomContent } from "@/features/lobby/components/WaitingRoomContent";

export const metadata = { title: "대기실" };

interface WaitingRoomPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  const { sessionId } = await params;

  return <WaitingRoomContent sessionId={sessionId} />;
}

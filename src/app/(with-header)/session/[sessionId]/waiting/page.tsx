import { WaitingRoomContent } from "@/features/lobby/components/WaitingRoomContent";

interface WaitingRoomPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  const { sessionId } = await params;

  return <WaitingRoomContent sessionId={sessionId} />;
}

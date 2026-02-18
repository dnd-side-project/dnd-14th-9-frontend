import { CountdownBanner } from "@/features/lobby/components/CountdownBanner";
import { LobbyHeader } from "@/features/lobby/components/LobbyHeader";

interface WaitingRoomPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  const { sessionId } = await params;

  return (
    <main className="p-3xl mx-auto w-full max-w-7xl">
      <CountdownBanner />
      <LobbyHeader />
    </main>
  );
}

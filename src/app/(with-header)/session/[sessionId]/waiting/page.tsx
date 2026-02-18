import { CountdownBanner } from "@/features/lobby/components/CountdownBanner";
import { LobbyHeader } from "@/features/lobby/components/LobbyHeader";
import { SessionInfoCard } from "@/features/lobby/components/SessionInfoCard";

interface WaitingRoomPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function WaitingRoomPage({ params }: WaitingRoomPageProps) {
  const { sessionId } = await params;

  return (
    <>
      <div className="relative left-1/2 ml-[-50vw] w-screen">
        <CountdownBanner />
      </div>
      <LobbyHeader />
      <SessionInfoCard />
    </>
  );
}

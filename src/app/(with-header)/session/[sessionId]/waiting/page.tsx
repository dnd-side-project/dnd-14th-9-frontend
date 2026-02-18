import { CountdownBanner } from "@/features/lobby/components/CountdownBanner";
import { GoalAndTodoCard } from "@/features/lobby/components/GoalAndTodoCard";
import { LobbyHeader } from "@/features/lobby/components/LobbyHeader";
import { ParticipantListCard } from "@/features/lobby/components/ParticipantListCard";
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
      <div className="gap-3xl p-3xl flex flex-col">
        <LobbyHeader />
        <SessionInfoCard />
        <div className="gap-lg flex">
          <GoalAndTodoCard />
          <ParticipantListCard />
        </div>
      </div>
    </>
  );
}

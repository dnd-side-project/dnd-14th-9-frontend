import { SessionDetailSection } from "@/features/session/components/SessionDetailSection";
import { SessionGoalAndTodoCard } from "@/features/session/components/SessionGoalAndTodoCard";
import { SessionHeader } from "@/features/session/components/SessionHeader";
import { SessionParticipantListCard } from "@/features/session/components/SessionParticipantListCard";
import { SessionTimerSection } from "@/features/session/components/SessionTimerSection";

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

// TODO: 실제 API 연동 시 제거
const MOCK_SESSION_DETAIL = {
  thumbnailUrl: "/images/thumbnail-placeholder.svg",
  category: "개발",
  title: "함께 집중하는 코딩 세션",
  description: "함께 집중하며 각자의 프로젝트를 진행하는 세션입니다.",
  currentParticipants: 4,
  maxParticipants: 6,
  durationMinutes: 120,
  sessionDate: new Date(),
  notice: "카메라는 필수이며, 마이크는 선택입니다. 중간에 10분 휴식이 있습니다.",
};

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;

  return (
    <div className="p-3xl flex flex-col">
      <SessionHeader />
      <SessionDetailSection className="mt-xl" {...MOCK_SESSION_DETAIL} />
      <SessionTimerSection sessionId={sessionId} className="mt-xl" />
      <div className="gap-lg mt-xl flex">
        <SessionGoalAndTodoCard />
        <SessionParticipantListCard />
      </div>
    </div>
  );
}

import { sessionApi } from "@/features/session/api";
import { SessionDetailSection } from "@/features/session/components/SessionDetailSection";
import { SessionGoalAndTodoCard } from "@/features/session/components/SessionGoalAndTodoCard";
import { SessionHeader } from "@/features/session/components/SessionHeader";
import { SessionParticipantListCard } from "@/features/session/components/SessionParticipantListCard";
import { SessionTimerSection } from "@/features/session/components/SessionTimerSection";
import {
  mapInProgressToParticipantCard,
  type SessionParticipantCardViewModel,
} from "@/features/session/utils/mapInProgressToParticipantCard";

interface SessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function SessionPage({ params }: SessionPageProps) {
  const { sessionId } = await params;
  let participantCardData: SessionParticipantCardViewModel | undefined;
  let participantCardError: string | undefined;
  let sessionDetailData;

  try {
    const [inProgressResponse, detailResponse] = await Promise.all([
      sessionApi.getInProgress(sessionId),
      sessionApi.getDetail(sessionId),
    ]);
    participantCardData = mapInProgressToParticipantCard(inProgressResponse.result);
    sessionDetailData = detailResponse.result;
  } catch {
    participantCardError = "세션 정보를 불러오지 못했습니다.";
  }

  if (!sessionDetailData) {
    // 세부 정보를 불러오지 못한 경우 간단한 Fallback 또는 에러 UI 처리를 진행할 수 있습니다.
    return (
      <div className="p-3xl flex h-full flex-col items-center justify-center">
        <p className="text-gray-400">세션 정보를 불러오지 못했습니다.</p>
      </div>
    );
  }

  return (
    <div className="p-3xl flex flex-col">
      <SessionHeader sessionId={sessionId} />
      <SessionTimerSection sessionId={sessionId} className="mt-xl" />
      <SessionDetailSection
        className="mt-xl"
        thumbnailUrl={sessionDetailData.imageUrl ?? "/images/thumbnail-placeholder.svg"}
        category={sessionDetailData.category}
        title={sessionDetailData.title}
        description={sessionDetailData.summary}
        currentParticipants={sessionDetailData.currentParticipants}
        maxParticipants={sessionDetailData.maxParticipants}
        durationMinutes={sessionDetailData.sessionDurationMinutes}
        sessionDate={new Date(sessionDetailData.startTime)}
        notice={sessionDetailData.notice}
      />
      <div className="gap-lg mt-xl flex">
        <SessionGoalAndTodoCard />
        <SessionParticipantListCard data={participantCardData} error={participantCardError} />
      </div>
    </div>
  );
}

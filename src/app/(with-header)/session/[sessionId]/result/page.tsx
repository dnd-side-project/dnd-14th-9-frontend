"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import ActivitySummaryCard from "@/features/member/components/Profile/Report/ActivitySummaryCard";
import ReceivedEmojiCard from "@/features/member/components/Profile/Report/ReceivedEmojiCard";
import { SessionDetailSection } from "@/features/session/components/SessionDetailSection";
import { GoalAchievementSection } from "@/features/session/components/SessionResult/GoalAchievementSection";
import { ParticipantGoalSection } from "@/features/session/components/SessionResult/ParticipantGoalSection";
import { SessionResultHeader } from "@/features/session/components/SessionResult/SessionResultHeader";
import { useMemberReactionSSE } from "@/features/session/hooks/useMemberReactionSSE";
import {
  useMyReport,
  useSendReaction,
  useSessionDetail,
  useSessionReport,
} from "@/features/session/hooks/useSessionHooks";
import {
  mapEmojiKeyToType,
  mapEmojiResultToItems,
  mapMemberResultToActivitySummary,
  mapMyReportTodosToReportTodos,
  mapSessionDetailToProps,
  mapSessionReportMemberToParticipantProps,
} from "@/features/session/utils/reportMappers";

export default function SessionResultPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const { data: myReportData, isLoading: isMyReportLoading } = useMyReport(sessionId);
  const { data: sessionDetailData, isLoading: isDetailLoading } = useSessionDetail(sessionId);
  const { data: sessionReportData, isLoading: isReportLoading } = useSessionReport(sessionId);
  const sendReaction = useSendReaction();

  const memberResult = myReportData?.result?.sessionMemberResult;

  const { data: sseReactionData } = useMemberReactionSSE({
    sessionId,
    memberId: String(memberResult?.memberId ?? ""),
    enabled: !!memberResult?.memberId,
  });

  const isLoading = isMyReportLoading || isDetailLoading || isReportLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-text-secondary text-[16px]">리포트를 불러오는 중...</p>
      </div>
    );
  }

  const sessionDetail = sessionDetailData?.result;
  const sessionReport = sessionReportData?.result;

  if (!memberResult || !sessionDetail) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-text-secondary text-[16px]">리포트 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const activitySummary = mapMemberResultToActivitySummary(memberResult);
  const receivedEmojis = sseReactionData
    ? mapEmojiResultToItems(sseReactionData)
    : mapEmojiResultToItems(memberResult.emojiResult);
  const detailProps = mapSessionDetailToProps(sessionDetail);

  const task = memberResult.task;
  const goalAchievement = {
    goal: task?.goal ?? "",
    todoList: task ? mapMyReportTodosToReportTodos(task.todos) : [],
    todoAchievementRate: memberResult.achievementRate,
  };

  const participants = sessionReport?.members ?? [];
  const averageAchievementRate = sessionReport?.averageAchievementRate ?? 0;

  const handleEmojiClick = (
    emoji: "heart" | "thumbsUp" | "thumbsDown" | "star",
    targetMemberId: number
  ) => {
    sendReaction.mutate({
      sessionId,
      body: { targetMemberId, emojiType: mapEmojiKeyToType(emoji) },
    });
  };

  const handleGoHome = () => {
    router.push("/");
  };

  const handleViewParticipantsReport = () => {
    router.push(`/session/${sessionId}/reports`);
  };

  return (
    <div className="gap-lg p-3xl flex flex-col">
      {/* 섹션 1: 제목 */}
      <SessionResultHeader />

      {/* 섹션 2: 세션 디테일 */}
      <SessionDetailSection {...detailProps} />

      {/* 섹션 3: 나의 활동 요약 */}
      <div className="gap-lg flex">
        <ActivitySummaryCard data={activitySummary} />
        <ReceivedEmojiCard data={receivedEmojis} />
      </div>

      {/* 섹션 4: 나의 목표 달성 */}
      <GoalAchievementSection {...goalAchievement} />

      {/* 섹션 5: 참여자들의 목표 달성 요약 */}
      <section className="gap-lg border-border-subtle p-lg flex flex-col rounded-lg border">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-primary text-[24px] font-bold">참여자 목록</h2>
            <p className="text-text-secondary text-[16px]">이번 세션에 함께한 참여자들이에요</p>
          </div>
        </div>

        {/* 참여자 수 + 평균 목표 달성률 */}
        <div className="flex items-center justify-between">
          <span className="text-text-disabled text-[14px] font-semibold">
            총 {participants.length}명
          </span>
          <span className="text-text-secondary text-[14px]">
            평균 목표 달성률{" "}
            <span className="font-semibold text-green-600">{averageAchievementRate}%</span>
          </span>
        </div>

        {/* 참여자 목록 */}
        <ul className="gap-sm flex flex-col">
          {participants.map((member) => {
            const participantProps = mapSessionReportMemberToParticipantProps(member);
            return (
              <ParticipantGoalSection
                key={member.memberId}
                {...participantProps}
                onEmojiClick={(emoji) => handleEmojiClick(emoji, member.memberId)}
              />
            );
          })}
        </ul>
      </section>

      {/* 섹션 6: 버튼 영역 */}
      <section className="mt-2xl mb-3xl gap-md flex justify-center">
        <Button variant="outlined" colorScheme="secondary" size="large" onClick={handleGoHome}>
          홈으로
        </Button>
        <Button
          variant="solid"
          colorScheme="primary"
          size="large"
          onClick={handleViewParticipantsReport}
        >
          참여자 리포트 보기
        </Button>
      </section>
    </div>
  );
}

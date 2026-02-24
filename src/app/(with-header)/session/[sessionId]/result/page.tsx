import ActivitySummaryCard from "@/features/member/components/Profile/Report/ActivitySummaryCard";
import { sessionApi } from "@/features/session/api";
import { SessionDetailSection } from "@/features/session/components/SessionDetailSection";
import { GoalAchievementSection } from "@/features/session/components/SessionResult/GoalAchievementSection";
import { RealtimeReceivedEmojiCard } from "@/features/session/components/SessionResult/RealtimeReceivedEmojiCard";
import { ResultNavigationButtons } from "@/features/session/components/SessionResult/ResultNavigationButtons";
import { SessionResultHeader } from "@/features/session/components/SessionResult/SessionResultHeader";
import {
  mapEmojiResultToItems,
  mapMemberResultToActivitySummary,
  mapMyReportTodosToReportTodos,
  mapSessionDetailToProps,
} from "@/features/session/utils/reportMappers";

export default async function SessionResultPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const [myReportData, sessionDetailData] = await Promise.all([
    sessionApi.getMyReport(sessionId),
    sessionApi.getDetail(sessionId),
  ]);

  const memberResult = myReportData?.result?.sessionMemberResult;
  const sessionDetail = sessionDetailData?.result;

  if (!memberResult || !sessionDetail) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-text-secondary text-[16px]">리포트 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const activitySummary = mapMemberResultToActivitySummary(memberResult);
  const initialEmojis = mapEmojiResultToItems(memberResult.emojiResult);
  const detailProps = mapSessionDetailToProps(sessionDetail);

  const task = memberResult.task;
  const goalAchievement = {
    goal: task?.goal ?? "",
    todoList: task ? mapMyReportTodosToReportTodos(task.todos) : [],
    todoAchievementRate: memberResult.achievementRate,
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
        <RealtimeReceivedEmojiCard
          sessionId={sessionId}
          memberId={memberResult.memberId}
          initialEmojis={initialEmojis}
        />
      </div>

      {/* 섹션 4: 나의 목표 달성 */}
      <GoalAchievementSection {...goalAchievement} />

      {/* 섹션 5: 버튼 영역 */}
      <ResultNavigationButtons
        actions={[
          { label: "홈으로", href: "/", variant: "outlined", colorScheme: "secondary" },
          {
            label: "참여자 리포트 보기",
            href: `/session/${sessionId}/reports`,
            variant: "solid",
            colorScheme: "primary",
          },
        ]}
      />
    </div>
  );
}

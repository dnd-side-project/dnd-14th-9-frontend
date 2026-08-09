import ActivitySummaryCard from "@/features/member/components/Profile/Report/ActivitySummaryCard";
import { sessionApi } from "@/features/session/api";
import { SessionDetailSection } from "@/features/session/components/SessionDetailSection";
import { handleSessionNotFound } from "@/features/session/utils/handleSessionNotFound";
import {
  mapEmojiResultToItems,
  mapMemberResultToActivitySummary,
  mapMyReportTodosToReportTodos,
  mapSessionDetailToProps,
} from "@/features/session/utils/reportMappers";

import { GoalAchievementSection } from "./GoalAchievementSection";
import { RealtimeMemberEmojiCard } from "./RealtimeMemberEmojiCard";
import { ResultNavigationButtons } from "./ResultNavigationButtons";

interface SessionResultContentProps {
  sessionId: string;
}

export async function SessionResultContent({ sessionId }: SessionResultContentProps) {
  const [myReportResult, sessionDetailResult] = await Promise.allSettled([
    sessionApi.getMyReport(sessionId),
    sessionApi.getDetail(sessionId),
  ]);

  // 세션 상세의 404(삭제/미존재)를 먼저 판정해 not-found 페이지로 안내한다.
  if (sessionDetailResult.status === "rejected") {
    handleSessionNotFound(sessionDetailResult.reason);
  }
  if (myReportResult.status === "rejected") {
    throw myReportResult.reason;
  }

  const myReportData = myReportResult.value;
  const sessionDetailData = sessionDetailResult.value;

  const memberResult = myReportData?.result?.sessionMemberResult;
  const sessionDetail = sessionDetailData?.result;

  if (!memberResult || !sessionDetail) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-text-secondary text-base">리포트 데이터를 불러올 수 없습니다.</p>
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
    <>
      {/* 세션 디테일 */}
      <SessionDetailSection {...detailProps} />

      {/* 나의 활동 요약 */}
      <div className="gap-lg flex flex-col xl:flex-row">
        <ActivitySummaryCard
          data={activitySummary}
          title="나의 활동 요약"
          participationTimeLabel="전체 참여 시간"
          achievementRate={memberResult.achievementRate}
        />
        <RealtimeMemberEmojiCard sessionId={sessionId} initialEmojis={initialEmojis} />
      </div>

      {/* 나의 목표 달성 */}
      <GoalAchievementSection {...goalAchievement} />

      {/* 버튼 영역 */}
      <ResultNavigationButtons
        actions={[
          {
            label: "종료",
            href: "/",
            variant: "outlined",
            colorScheme: "secondary",
            replace: true,
          },
          {
            label: "참여자 리포트 보기",
            href: `/session/${sessionId}/reports`,
            variant: "solid",
            colorScheme: "primary",
          },
        ]}
      />
    </>
  );
}

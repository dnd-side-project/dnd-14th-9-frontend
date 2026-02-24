import ActivitySummaryCard from "@/features/member/components/Profile/Report/ActivitySummaryCard";
import { sessionApi } from "@/features/session/api";
import { SessionDetailSection } from "@/features/session/components/SessionDetailSection";
import {
  mapEmojiResultToItems,
  mapSessionDetailToProps,
  mapSessionReportMemberToParticipantProps,
  mapSessionReportToActivitySummary,
} from "@/features/session/utils/reportMappers";

import { ParticipantReactionList } from "./ParticipantReactionList";
import { RealtimeReceivedEmojiCard } from "./RealtimeReceivedEmojiCard";
import { ResultNavigationButtons } from "./ResultNavigationButtons";

interface ParticipantsReportContentProps {
  sessionId: string;
}

export async function ParticipantsReportContent({ sessionId }: ParticipantsReportContentProps) {
  const [myReportData, sessionDetailData, sessionReportData] = await Promise.all([
    sessionApi.getMyReport(sessionId),
    sessionApi.getDetail(sessionId),
    sessionApi.getReport(sessionId),
  ]);

  const memberResult = myReportData?.result?.sessionMemberResult;
  const sessionDetail = sessionDetailData?.result;
  const sessionReport = sessionReportData?.result;

  if (!memberResult || !sessionDetail) {
    return (
      <div className="flex min-h-100 items-center justify-center">
        <p className="text-text-secondary text-[16px]">리포트 데이터를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const activitySummary = sessionReport
    ? mapSessionReportToActivitySummary(sessionReport)
    : { focusedTime: 0, totalParticipationTime: 0, focusRate: 0 };
  const initialEmojis = mapEmojiResultToItems(memberResult.emojiResult);
  const detailProps = mapSessionDetailToProps(sessionDetail);

  const participants = (sessionReport?.members ?? []).map((member) => ({
    memberId: member.memberId,
    ...mapSessionReportMemberToParticipantProps(member),
  }));
  const averageAchievementRate = sessionReport?.averageAchievementRate ?? 0;

  return (
    <>
      {/* 세션 디테일 */}
      <SessionDetailSection {...detailProps} />

      {/* 활동 요약 */}
      <div className="gap-lg flex">
        <ActivitySummaryCard
          data={activitySummary}
          title="전체 활동 요약"
          focusedTimeLabel="평균 집중 시간"
          participationTimeLabel="평균 참여 시간"
          achievementRate={sessionReport?.averageAchievementRate ?? 0}
          achievementRateLabel="평균 목표 달성율"
        />
        <RealtimeReceivedEmojiCard
          sessionId={sessionId}
          memberId={memberResult.memberId}
          initialEmojis={initialEmojis}
        />
      </div>

      {/* 참여자 목록 */}
      <section className="gap-lg border-border-subtle p-lg flex flex-col rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-primary text-[24px] font-bold">참여자 목록</h2>
            <p className="text-text-secondary text-[16px]">이번 세션에 함께한 참여자들이에요</p>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-text-disabled text-[14px] font-semibold">
            총 {participants.length}명
          </span>
          <span className="text-text-secondary text-[14px]">
            평균 목표 달성률{" "}
            <span className="font-semibold text-green-600">{averageAchievementRate}%</span>
          </span>
        </div>
        <ParticipantReactionList sessionId={sessionId} participants={participants} />
      </section>

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
            label: "내 리포트 보기",
            href: `/session/${sessionId}/result`,
            variant: "solid",
            colorScheme: "primary",
          },
        ]}
      />
    </>
  );
}

import ActivitySummaryCard from "@/features/member/components/Profile/Report/ActivitySummaryCard";
import { sessionApi } from "@/features/session/api";
import { SessionDetailSection } from "@/features/session/components/SessionDetailSection";
import { ParticipantReactionList } from "@/features/session/components/SessionResult/ParticipantReactionList";
import { RealtimeReceivedEmojiCard } from "@/features/session/components/SessionResult/RealtimeReceivedEmojiCard";
import { ResultNavigationButtons } from "@/features/session/components/SessionResult/ResultNavigationButtons";
import { SessionResultHeader } from "@/features/session/components/SessionResult/SessionResultHeader";
import {
  mapEmojiResultToItems,
  mapSessionDetailToProps,
  mapSessionReportMemberToParticipantProps,
  mapSessionReportToActivitySummary,
} from "@/features/session/utils/reportMappers";

export default async function ParticipantsReportPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

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
    <div className="gap-lg p-3xl flex flex-col">
      {/* 섹션 1: 제목 */}
      <SessionResultHeader />

      {/* 섹션 2: 세션 디테일 */}
      <SessionDetailSection {...detailProps} />

      {/* 섹션 3: 나의 활동 요약 */}
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

      {/* 섹션 4: 참여자들의 목표 달성 요약 */}
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

      {/* 섹션 5: 버튼 영역 */}
      <ResultNavigationButtons
        actions={[
          { label: "종료", href: "/", variant: "outlined", colorScheme: "secondary" },
          {
            label: "내 리포트 보기",
            href: `/session/${sessionId}/result`,
            variant: "solid",
            colorScheme: "primary",
          },
        ]}
      />
    </div>
  );
}

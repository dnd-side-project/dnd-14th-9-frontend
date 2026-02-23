"use client";

import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import ActivitySummaryCard from "@/features/member/components/Profile/Report/ActivitySummaryCard";
import ReceivedEmojiCard from "@/features/member/components/Profile/Report/ReceivedEmojiCard";
import { SessionDetailSection } from "@/features/session/components/SessionDetailSection";
import { ParticipantGoalSection } from "@/features/session/components/SessionResult/ParticipantGoalSection";
import { SessionResultHeader } from "@/features/session/components/SessionResult/SessionResultHeader";

// TODO: API 연동 후 실제 데이터로 교체
const MOCK_SESSION_DETAIL = {
  thumbnailUrl: "/images/placeholder.png",
  category: "개발",
  title: "React 심화 학습 세션",
  description: "React의 고급 패턴과 최적화 기법을 함께 학습합니다.",
  currentParticipants: 5,
  maxParticipants: 10,
  durationMinutes: 120,
  sessionDate: new Date(),
  notice: "카메라는 선택사항입니다. 편하게 참여해주세요!",
};

// TODO: API 연동 후 실제 참여자 데이터로 교체
const MOCK_PARTICIPANTS = [
  {
    participantId: "1",
    participantName: "김개발",
    profileImageUrl: undefined,
    goal: "React 심화 학습하기",
    todoAchievementRate: 80,
    focusRate: 85,
  },
  {
    participantId: "2",
    participantName: "이코딩",
    profileImageUrl: undefined,
    goal: "TypeScript 마스터하기",
    todoAchievementRate: 100,
    focusRate: 92,
  },
  {
    participantId: "3",
    participantName: "박프론트",
    profileImageUrl: undefined,
    goal: "Next.js 앱 라우터 익히기",
    todoAchievementRate: 60,
    focusRate: 78,
  },
];

export default function ParticipantsReportPage() {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  const handleGoHome = () => {
    router.push("/");
  };

  const handleViewMyReport = () => {
    router.push(`/session/${sessionId}/result`);
  };

  // TODO: API 연동 - 이모지 전송
  const handleEmojiClick = () => {};

  return (
    <div className="gap-lg p-3xl flex flex-col">
      {/* 섹션 1: 제목 */}
      <SessionResultHeader />

      {/* 섹션 2: 세션 디테일 */}
      <SessionDetailSection {...MOCK_SESSION_DETAIL} />

      {/* 섹션 3: 나의 활동 요약 */}
      <div className="gap-lg flex">
        <ActivitySummaryCard />
        <ReceivedEmojiCard />
      </div>

      {/* 섹션 4: 참여자들의 목표 달성 요약 */}
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
            총 {MOCK_PARTICIPANTS.length}명
          </span>
          <span className="text-text-secondary text-[14px]">
            평균 목표 달성률{" "}
            <span className="font-semibold text-green-600">
              {Math.round(
                MOCK_PARTICIPANTS.reduce((acc, p) => acc + p.todoAchievementRate, 0) /
                  MOCK_PARTICIPANTS.length
              )}
              %
            </span>
          </span>
        </div>

        {/* 참여자 목록 */}
        <ul className="gap-sm flex flex-col">
          {MOCK_PARTICIPANTS.map((participant) => (
            <ParticipantGoalSection
              key={participant.participantId}
              participantName={participant.participantName}
              profileImageUrl={participant.profileImageUrl}
              goal={participant.goal}
              todoAchievementRate={participant.todoAchievementRate}
              focusRate={participant.focusRate}
              onEmojiClick={handleEmojiClick}
            />
          ))}
        </ul>
      </section>

      {/* 섹션 5: 버튼 영역 */}
      <section className="mt-2xl mb-3xl gap-md flex justify-center">
        <Button variant="outlined" colorScheme="secondary" size="large" onClick={handleGoHome}>
          그만두기
        </Button>
        <Button variant="solid" colorScheme="primary" size="large" onClick={handleViewMyReport}>
          내 리포트 보기
        </Button>
      </section>
    </div>
  );
}

import ActivitySummaryCard from "@/features/member/components/Profile/Report/ActivitySummaryCard";
import ReceivedEmojiCard from "@/features/member/components/Profile/Report/ReceivedEmojiCard";
import { SessionDetailSection } from "@/features/session/components/SessionDetailSection";
import {
  GoalAchievementSection,
  SessionResultHeader,
} from "@/features/session/components/SessionResult";

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

const MOCK_GOAL_ACHIEVEMENT = {
  goal: "React 심화 학습하기",
  todoList: [
    { todoId: "1", content: "useEffect 정리하기", isCompleted: true },
    { todoId: "2", content: "Server Component 학습", isCompleted: true },
    { todoId: "3", content: "상태 관리 비교", isCompleted: true },
    { todoId: "4", content: "React Query 연습", isCompleted: true },
    { todoId: "5", content: "성능 최적화 적용", isCompleted: false },
  ],
  todoAchievementRate: 80,
};

export default function SessionResultPage() {
  return (
    <div className="gap-lg p-3xl flex flex-col">
      {/* 섹션 1: 제목 */}
      <SessionResultHeader />

      {/* 섹션 2: 세션 디테일 */}
      <SessionDetailSection {...MOCK_SESSION_DETAIL} />

      {/* 섹션 3: 나의 활동 요약 */}
      <section className="gap-lg flex">
        <div className="flex-1">
          <ActivitySummaryCard />
        </div>
        <div className="flex-1">
          <ReceivedEmojiCard />
        </div>
      </section>

      {/* 섹션 4: 목표 달성 */}
      <GoalAchievementSection {...MOCK_GOAL_ACHIEVEMENT} />
    </div>
  );
}

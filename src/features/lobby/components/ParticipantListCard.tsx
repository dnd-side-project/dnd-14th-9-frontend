"use client";

import { useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { Badge } from "@/components/Badge/Badge";
import { Button } from "@/components/Button/Button";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { HostBadgeIcon } from "@/components/Icon/HostBadgeIcon";
import type { ReportTodoItem } from "@/features/session/types";

interface MockParticipant {
  memberId: string;
  nickname: string;
  profileImageUrl?: string;
  isHost: boolean;
  goal: string;
  achievementRate: number;
  focusTimeMinutes: number;
  todos: ReportTodoItem[];
}

const MOCK_MAX_PARTICIPANTS = 10;

const MOCK_PARTICIPANTS: MockParticipant[] = [
  {
    memberId: "1",
    nickname: "장근호",
    isHost: true,
    goal: "React 심화 학습",
    achievementRate: 85,
    focusTimeMinutes: 120,
    todos: [
      { todoId: "1", content: "useEffect 정리", isCompleted: true },
      { todoId: "2", content: "Server Component 학습", isCompleted: false },
    ],
  },
  {
    memberId: "2",
    nickname: "김민수",
    isHost: false,
    goal: "TypeScript 마스터",
    achievementRate: 70,
    focusTimeMinutes: 90,
    todos: [
      { todoId: "3", content: "제네릭 타입 학습", isCompleted: true },
      { todoId: "4", content: "유틸리티 타입 정리", isCompleted: false },
    ],
  },
  {
    memberId: "3",
    nickname: "이서연",
    isHost: false,
    goal: "Next.js 앱 라우터 학습",
    achievementRate: 90,
    focusTimeMinutes: 150,
    todos: [
      { todoId: "5", content: "라우팅 구조 파악", isCompleted: true },
      { todoId: "6", content: "서버 액션 구현", isCompleted: true },
    ],
  },
  {
    memberId: "4",
    nickname: "박지훈",
    isHost: false,
    goal: "CSS 애니메이션 연습",
    achievementRate: 60,
    focusTimeMinutes: 60,
    todos: [{ todoId: "7", content: "keyframe 애니메이션", isCompleted: false }],
  },
  {
    memberId: "5",
    nickname: "최유진",
    isHost: false,
    goal: "테스트 코드 작성",
    achievementRate: 75,
    focusTimeMinutes: 110,
    todos: [
      { todoId: "8", content: "Jest 기본 학습", isCompleted: true },
      { todoId: "9", content: "React Testing Library", isCompleted: false },
    ],
  },
  {
    memberId: "6",
    nickname: "정하늘",
    isHost: false,
    goal: "상태관리 라이브러리 비교",
    achievementRate: 80,
    focusTimeMinutes: 100,
    todos: [{ todoId: "10", content: "Zustand vs Jotai 비교", isCompleted: false }],
  },
];

export function ParticipantListCard() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = (memberId: string) => {
    setExpandedId((prev) => (prev === memberId ? null : memberId));
  };

  return (
    <div className="gap-lg border-gray p-lg flex flex-4 flex-col rounded-lg border">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-primary text-[24px] font-bold">참여자 목록</h2>
          <p className="text-text-secondary text-[16px]">이번 세션에서 함께할 참여자들이에요</p>
        </div>
        <Button variant="outlined" colorScheme="primary" size="medium">
          강퇴 하기
        </Button>
      </div>

      {/* 참여자 수 */}
      <span className="text-text-secondary text-[14px] font-semibold">
        총{" "}
        <span className="text-green-600">
          {MOCK_PARTICIPANTS.length}/{MOCK_MAX_PARTICIPANTS}
        </span>
        명
      </span>

      {/* 참여자 목록 */}
      <ul className="scrollbar-hide flex max-h-74 flex-col gap-2 overflow-y-auto">
        {MOCK_PARTICIPANTS.map((participant) => {
          const isExpanded = expandedId === participant.memberId;
          return (
            <li
              key={participant.memberId}
              className="bg-surface-strong border-border-subtle rounded-sm border"
            >
              <div className="p-sm flex items-center gap-3">
                {/* 프로필 이미지 */}
                <div className="relative shrink-0">
                  <Avatar
                    size="xlarge"
                    type={participant.profileImageUrl ? "image" : "empty"}
                    src={participant.profileImageUrl}
                    alt={participant.nickname}
                  />
                  {participant.isHost && (
                    <span className="absolute -right-0.5 -bottom-0.5">
                      <HostBadgeIcon />
                    </span>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-[16px] font-semibold text-gray-50">
                    {participant.nickname}
                  </span>
                  <span className="truncate text-[12px] font-bold text-gray-500">
                    {participant.goal}
                  </span>
                  <div className="flex gap-1">
                    <Badge status="recruiting" radius="max">
                      달성률 {participant.achievementRate}%
                    </Badge>
                    <Badge status="closing" radius="max">
                      집중 {participant.focusTimeMinutes}분
                    </Badge>
                  </div>
                </div>

                {/* 토글 버튼 */}
                <button
                  type="button"
                  className="shrink-0 cursor-pointer p-1"
                  onClick={() => handleToggle(participant.memberId)}
                  aria-label={isExpanded ? "할 일 접기" : "할 일 펼치기"}
                >
                  <ChevronDownIcon
                    size="medium"
                    className={`text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {/* 펼침 영역: Todo 목록 */}
              {isExpanded && participant.todos.length > 0 && (
                <ul className="border-border-subtle mx-sm mb-sm gap-xs flex flex-col border-t pt-2">
                  {participant.todos.map((todo) => (
                    <li key={todo.todoId} className="text-text-secondary text-[13px]">
                      {todo.isCompleted ? "✓" : "·"} {todo.content}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

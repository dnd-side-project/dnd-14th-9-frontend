"use client";

import { useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { ChatIcon } from "@/components/Icon/ChatIcon";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { HostBadgeIcon } from "@/components/Icon/HostBadgeIcon";
import type { ReportTodoItem } from "@/features/session/types";

import { ChatPopup } from "./ChatPopup";

interface MockParticipant {
  memberId: string;
  nickname: string;
  profileImageUrl?: string;
  isHost: boolean;
  goal: string;
  isFocusing: boolean;
  focusedSeconds: number;
  todos: ReportTodoItem[];
}

const MOCK_PARTICIPANTS: MockParticipant[] = [
  {
    memberId: "1",
    nickname: "장근호",
    isHost: true,
    goal: "React 심화 학습",
    isFocusing: true,
    focusedSeconds: 3720, // 1:02:00
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
    isFocusing: true,
    focusedSeconds: 2700, // 45:00
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
    isFocusing: false,
    focusedSeconds: 5400, // 1:30:00
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
    isFocusing: true,
    focusedSeconds: 1800, // 30:00
    todos: [{ todoId: "7", content: "keyframe 애니메이션", isCompleted: false }],
  },
  {
    memberId: "5",
    nickname: "최유진",
    isHost: false,
    goal: "테스트 코드 작성",
    isFocusing: false,
    focusedSeconds: 4200, // 1:10:00
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
    isFocusing: true,
    focusedSeconds: 3000, // 50:00
    todos: [{ todoId: "10", content: "Zustand vs Jotai 비교", isCompleted: false }],
  },
];

// 초를 MM:SS 또는 H:MM:SS 포맷으로 변환
function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

interface SessionParticipantListCardProps {
  className?: string;
}

export function SessionParticipantListCard({ className }: SessionParticipantListCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleToggle = (memberId: string) => {
    setExpandedId((prev) => (prev === memberId ? null : memberId));
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  return (
    <>
      <div
        className={`gap-lg border-gray p-lg flex h-157 flex-4 flex-col rounded-lg border ${className ?? ""}`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-primary text-[24px] font-bold">참여자 목록</h2>
            <p className="text-text-secondary text-[16px]">이번 세션에서 함께할 참여자들이에요</p>
          </div>
          {/* 채팅 아이콘 */}
          <button
            type="button"
            className="text-surface-primary-default flex size-10 cursor-pointer items-center justify-center rounded-xs bg-[#27EA671A] transition-colors hover:bg-[#27EA6733]"
            onClick={handleOpenChat}
            aria-label="채팅 열기"
          >
            <ChatIcon size="large" />
          </button>
        </div>

        {/* 참여자 수 + 평균 목표 달성률 */}
        {(() => {
          // 평균 목표 달성률 계산 (todo check 기반)
          const totalTodos = MOCK_PARTICIPANTS.reduce((acc, p) => acc + p.todos.length, 0);
          const completedTodos = MOCK_PARTICIPANTS.reduce(
            (acc, p) => acc + p.todos.filter((t) => t.isCompleted).length,
            0
          );
          const avgAchievementRate =
            totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

          return (
            <div className="flex items-center justify-between">
              <span className="text-text-disabled text-[14px] font-semibold">
                총 {MOCK_PARTICIPANTS.length}명
              </span>
              <span className="text-text-secondary text-[14px]">
                평균 목표 달성률{" "}
                <span className="font-semibold text-green-600">{avgAchievementRate}%</span>
              </span>
            </div>
          );
        })()}

        {/* 참여자 목록 */}
        <ul className="scrollbar-hide flex flex-1 flex-col gap-2 overflow-y-auto">
          {MOCK_PARTICIPANTS.map((participant) => {
            const isExpanded = expandedId === participant.memberId;
            const completedCount = participant.todos.filter((t) => t.isCompleted).length;
            return (
              <li
                key={participant.memberId}
                className="bg-surface-strong border-border-subtle rounded-sm border"
              >
                <div className="p-sm flex items-start gap-3">
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
                    <div className="mt-md flex items-center gap-2">
                      {/* 현재 상태 (집중 중 / 자리 비움) */}
                      <span
                        className={`flex items-center gap-1 text-[12px] ${
                          participant.isFocusing
                            ? "text-text-status-positive-default"
                            : "text-text-tertiary"
                        }`}
                      >
                        <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
                          <circle cx="3" cy="3" r="3" />
                        </svg>
                        {participant.isFocusing ? "집중 중" : "자리 비움"}
                      </span>

                      {/* 시간 (집중 중이면 배경색 있는 div로 감싸기) */}
                      {participant.isFocusing ? (
                        <span className="text-text-status-positive-default rounded-xs bg-cyan-500/10 px-1.5 py-0.5 text-[12px]">
                          {formatTime(participant.focusedSeconds)}
                        </span>
                      ) : (
                        <span className="text-text-tertiary text-[12px]">
                          {formatTime(participant.focusedSeconds)}
                        </span>
                      )}

                      {/* 목표 달성률 */}
                      <span className="text-text-disabled text-[12px]">|</span>
                      <span className="text-text-secondary text-[12px]">달성률</span>
                      <span className="px-xs py-2xs text-text-secondary rounded-xs bg-white/8 text-[12px]">
                        {Math.round(
                          (participant.todos.filter((t) => t.isCompleted).length /
                            participant.todos.length) *
                            100
                        ) || 0}
                        %
                      </span>
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

                {/* 펼침 영역: Todo 목록 (체크 표시 포함) */}
                {isExpanded && participant.todos.length > 0 && (
                  <div className="border-border-subtle mx-sm mb-sm gap-sm flex flex-col border-t pt-2">
                    <span className="text-text-secondary text-[13px] font-semibold">
                      To do list{" "}
                      <span className="text-green-600">
                        {completedCount}/{participant.todos.length}
                      </span>
                    </span>
                    <ul className="gap-xs flex flex-col">
                      {participant.todos.map((todo) => (
                        <li key={todo.todoId} className="flex items-center gap-2">
                          {/* 완료 상태 체크 표시 */}
                          <span
                            className={`flex size-5 shrink-0 items-center justify-center rounded-xs border ${
                              todo.isCompleted
                                ? "border-green-600 bg-[#27EA671A]"
                                : "border-border-subtle bg-surface-strong"
                            }`}
                          >
                            {todo.isCompleted && (
                              <CheckIcon size="small" className="text-green-600" />
                            )}
                          </span>
                          <span
                            className={`text-[13px] ${
                              todo.isCompleted ? "text-text-disabled line-through" : "text-gray-400"
                            }`}
                          >
                            {todo.content}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Floating 채팅 팝업 */}
      <ChatPopup isOpen={isChatOpen} onClose={handleCloseChat} />
    </>
  );
}

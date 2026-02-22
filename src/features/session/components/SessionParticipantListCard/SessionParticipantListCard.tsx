"use client";

import { useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { ChatIcon } from "@/components/Icon/ChatIcon";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { HostBadgeIcon } from "@/components/Icon/HostBadgeIcon";
import type { SessionParticipantCardViewModel } from "@/features/session/utils/mapInProgressToParticipantCard";

import { ChatPopup } from "./ChatPopup";

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
  data?: SessionParticipantCardViewModel;
  error?: string;
}

export function SessionParticipantListCard({
  className,
  data,
  error,
}: SessionParticipantListCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const members = data?.members ?? [];
  const participantCount = data?.participantCount ?? 0;
  const averageAchievementRate = data?.averageAchievementRate ?? 0;

  const handleToggle = (memberId: string) => {
    setExpandedId((prev) => (prev === memberId ? null : memberId));
  };

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  const showFallback = Boolean(error) || members.length === 0;
  const fallbackMessage = error ? error : "참여자가 없습니다.";

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
        <div className="flex items-center justify-between">
          <span className="text-text-disabled text-[14px] font-semibold">
            총 {participantCount}명
          </span>
          <span className="text-text-secondary text-[14px]">
            평균 목표 달성률{" "}
            <span className="font-semibold text-green-600">{averageAchievementRate}%</span>
          </span>
        </div>

        {/* 참여자 목록 */}
        {showFallback ? (
          <div className="text-text-muted flex flex-1 items-center justify-center text-sm">
            {fallbackMessage}
          </div>
        ) : (
          <ul className="scrollbar-hide flex flex-1 flex-col gap-2 overflow-y-auto">
            {members.map((participant) => {
              const isExpanded = expandedId === participant.memberId;

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

                        {/* 시간 */}
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
                          {participant.achievementRate}%
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
                          {participant.completedCount}/{participant.todos.length}
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
                                todo.isCompleted
                                  ? "text-text-disabled line-through"
                                  : "text-gray-400"
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
        )}
      </div>

      {/* Floating 채팅 팝업 */}
      <ChatPopup isOpen={isChatOpen} onClose={handleCloseChat} />
    </>
  );
}

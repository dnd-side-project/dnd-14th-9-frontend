"use client";

import { useRef, useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { Button } from "@/components/Button/Button";
import { ChatIcon } from "@/components/Icon/ChatIcon";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";

import { ChatDialog } from "../ChatDialog/ChatDialog";
import { useSessionChat } from "../ChatDialog/useSessionChat";

import type { InProgressMember } from "../../types";

interface SessionParticipantListCardProps {
  members?: InProgressMember[];
  participantCount?: number;
  averageAchievementRate?: number;
  className?: string;
  sessionId: string;
  isHost: boolean;
  myMemberId?: number;
  category: string;
  title: string;
  description: string;
  notice: string;
}

export function SessionParticipantListCard({
  members = [],
  participantCount = 0,
  averageAchievementRate = 0,
  className,
  sessionId,
  isHost,
  myMemberId,
  category,
  title,
  description,
  notice,
}: SessionParticipantListCardProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const chatButtonRef = useRef<HTMLButtonElement>(null);

  // 채팅 상태(소켓 연결·수신 기록)를 카드가 소유한다 — 다이얼로그를 닫아도
  // 연결과 기록이 유지되고, 닫혀 있는 동안 수신한 메시지도 보존된다.
  const chat = useSessionChat(sessionId);

  const handleToggle = (memberId: number) => {
    setExpandedId((prev) => (prev === memberId ? null : memberId));
  };

  return (
    <>
      <div
        className={`gap-lg border-gray p-lg flex h-auto flex-col rounded-lg border xl:h-157 xl:flex-4 ${className ?? ""}`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h2 className="text-text-primary text-2xl font-bold">참여자 목록</h2>
            <p className="text-text-secondary text-base">이번 세션에서 함께할 참여자들이에요</p>
          </div>
          <Button
            ref={chatButtonRef}
            variant="solid"
            colorScheme="primary"
            size="medium"
            iconOnly
            leftIcon={<ChatIcon />}
            aria-label="채팅 열기"
            className="rounded-max"
            onClick={() => setIsChatOpen(true)}
          />
        </div>

        {/* 참여자 수 + 평균 목표 달성률 */}
        <div className="flex items-center justify-between">
          <span className="text-text-disabled text-sm font-semibold">총 {participantCount}명</span>
          <span className="text-text-secondary text-sm">
            평균 목표 달성률{" "}
            <span className="font-semibold text-green-600">{averageAchievementRate}%</span>
          </span>
        </div>

        {/* 참여자 목록 */}
        <ul className="scrollbar-hide flex flex-1 flex-col gap-2 overflow-y-auto">
          {members.map((member) => {
            const isExpanded = expandedId === member.memberId;
            const todos = member.task?.todos ?? [];
            const completedCount = todos.filter((t) => t.isCompleted).length;
            const isFocusing = member.status === "FOCUSED";
            const isHost = member.role === "HOST";

            return (
              <li
                key={member.memberId}
                className="bg-surface-strong border-border-subtle rounded-sm border"
              >
                <div className="p-sm flex items-start gap-3">
                  {/* 프로필 이미지 */}
                  <Avatar
                    className="shrink-0"
                    size="xlarge"
                    type={member.profileImageUrl ? "image" : "empty"}
                    src={member.profileImageUrl}
                    alt={member.nickname}
                    showBadge={isHost}
                  />

                  {/* 정보 */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-base font-semibold text-gray-50">{member.nickname}</span>
                    <span className="truncate text-xs font-bold text-gray-500">
                      {member.task?.goal}
                    </span>
                    <div className="mt-md flex items-center gap-2">
                      {/* 현재 상태 (집중 중 / 자리 비움) */}
                      <span
                        className={`flex items-center gap-1 text-xs ${
                          isFocusing ? "text-text-status-positive-default" : "text-text-tertiary"
                        }`}
                      >
                        <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor">
                          <circle cx="3" cy="3" r="3" />
                        </svg>
                        {isFocusing ? "집중 중" : "자리 비움"}
                      </span>

                      {/* 목표 달성률 */}
                      <span className="text-text-disabled text-xs">|</span>
                      <span className="text-text-secondary text-xs">달성률</span>
                      <span className="px-xs py-2xs text-text-secondary rounded-xs bg-white/8 text-xs">
                        {member.achievementRate}%
                      </span>
                    </div>
                  </div>

                  {/* 토글 버튼 */}
                  <button
                    type="button"
                    className="shrink-0 cursor-pointer p-1"
                    onClick={() => handleToggle(member.memberId)}
                    aria-label={isExpanded ? "할 일 접기" : "할 일 펼치기"}
                  >
                    <ChevronDownIcon
                      size="medium"
                      className={`text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* 펼침 영역: Todo 목록 (체크 표시 포함) */}
                {isExpanded && todos.length > 0 && (
                  <div className="border-border-subtle mx-sm mb-sm gap-sm flex flex-col border-t pt-2">
                    <span className="text-text-secondary text-[13px] font-semibold">
                      To do list{" "}
                      <span className="text-green-600">
                        {completedCount}/{todos.length}
                      </span>
                    </span>
                    <ul className="gap-xs flex flex-col">
                      {todos.map((todo) => (
                        <li key={todo.subtaskId} className="flex items-center gap-2">
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

      {isChatOpen && (
        <ChatDialog
          chat={chat}
          isHost={isHost}
          myMemberId={myMemberId}
          category={category}
          title={title}
          description={description}
          notice={notice}
          participantCount={participantCount}
          members={members}
          onClose={() => {
            setIsChatOpen(false);
            chatButtonRef.current?.focus();
          }}
        />
      )}
    </>
  );
}

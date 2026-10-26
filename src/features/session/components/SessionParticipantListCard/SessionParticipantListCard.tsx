"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { Button } from "@/components/Button/Button";
import { ChipBadge } from "@/components/ChipBadge/ChipBadge";
import { ChatBubbleIcon } from "@/components/Icon/ChatBubbleIcon";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { formatHHMMSS } from "@/lib/utils/format";
import { cn } from "@/lib/utils/utils";

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
  const [hasMoreBelow, setHasMoreBelow] = useState(false);
  const chatButtonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // 채팅 상태(소켓 연결·수신 기록)를 카드가 소유한다 — 다이얼로그를 닫아도
  // 연결과 기록이 유지되고, 닫혀 있는 동안 수신한 메시지도 보존된다.
  const chat = useSessionChat(sessionId);

  const handleToggle = (memberId: number) => {
    setExpandedId((prev) => (prev === memberId ? null : memberId));
  };

  // 목록 아래에 아직 안 보이는 내용이 있을 때만 하단 그라데이션을 보여준다
  const updateScrollState = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setHasMoreBelow(list.scrollTop < list.scrollHeight - list.clientHeight - 1);
  }, []);

  // 참여자 수나 펼침 상태가 바뀌어 내용 길이가 달라질 때 다시 잰다
  useEffect(() => {
    updateScrollState();
  }, [updateScrollState, members, expandedId]);

  // 창 크기가 바뀌어 목록 영역 높이가 달라질 때(xl 경계 등) 다시 잰다
  useEffect(() => {
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState]);

  return (
    <>
      <div className={`gap-xl flex h-auto flex-col xl:h-157 xl:flex-4 ${className ?? ""}`}>
        {/* 헤더 */}
        <div className="gap-lg flex items-start">
          <div className="gap-2xs flex flex-1 flex-col leading-[1.4]">
            <h2 className="text-text-secondary text-2xl font-bold">참여자 목록</h2>
            <p className="text-text-disabled text-[15px]">
              다른 사용자의 집중 상태를 확인할 수 있어요
            </p>
          </div>
          <Button
            ref={chatButtonRef}
            variant="solid"
            colorScheme="primary"
            size="medium"
            iconOnly
            leftIcon={<ChatBubbleIcon size="small" />}
            aria-label="채팅 열기"
            className="!rounded-max"
            onClick={() => setIsChatOpen(true)}
          />
        </div>

        {/* 참여자 목록 카드 */}
        <div className="bg-surface-default border-border-subtle p-xl gap-sm flex min-h-0 flex-1 flex-col rounded-lg border shadow-[0_0_80px_rgba(0,0,0,0.3)]">
          {/* 평균 목표 달성률 + 참여자 수 */}
          <div className="flex items-center justify-between leading-[1.4]">
            <p className="gap-2xs flex items-center text-[13px]">
              <span className="text-text-muted">참여자 평균 목표 달성률</span>
              <span className="text-text-secondary font-semibold">{averageAchievementRate}%</span>
            </p>
            <span className="text-text-disabled text-xs">총 {participantCount}명</span>
          </div>

          {/* 참여자 목록 — 그라데이션은 스크롤 영역(ul)의 형제여야 내용과 함께 스크롤되지 않는다 */}
          <div className="relative min-h-0 flex-1">
            <ul
              ref={listRef}
              onScroll={updateScrollState}
              className="gap-sm flex h-full flex-col overflow-y-auto"
            >
              {members.map((member) => {
                const isExpanded = expandedId === member.memberId;
                const todos = member.task?.todos ?? [];
                const completedCount = todos.filter((t) => t.isCompleted).length;
                const isFocusing = member.status === "FOCUSED";
                const isHost = member.role === "HOST";

                return (
                  <li key={member.memberId} className="gap-xs flex flex-col">
                    <div className="bg-surface-strong p-md gap-md relative flex items-start rounded-lg">
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
                      <div className="gap-sm flex min-w-0 flex-1 flex-col">
                        <div className="gap-3xs flex flex-col">
                          {/* 오른쪽 위에 겹쳐 놓인 펼침 버튼(24px + 여백 8px)과 닉네임이 겹치지 않게 비운다 */}
                          <span className="text-text-primary pr-2xl text-base leading-[1.4] font-semibold">
                            {member.nickname}
                          </span>
                          <span className="text-text-muted truncate text-xs leading-[1.4]">
                            {member.task?.goal}
                          </span>
                        </div>

                        <div className="gap-sm flex items-center">
                          <span className="gap-xs flex items-center">
                            {/* 현재 상태 (집중 중 / 자리비움) */}
                            <span
                              className={cn(
                                "gap-xs flex shrink-0 items-center text-xs leading-[1.4] font-semibold whitespace-nowrap",
                                isFocusing
                                  ? "text-text-status-positive-default"
                                  : "text-text-tertiary"
                              )}
                            >
                              <svg
                                className={
                                  isFocusing
                                    ? "text-text-status-positive-default"
                                    : "text-text-disabled"
                                }
                                width="6"
                                height="6"
                                viewBox="0 0 6 6"
                                fill="currentColor"
                              >
                                <circle cx="3" cy="3" r="3" />
                              </svg>
                              {isFocusing ? "집중 중" : "자리비움"}
                            </span>

                            {/* 누적 집중 시간 — 값이 있을 때만 (집중 중 하늘색 / 자리비움 회색) */}
                            {typeof member.totalFocusSeconds === "number" && (
                              <ChipBadge
                                radius="xs"
                                status={isFocusing ? "positive" : "recruiting"}
                                className="leading-[1.4]"
                              >
                                {formatHHMMSS(member.totalFocusSeconds)}
                              </ChipBadge>
                            )}
                          </span>

                          <span
                            data-testid="status-divider"
                            aria-hidden="true"
                            className="bg-border-default h-[18px] w-px shrink-0"
                          />

                          {/* 투두 달성률 */}
                          <span className="gap-xs flex items-center">
                            <span className="text-text-tertiary shrink-0 text-xs leading-[1.4] font-semibold whitespace-nowrap">
                              투두 달성률
                            </span>
                            <ChipBadge radius="xs" className="leading-[1.4]">
                              {member.achievementRate}%
                            </ChipBadge>
                          </span>
                        </div>
                      </div>

                      {/* 토글 버튼 — 레이아웃 폭을 차지하지 않고 오른쪽 위에 겹쳐 놓는다 (Figma Dropdown Icon) */}
                      <button
                        type="button"
                        className="top-md right-md absolute flex size-6 cursor-pointer items-center justify-center"
                        onClick={() => handleToggle(member.memberId)}
                        aria-label={isExpanded ? "할 일 접기" : "할 일 펼치기"}
                      >
                        <ChevronDownIcon
                          size="medium"
                          className={`text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>

                    {/* 펼침 영역: 항목 아래 별도 카드로 Todo 목록 (Figma todo 변형) */}
                    {isExpanded && todos.length > 0 && (
                      <div className="bg-surface-strong p-lg gap-md flex flex-col rounded-lg">
                        <p className="gap-2xs flex items-center text-base leading-[1.4] font-semibold">
                          <span className="text-text-primary">투두리스트</span>
                          <span className="text-text-brand-subtler">
                            {completedCount}/{todos.length}
                          </span>
                        </p>
                        <ul className="gap-xs flex flex-col">
                          {todos.map((todo) => (
                            <li key={todo.subtaskId} className="p-2xs gap-sm flex items-center">
                              {/* 완료 상태 체크 표시 */}
                              <span
                                className={cn(
                                  "flex size-5 shrink-0 items-center justify-center rounded-xs border",
                                  todo.isCompleted
                                    ? "border-border-primary-default bg-surface-primary-alpha-subtle"
                                    : "border-border-strong"
                                )}
                              >
                                {todo.isCompleted && (
                                  <CheckIcon size="small" className="text-text-brand-default" />
                                )}
                              </span>
                              <span
                                className={cn(
                                  "text-[15px] leading-[1.4]",
                                  todo.isCompleted
                                    ? "text-text-muted line-through"
                                    : "text-text-secondary"
                                )}
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

            <div
              aria-hidden="true"
              data-testid="participants-bottom-gradient"
              className={cn(
                "from-surface-default pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t to-transparent transition-opacity duration-200 ease-out",
                hasMoreBelow ? "opacity-100" : "opacity-0"
              )}
            />
          </div>
        </div>
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

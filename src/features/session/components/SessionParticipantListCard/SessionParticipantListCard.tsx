"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button/Button";
import { ChatBubbleIcon } from "@/components/Icon/ChatBubbleIcon";
import { cn } from "@/lib/utils/utils";

import { ChatDialog } from "../ChatDialog/ChatDialog";
import { useSessionChat } from "../ChatDialog/useSessionChat";

import { SessionParticipantItem } from "./SessionParticipantItem";

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
      <div className={`gap-xl flex flex-col ${className ?? ""}`}>
        {/* 헤더 */}
        <div className="gap-lg flex items-start">
          <div className="gap-2xs flex flex-1 flex-col leading-[1.4]">
            <h2 className="text-text-secondary text-2xl leading-[1.4] font-bold">참여자 목록</h2>
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
              {members.map((member) => (
                <SessionParticipantItem
                  key={member.memberId}
                  member={member}
                  isExpanded={expandedId === member.memberId}
                  onToggle={() => handleToggle(member.memberId)}
                />
              ))}
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

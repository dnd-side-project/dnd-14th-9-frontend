"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button/Button";
import { ChatBubbleIcon } from "@/components/Icon/ChatBubbleIcon";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { useViewportLayout } from "@/hooks/useViewportLayout";
import { cn } from "@/lib/utils/utils";

import { ChatDialog } from "../ChatDialog/ChatDialog";
import { useSessionChat } from "../ChatDialog/useSessionChat";

import { SessionParticipantItem } from "./SessionParticipantItem";

import type { InProgressMember } from "../../types";

// 모바일에서 목록이 접혀 있을 때 보여주는 참여자 수 (Figma 모바일 시안)
const MOBILE_COLLAPSED_COUNT = 2;

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
  // 모바일 전용: 처음 2명만 보여주고 "더보기"로 펼친다 (태블릿부터는 560px 안에서 스크롤)
  const [isListExpanded, setIsListExpanded] = useState(false);
  const hasMobileHiddenMembers = members.length > MOBILE_COLLAPSED_COUNT;
  const isCollapsedOnMobile = hasMobileHiddenMembers && !isListExpanded;
  // 아바타 크기는 CSS로 못 바꾸므로(Figma lg/xl 변형) 모바일일 때만 40px을 쓴다
  const { layout } = useViewportLayout();
  const avatarSize = layout === "mobile" ? "large" : "xlarge";
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
      <div className={`gap-lg md:gap-xl flex flex-col ${className ?? ""}`}>
        {/* 헤더 */}
        <div className="gap-lg flex items-start">
          <div className="gap-3xs md:gap-2xs flex flex-1 flex-col leading-[1.4]">
            <h2 className="text-text-secondary text-base leading-[1.4] font-bold md:text-2xl">
              참여자 목록
            </h2>
            <p className="text-text-disabled text-[13px] md:text-[15px]">
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

        {/* 참여자 목록 카드 (모바일은 카드 껍데기 없이 펼쳐진다) */}
        <div className="gap-sm md:bg-surface-default md:border-border-subtle md:p-xl flex min-h-0 flex-1 flex-col md:rounded-lg md:border md:shadow-[0_0_80px_rgba(0,0,0,0.3)]">
          {/* 평균 목표 달성률 + 참여자 수 */}
          <div className="flex items-center justify-between leading-[1.4]">
            <p className="gap-2xs flex items-center text-[11px] md:text-[13px]">
              <span className="text-text-disabled md:text-text-muted">참여자 평균 목표 달성률</span>
              <span className="text-text-secondary font-semibold">{averageAchievementRate}%</span>
            </p>
            <span className="text-text-disabled text-[11px] md:text-xs">
              총 {participantCount}명
            </span>
          </div>

          {/* 참여자 목록 — 그라데이션은 스크롤 영역(ul)의 형제여야 내용과 함께 스크롤되지 않는다 */}
          <div className="relative min-h-0 flex-1">
            <ul
              ref={listRef}
              onScroll={updateScrollState}
              className="gap-sm flex h-full flex-col overflow-y-auto"
            >
              {members.map((member, index) => (
                <SessionParticipantItem
                  key={member.memberId}
                  member={member}
                  isExpanded={expandedId === member.memberId}
                  onToggle={() => handleToggle(member.memberId)}
                  avatarSize={avatarSize}
                  hiddenOnMobile={isCollapsedOnMobile && index >= MOBILE_COLLAPSED_COUNT}
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

            {/* 모바일 전용: 접힌 목록 아래 그라데이션과 더보기/숨기기 (Figma 모바일 시안) */}
            {isCollapsedOnMobile && (
              <div
                aria-hidden="true"
                data-testid="participants-more-gradient"
                className="from-surface-default pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-linear-to-t to-transparent md:hidden"
              />
            )}
            {hasMobileHiddenMembers && (
              <div className="mt-sm relative flex justify-center md:hidden">
                <Button
                  className="pl-xs"
                  variant="outlined"
                  colorScheme="secondary"
                  size="small"
                  leftIcon={
                    <ChevronDownIcon
                      size="xsmall"
                      className={isListExpanded ? "rotate-180" : undefined}
                    />
                  }
                  aria-expanded={isListExpanded}
                  onClick={() => setIsListExpanded((prev) => !prev)}
                >
                  {isListExpanded ? "숨기기" : "더보기"}
                </Button>
              </div>
            )}
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

"use client";

import { useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { Button } from "@/components/Button/Button";
import { ChipBadge } from "@/components/ChipBadge/ChipBadge";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { useKickMembers } from "@/features/session/hooks/useSessionHooks";
import { ApiError } from "@/lib/api/api-client";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { toast } from "@/lib/toast";

import { KickConfirmDialog } from "./KickConfirmDialog";

import type { WaitingMember } from "../types";

interface ParticipantListCardProps {
  sessionId: string;
  members: WaitingMember[];
  maxParticipants: number;
  isHost: boolean;
}

export function ParticipantListCard({
  sessionId,
  members,
  maxParticipants,
  isHost,
}: ParticipantListCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isKicking, setIsKicking] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [showKickDialog, setShowKickDialog] = useState(false);
  const [kickServerError, setKickServerError] = useState<string | null>(null);

  const kickMembersMutation = useKickMembers();

  const handleToggle = (memberId: string) => {
    setExpandedId((prev) => (prev === memberId ? null : memberId));
  };

  const handleStartKick = () => {
    setSelectedIds(new Set());
    setIsKicking(true);
  };

  const handleCancelKick = () => {
    setIsKicking(false);
    setSelectedIds(new Set());
  };

  const handleOpenKickDialog = () => {
    if (selectedIds.size === 0) return;
    setKickServerError(null);
    setShowKickDialog(true);
  };

  const handleCloseKickDialog = () => {
    setShowKickDialog(false);
    setKickServerError(null);
  };

  const handleConfirmKick = () => {
    setKickServerError(null);
    const memberIds = Array.from(selectedIds).map(Number);
    kickMembersMutation.mutate(
      { sessionId, memberIds },
      {
        onSuccess: () => {
          setShowKickDialog(false);
          setIsKicking(false);
          setSelectedIds(new Set());
          toast.success("강퇴 되었습니다.");
        },
        onError: (error) => {
          const message = error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
          setKickServerError(message);
        },
      }
    );
  };

  const handleSelectToggle = (memberId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  return (
    <div className="flex h-auto w-full flex-col xl:h-157 xl:flex-4">
      {/* 헤더 (테두리 없음) */}
      <div className="mb-md flex items-end justify-between gap-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-text-primary text-2xl font-bold">대기 인원 목록</h2>
          <p className="text-text-disabled text-[15px] break-keep">
            이번 세션에서 함께할 참여자들이에요
          </p>
        </div>
        {/* 우측: 강퇴 버튼(호스트) + 대기 인원 수 (우측 하단) */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          {isHost && !isKicking && (
            <Button
              variant="outlined"
              colorScheme="primary"
              size="medium"
              onClick={handleStartKick}
            >
              강퇴 하기
            </Button>
          )}
          <span className="text-text-disabled text-xs font-semibold">
            총 {members.length}/{maxParticipants}명
          </span>
        </div>
      </div>

      {/* 본문 (테두리) */}
      <div className="gap-lg border-gray p-lg flex min-h-0 flex-1 flex-col rounded-lg border">
        {/* 참여자 목록 */}
        <ul className="flex flex-col gap-2 overflow-y-auto xl:flex-1">
          {members.map((participant) => {
            const memberIdStr = String(participant.memberId);
            const isExpanded = expandedId === memberIdStr;
            const isSelected = selectedIds.has(memberIdStr);
            const isHost = participant.role === "HOST";
            const todos = participant.task?.todos ?? [];
            return (
              <li
                key={participant.memberId}
                className="bg-surface-default border-border-default rounded-sm border"
              >
                <div className="p-sm flex items-start gap-3">
                  {/* 강퇴 모드: 체크박스 */}
                  {isKicking && (
                    <button
                      type="button"
                      className={`mt-3 flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-xs border ${
                        isSelected
                          ? "border-green-600 bg-[#27EA671A]"
                          : "border-border-subtle bg-surface-strong"
                      }`}
                      onClick={() => handleSelectToggle(memberIdStr)}
                      aria-label={`${participant.nickname} 선택`}
                    >
                      {isSelected && <CheckIcon size="small" className="text-green-600" />}
                    </button>
                  )}

                  {/* 프로필 이미지 */}
                  <Avatar
                    className="shrink-0"
                    size="xlarge"
                    type={participant.profileImageUrl ? "image" : "empty"}
                    src={participant.profileImageUrl}
                    alt={participant.nickname}
                    showBadge={isHost}
                  />

                  {/* 정보 */}
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-base font-semibold text-gray-50">
                      {participant.nickname}
                    </span>
                    <span className="truncate text-xs font-bold text-gray-500">
                      {participant.task?.goal ?? ""}
                    </span>
                    <div className="mt-md flex items-center gap-2">
                      <span className="shrink-0 text-xs whitespace-nowrap text-gray-500">
                        달성도
                      </span>
                      <ChipBadge status="recruiting" radius="max">
                        {participant.achievementRate}%
                      </ChipBadge>
                      <span className="shrink-0 text-xs whitespace-nowrap text-gray-500">
                        집중도
                      </span>
                      <ChipBadge status="closing" radius="max">
                        {participant.focusRate}%
                      </ChipBadge>
                    </div>
                  </div>

                  {/* 토글 버튼 */}
                  <button
                    type="button"
                    className="shrink-0 cursor-pointer p-1"
                    onClick={() => handleToggle(memberIdStr)}
                    aria-label={isExpanded ? "할 일 접기" : "할 일 펼치기"}
                  >
                    <ChevronDownIcon
                      size="medium"
                      className={`text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>

                {/* 펼침 영역: Todo 목록 */}
                {isExpanded && todos.length > 0 && (
                  <div className="border-border-subtle mx-sm mb-sm gap-sm flex flex-col border-t pt-2">
                    <span className="text-text-secondary text-[13px] font-semibold">
                      To do list <span className="text-green-600">{todos.length}</span>
                    </span>
                    <ul className="gap-xs flex flex-col">
                      {todos.map((todo, index) => (
                        <li key={todo.subtaskId} className="flex items-center gap-2">
                          <span className="rounded-3xs bg-alpha-white-16 text-alpha-white-80 flex size-5 shrink-0 items-center justify-center text-[11px]">
                            {index + 1}
                          </span>
                          <span className="text-[13px] text-gray-400">{todo.content}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {/* 하단 버튼 (강퇴 모드) */}
        {isKicking && (
          <div className="flex gap-2">
            <Button
              variant="outlined"
              colorScheme="secondary"
              size="medium"
              className="flex-1"
              onClick={handleCancelKick}
            >
              그만두기
            </Button>
            <Button
              variant="solid"
              colorScheme="primary"
              size="medium"
              className="flex-1"
              onClick={handleOpenKickDialog}
              disabled={selectedIds.size === 0}
            >
              강퇴하기
            </Button>
          </div>
        )}
      </div>

      {showKickDialog && (
        <KickConfirmDialog
          onClose={handleCloseKickDialog}
          onConfirm={handleConfirmKick}
          isPending={kickMembersMutation.isPending}
          serverError={kickServerError}
        />
      )}
    </div>
  );
}

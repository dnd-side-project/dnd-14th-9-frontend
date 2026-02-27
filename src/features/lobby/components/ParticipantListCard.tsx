"use client";

import { useState } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { Badge } from "@/components/Badge/Badge";
import { Button } from "@/components/Button/Button";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { HostBadgeIcon } from "@/components/Icon/HostBadgeIcon";
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
}

export function ParticipantListCard({
  sessionId,
  members,
  maxParticipants,
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
    <div className="gap-lg border-gray p-lg flex h-157 flex-4 flex-col rounded-lg border">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-primary text-2xl font-bold">참여자 목록</h2>
          <p className="text-text-secondary text-base">이번 세션에서 함께할 참여자들이에요</p>
        </div>
        {!isKicking && (
          <Button variant="outlined" colorScheme="primary" size="medium" onClick={handleStartKick}>
            강퇴 하기
          </Button>
        )}
      </div>

      {/* 참여자 수 */}
      <span className="text-text-secondary text-sm font-semibold">
        총{" "}
        <span className="text-green-600">
          {members.length}/{maxParticipants}
        </span>
        명
      </span>

      {/* 참여자 목록 */}
      <ul className="scrollbar-hide flex flex-1 flex-col gap-2 overflow-y-auto">
        {members.map((participant) => {
          const memberIdStr = String(participant.memberId);
          const isExpanded = expandedId === memberIdStr;
          const isSelected = selectedIds.has(memberIdStr);
          const isHost = participant.role === "HOST";
          const todos = participant.task?.todos ?? [];
          return (
            <li
              key={participant.memberId}
              className="bg-surface-strong border-border-subtle rounded-sm border"
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
                <div className="relative shrink-0">
                  <Avatar
                    size="xlarge"
                    type={participant.profileImageUrl ? "image" : "empty"}
                    src={participant.profileImageUrl}
                    alt={participant.nickname}
                  />
                  {isHost && (
                    <span className="absolute -right-0.5 -bottom-0.5">
                      <HostBadgeIcon />
                    </span>
                  )}
                </div>

                {/* 정보 */}
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="text-base font-semibold text-gray-50">
                    {participant.nickname}
                  </span>
                  <span className="truncate text-xs font-bold text-gray-500">
                    {participant.task?.goal ?? ""}
                  </span>
                  <div className="mt-md flex items-center gap-2">
                    <span className="text-xs text-gray-500">달성도</span>
                    <Badge status="recruiting" radius="max">
                      {participant.achievementRate}%
                    </Badge>
                    <span className="text-xs text-gray-500">집중도</span>
                    <Badge status="closing" radius="max">
                      {participant.focusRate}%
                    </Badge>
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

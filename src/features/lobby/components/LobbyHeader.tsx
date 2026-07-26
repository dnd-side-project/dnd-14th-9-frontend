"use client";

import { useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { BookmarkFillIcon } from "@/components/Icon/BookmarkFillIcon";
import { BookmarkIcon } from "@/components/Icon/BookmarkIcon";
import { ChevronLeftIcon } from "@/components/Icon/ChevronLeftIcon";
import { EditIcon } from "@/components/Icon/EditIcon";
import { ExternalLinkIcon } from "@/components/Icon/ExternalLinkIcon";
import { LogoutIcon } from "@/components/Icon/LogoutIcon";
import { LeaveConfirmDialog } from "@/features/session/components/LeaveConfirmDialog";
import { useLeaveSessionHandler } from "@/features/session/hooks/useLeaveSessionHandler";
import { useShareSession } from "@/features/session/hooks/useShareSession";

interface LobbyHeaderProps {
  sessionId: string;
  showDialog: boolean;
  onShowDialog: () => void;
  onCloseDialog: () => void;
  isLeavingRef: React.MutableRefObject<boolean>;
  onLeavingChange?: (isLeaving: boolean) => void;
  /** 현재 사용자가 호스트인지 (수정 버튼 노출 여부) */
  isHost?: boolean;
  /** 호스트이면서 참여자가 없어 수정/삭제 가능한지 */
  canManageSession?: boolean;
  /** 수정 페이지 이동 시 대기방 이탈(leave) 호출을 막기 위한 세션 전환 플래그 */
  sessionTransitionRef?: React.RefObject<boolean>;
}

export function LobbyHeader({
  sessionId,
  showDialog,
  onShowDialog,
  onCloseDialog,
  isLeavingRef,
  onLeavingChange,
  isHost = false,
  canManageSession = false,
  sessionTransitionRef,
}: LobbyHeaderProps) {
  const router = useRouter();
  const leaveButtonRef = useRef<HTMLButtonElement>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { shareSession } = useShareSession();
  const { handleLeave, isPending, serverError } = useLeaveSessionHandler({
    sessionId,
    isLeavingRef,
    onCloseDialog,
    onLeaveFail: () => onLeavingChange?.(false),
  });

  return (
    <>
      <header className="mb-2xl gap-y-lg flex flex-wrap items-center gap-x-2 md:flex-nowrap">
        <div className="gap-lg flex flex-1 items-center">
          <button
            type="button"
            onClick={onShowDialog}
            aria-label="뒤로 가기"
            className="text-text-muted hover:text-text-secondary shrink-0 cursor-pointer transition-colors"
          >
            <ChevronLeftIcon size="medium" />
          </button>

          <div>
            <h1 className="text-2xl leading-[140%] font-bold text-gray-50">
              아직 세션 시작 전이에요
            </h1>
            <p className="mt-2xs text-base text-gray-500">
              세션은 시작 시간이 되면 자동으로 시작돼요.
            </p>
          </div>
        </div>

        <div className="flex gap-2 max-md:order-last max-md:basis-full max-md:justify-end">
          <Button
            iconOnly
            variant="ghost"
            colorScheme="secondary"
            size="small"
            onClick={() => shareSession(Number(sessionId))}
            aria-label="세션 링크 공유"
            leftIcon={<ExternalLinkIcon size="xsmall" />}
          />
          <Button
            iconOnly
            variant="ghost"
            colorScheme="secondary"
            size="small"
            onClick={() => setIsBookmarked((prev) => !prev)}
            aria-pressed={isBookmarked}
            aria-label={isBookmarked ? "북마크 해제" : "북마크"}
            leftIcon={
              isBookmarked ? <BookmarkFillIcon size="xsmall" /> : <BookmarkIcon size="xsmall" />
            }
          />
        </div>
        {isHost && (
          <div className="group relative">
            <Button
              variant="outlined"
              colorScheme="secondary"
              size="small"
              onClick={() => {
                // 수정 페이지로 이동해도 대기방 이탈(leave)이 호출되지 않도록 전환 플래그 설정
                if (sessionTransitionRef) sessionTransitionRef.current = true;
                router.push(`/session/${sessionId}/edit`);
              }}
              disabled={!canManageSession}
              leftIcon={<EditIcon size="xsmall" />}
              className="max-md:p-xs max-md:w-8 max-md:min-w-0"
            >
              <span className="max-md:hidden">수정</span>
            </Button>
            {!canManageSession && (
              <div className="pointer-events-none absolute top-full right-0 z-10 mt-1 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="rounded-sm bg-gray-700 px-3 py-2 text-xs whitespace-nowrap text-gray-200">
                  참여자가 있으면 수정할 수 없어요.
                </div>
              </div>
            )}
          </div>
        )}
        <Button
          ref={leaveButtonRef}
          variant="outlined"
          colorScheme="secondary"
          size="small"
          onClick={onShowDialog}
          leftIcon={<LogoutIcon size="xsmall" />}
          className="max-md:p-xs max-md:w-8 max-md:min-w-0"
        >
          <span className="max-md:hidden">나가기</span>
        </Button>
      </header>

      {showDialog && (
        <LeaveConfirmDialog
          description="나가기를 하면 대기 방에서 나가게 됩니다."
          onClose={() => {
            onCloseDialog();
            leaveButtonRef.current?.focus();
          }}
          onConfirm={() => {
            onLeavingChange?.(true);
            handleLeave();
          }}
          isPending={isPending}
          serverError={serverError}
        />
      )}
    </>
  );
}

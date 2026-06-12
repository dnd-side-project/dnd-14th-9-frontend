"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/Button/Button";
import { BookmarkFillIcon } from "@/components/Icon/BookmarkFillIcon";
import { BookmarkIcon } from "@/components/Icon/BookmarkIcon";
import { ChevronLeftIcon } from "@/components/Icon/ChevronLeftIcon";
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
}

export function LobbyHeader({
  sessionId,
  showDialog,
  onShowDialog,
  onCloseDialog,
  isLeavingRef,
  onLeavingChange,
}: LobbyHeaderProps) {
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

"use client";

import { useRef } from "react";

import { Button } from "@/components/Button/Button";
import { ChevronLeftIcon } from "@/components/Icon/ChevronLeftIcon";
import { LeaveConfirmDialog } from "@/features/session/components/LeaveConfirmDialog";
import { useLeaveSessionHandler } from "@/features/session/hooks/useLeaveSessionHandler";

interface LobbyHeaderProps {
  sessionId: string;
  showDialog: boolean;
  onShowDialog: () => void;
  onCloseDialog: () => void;
  isLeavingRef: React.MutableRefObject<boolean>;
  onLeaveStart: () => void;
}

export function LobbyHeader({
  sessionId,
  showDialog,
  onShowDialog,
  onCloseDialog,
  isLeavingRef,
  onLeaveStart,
}: LobbyHeaderProps) {
  const leaveButtonRef = useRef<HTMLButtonElement>(null);
  const { handleLeave, isPending, serverError } = useLeaveSessionHandler({
    sessionId,
    isLeavingRef,
    onCloseDialog,
  });

  return (
    <>
      <header className="mb-2xl flex items-start justify-between">
        <div className="gap-lg flex items-start">
          <button
            type="button"
            onClick={onShowDialog}
            aria-label="뒤로 가기"
            className="text-text-muted hover:text-text-secondary mt-1 shrink-0 cursor-pointer transition-colors"
          >
            <ChevronLeftIcon size="medium" />
          </button>

          <div>
            <h1 className="text-2xl leading-[140%] font-bold text-gray-50">세션 시작 대기 방</h1>
            <p className="mt-2xs text-base text-gray-500">
              세션 시작 전 대기 방이에요. 세션은 시간이 되면 자동 시작되요
            </p>
          </div>
        </div>

        <Button
          ref={leaveButtonRef}
          variant="outlined"
          colorScheme="secondary"
          size="small"
          onClick={onShowDialog}
        >
          나가기
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
            onLeaveStart();
            handleLeave();
          }}
          isPending={isPending}
          serverError={serverError}
        />
      )}
    </>
  );
}

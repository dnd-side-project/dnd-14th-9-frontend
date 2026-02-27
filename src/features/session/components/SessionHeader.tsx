"use client";

import { useRef } from "react";

import { Button } from "@/components/Button/Button";

import { useLeaveSessionHandler } from "../hooks/useLeaveSessionHandler";
import { clearTimerState } from "../hooks/useSessionTimer";

import { LeaveConfirmDialog } from "./LeaveConfirmDialog";

interface SessionHeaderProps {
  sessionId: string;
  showDialog: boolean;
  onShowDialog: () => void;
  onCloseDialog: () => void;
  isLeavingRef: React.MutableRefObject<boolean>;
}

export function SessionHeader({
  sessionId,
  showDialog,
  onShowDialog,
  onCloseDialog,
  isLeavingRef,
}: SessionHeaderProps) {
  const leaveButtonRef = useRef<HTMLButtonElement>(null);
  const { handleLeave, isPending, serverError } = useLeaveSessionHandler({
    sessionId,
    isLeavingRef,
    onCloseDialog,
    onBeforeNavigate: () => clearTimerState(sessionId),
  });

  return (
    <>
      <header className="mb-2xl flex items-start justify-between">
        <div>
          <h1 className="text-2xl leading-[140%] font-bold text-gray-50">진행 중인 세션</h1>
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
          description="나가기를 하면 진행 중인 세션에서 나가게 됩니다."
          onClose={() => {
            onCloseDialog();
            leaveButtonRef.current?.focus();
          }}
          onConfirm={handleLeave}
          isPending={isPending}
          serverError={serverError}
        />
      )}
    </>
  );
}

"use client";

import { useRef } from "react";

import { Button } from "@/components/Button/Button";
import { LogoutIcon } from "@/components/Icon/LogoutIcon";

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
      <header className="mb-2xl gap-md flex items-start justify-between">
        <div className="gap-2xs flex flex-1 flex-col">
          <h1 className="text-text-primary text-2xl leading-[1.4] font-bold">세션 진행 중!</h1>
          <p className="text-text-tertiary text-base leading-[1.4]">
            시간이 흐르고 있어요. 세션에 몰입해 보세요.
          </p>
        </div>

        <Button
          ref={leaveButtonRef}
          className="pr-sm"
          variant="outlined"
          colorScheme="secondary"
          size="medium"
          rightIcon={<LogoutIcon size="small" />}
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

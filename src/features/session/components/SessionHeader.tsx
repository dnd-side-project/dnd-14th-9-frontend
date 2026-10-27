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
      <header className="gap-md flex items-start justify-between">
        <div className="gap-3xs md:gap-2xs flex flex-1 flex-col">
          <h1 className="text-text-primary text-lg leading-[1.4] font-bold md:text-2xl">
            세션 진행 중!
          </h1>
          <p className="text-text-tertiary text-[13px] leading-[1.4] md:text-base">
            시간이 흐르고 있어요. 세션에 몰입해 보세요.
          </p>
        </div>

        {/* 모바일은 글자 없이 44px 아이콘 버튼 (Button iconOnly medium과 같은 값, 이름은 sr-only로 유지) */}
        <Button
          ref={leaveButtonRef}
          className="pr-sm max-md:p-sm max-md:size-11 max-md:min-w-0"
          variant="outlined"
          colorScheme="secondary"
          size="medium"
          rightIcon={<LogoutIcon size="small" />}
          onClick={onShowDialog}
        >
          <span className="max-md:sr-only">나가기</span>
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

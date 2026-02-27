"use client";

import { useState } from "react";

import { ApiError } from "@/lib/api/api-client";
import { DEFAULT_API_ERROR_MESSAGE } from "@/lib/error/error-codes";
import { navigateWithHardReload } from "@/lib/navigation/hardNavigate";
import { toast } from "@/lib/toast";

import { useLeaveSession } from "./useSessionHooks";

interface UseLeaveSessionHandlerOptions {
  sessionId: string;
  isLeavingRef: React.MutableRefObject<boolean>;
  onCloseDialog: () => void;
  onBeforeNavigate?: () => void;
}

export function useLeaveSessionHandler({
  sessionId,
  isLeavingRef,
  onCloseDialog,
  onBeforeNavigate,
}: UseLeaveSessionHandlerOptions) {
  const [serverError, setServerError] = useState<string | null>(null);
  const leaveSessionMutation = useLeaveSession();

  const handleLeave = async () => {
    setServerError(null);
    isLeavingRef.current = true;

    try {
      await leaveSessionMutation.mutateAsync({ sessionRoomId: sessionId });
      onBeforeNavigate?.();
      onCloseDialog();
      navigateWithHardReload("/");
    } catch (error: unknown) {
      isLeavingRef.current = false;
      const message = error instanceof ApiError ? error.message : DEFAULT_API_ERROR_MESSAGE;
      setServerError(message);
      toast.error(message);
    }
  };

  return {
    handleLeave,
    isPending: leaveSessionMutation.isPending,
    serverError,
  };
}

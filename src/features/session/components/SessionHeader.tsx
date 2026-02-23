"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";

import { useLeaveSession } from "../hooks/useSessionHooks";

interface SessionHeaderProps {
  sessionId: string;
}

export function SessionHeader({ sessionId }: SessionHeaderProps) {
  const router = useRouter();
  const leaveSessionMutation = useLeaveSession();

  const handleExit = () => {
    leaveSessionMutation.mutate(
      { sessionRoomId: sessionId },
      {
        onSuccess: () => {
          router.push("/");
        },
      }
    );
  };

  return (
    <header className="mb-2xl flex items-start justify-between">
      <div>
        <h1 className="text-[24px] leading-[140%] font-bold text-gray-50">진행 중인 세션</h1>
      </div>

      <Button
        variant="outlined"
        colorScheme="secondary"
        size="small"
        onClick={handleExit}
        disabled={leaveSessionMutation.isPending}
      >
        {leaveSessionMutation.isPending ? "나가는 중..." : "나가기"}
      </Button>
    </header>
  );
}

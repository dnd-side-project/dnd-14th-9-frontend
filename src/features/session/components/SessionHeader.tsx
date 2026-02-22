"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { useExitSession } from "@/features/session/hooks/useSessionHooks";

interface SessionHeaderProps {
  sessionId?: string;
}

export function SessionHeader({ sessionId }: SessionHeaderProps) {
  const router = useRouter();
  const { mutateAsync: exitSession } = useExitSession();

  const handleExit = async () => {
    if (sessionId) {
      try {
        await exitSession({ sessionRoomId: sessionId });
      } catch (error) {
        // TODO: Handle error properly
        console.error("Failed to exit session:", error);
      }
    }
    router.push("/");
  };

  return (
    <header className="mb-2xl flex items-start justify-between">
      <div>
        <h1 className="text-[24px] leading-[140%] font-bold text-gray-50">진행 중인 세션</h1>
      </div>

      <Button variant="outlined" colorScheme="secondary" size="small" onClick={handleExit}>
        나가기
      </Button>
    </header>
  );
}

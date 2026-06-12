import { SessionCardItem } from "./SessionCardItem";
import { SessionListErrorState } from "./SessionListErrorState";

import type { SessionListItem } from "../../types";

interface SessionListContentProps {
  sessions: SessionListItem[];
  isError: boolean;
  onRetry: () => void;
  onShareSession: (sessionId: number) => void;
}

export function SessionListContent({
  sessions,
  isError,
  onRetry,
  onShareSession,
}: SessionListContentProps) {
  if (isError) {
    return <SessionListErrorState onRetry={onRetry} />;
  }

  if (sessions.length === 0) {
    return (
      <div className="text-text-muted flex h-60 items-center justify-center text-sm">
        모집 중인 세션이 없습니다
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 xl:gap-y-12">
      {sessions.map((session) => (
        <SessionCardItem key={session.sessionId} session={session} onShare={onShareSession} />
      ))}
    </div>
  );
}

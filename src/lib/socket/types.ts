import type { Session, Participant, ParticipantStatus } from "@/features/session/types";
import type { TimerState } from "@/features/timer/types";

// TODO(장근호): 임시 error code union
export type SessionErrorCode =
  | "SESSION_NOT_FOUND"
  | "SESSION_ENDED"
  | "UNAUTHORIZED"
  | "ALREADY_STARTED"
  | "NOT_HOST"
  | "NOT_ALL_READY"
  | "TIME_NOT_REACHED"
  | "UNKNOWN";

export interface SessionError {
  code: SessionErrorCode;
  message: string;
}

export type SessionEvent = // 연결
  | {
      type: "connected";
      data: {
        session: Session;
        participants: Participant[];
      };
    }
  | { type: "error"; data: SessionError }

  // 참여자
  | { type: "participant:join"; data: Participant }
  | { type: "participant:leave"; data: { userId: string } }
  | { type: "participant:ready"; data: { userId: string; readyAt: string } }
  | { type: "participant:unready"; data: { userId: string } }
  | { type: "participant:goal"; data: { userId: string; goal: string } }
  | { type: "participant:status"; data: { userId: string; status: ParticipantStatus } }

  // 세션 상태
  | { type: "session:started"; data: { startedAt: string } }
  | { type: "session:ended"; data: { endedAt: string } }

  // 타이머
  | { type: "timer:update"; data: TimerState };

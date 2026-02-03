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

// 클라 -> 서버
export type SessionCommand =
  // 대기방
  | { type: "ready" }
  | { type: "unready" }
  | { type: "goal:set"; data: { goal: string } }

  // 호스트 전용
  | { type: "session:start" }
  | { type: "session:end" }

  // 진행 중
  | { type: "status:update"; data: { status: "working" | "break" } };

// 연결 상태
export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

// 이벤트 타입 추출 헬퍼
export type SessionEventType = SessionEvent["type"];
export type SessionCommandType = SessionCommand["type"];

// 특정 이벤트의 data 타입 추출
export type EventData<T extends SessionEventType> = Extract<SessionEvent, { type: T }>["data"];

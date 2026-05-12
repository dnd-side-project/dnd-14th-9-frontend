// 대기방 SSE 이벤트 관련 타입

export interface WaitingTodoItem {
  subtaskId: number;
  content: string;
}

export interface WaitingMemberTask {
  taskId: number;
  goal: string;
  todos: WaitingTodoItem[];
}

export interface WaitingMember {
  memberId: number;
  nickname: string;
  profileImageUrl?: string;
  focusRate: number;
  achievementRate: number;
  role: "HOST" | "PARTICIPANT";
  task: WaitingMemberTask | null;
}

export interface WaitingMembersEventData {
  participantCount: number;
  members: WaitingMember[];
}

// 강퇴 이벤트 데이터
export interface KickedEventData {
  memberIds: number[];
}

// waiting-members-updated SSE 이벤트 payload (discriminated union)
export type WaitingMembersSSEPayload =
  | { eventType: "ROOM_UPDATE"; data: WaitingMembersEventData }
  | { eventType: "KICKED"; data: KickedEventData };

// SSE 이벤트 타입 (discriminated union)
export type WaitingRoomSSEEvent =
  | { type: "waiting-members-updated"; data: WaitingMembersSSEPayload }
  | { type: "error"; data: { code: string; message: string } };

export type WaitingRoomSSEEventType = WaitingRoomSSEEvent["type"];

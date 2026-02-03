// TODO(장근호) - 서버 구성 확인 후 수정 작업 진행.
export type ParticipantStatus =
  | "joined" // 입장함 (아직 준비 안 함)
  | "ready" // 준비 완료
  | "working" // 작업 중 (세션 시작 후)
  | "break"; // 휴식 중 (세션 시작 후)

export interface Participant {
  member_id: string;
  nickname: string;
  profileImageUrl?: string;
  bio?: string; // 자기소개
  interest_category: string; // union type 변경
  socialProvider: "google" | "kakao";
  providerId: string;
  created_at: string;
  updated_at: string;
  // TODO(장근호): 하위 로직 논의
  //   isHost: boolean;
  //   status: ParticipantStatus;
  //   goal?: string;
  //   joinedAt: string;
  //   readyAt?: string; // 호스트는 joinedAt과 동일
}

export type SessionStatus = "waiting" | "active" | "ended";

export interface Session {
  session_room_id: string;
  category: string; // union 변경 필요.
  title: string;
  summary: string;
  notice: string;
  thumbnail_image_url?: string;
  max_capacity: number;
  status: SessionStatus;
  start_time: string; // 실제 시작 시간
  duration_minutes: number;
  member_id: string; // member_id 참조하여 참여인원 정보 가져옴.
  created_at: string;
  updated_at: string;
}

// TODO(장근호) - 검색 조건, response type 수정 예정.
export interface SessionFilter {
  keyword?: string;
  status?: SessionStatus;
  fromDate?: string;
  toDate?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

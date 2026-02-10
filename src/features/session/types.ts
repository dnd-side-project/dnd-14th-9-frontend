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

// ============================================
// 세션 목록 조회 API 관련 타입
// ============================================

// Enum 타입들 (변경 가능성 있음)
export type SessionCategory =
  | "ALL"
  | "DEVELOPMENT"
  | "DESIGN"
  | "PLAN&PM"
  | "CAREER"
  | "STUDY"
  | "CREATIVE"
  | "TEAMPROJECT"
  | "FREE";

export type SessionSort = "POPULAR" | "LATEST";

export type TimeSlot = "MORNING" | "AFTERNOON" | "EVENING";

export type DurationRange =
  | "HALF_TO_ONE_HOUR"
  | "TWO_TO_FOUR_HOURS"
  | "FIVE_TO_EIGHT_HOURS"
  | "TEN_PLUS_HOURS";

export type SessionListStatus = "대기" | "진행중";

// 목록 조회 파라미터
export interface SessionListParams {
  keyword?: string;
  category?: SessionCategory;
  sort?: SessionSort;
  startDate?: string;
  endDate?: string;
  timeSlots?: TimeSlot[];
  durationRange?: DurationRange;
  participants?: number;
  requiredFocusRate?: number;
  requiredAchievementRate?: number;
  page?: number;
  size?: number;
}

// 목록 아이템
export interface SessionListItem {
  category: string;
  title: string;
  hostNickname: string;
  status: SessionListStatus;
  currentParticipants: number;
  maxParticipants: number;
  sessionDurationMinutes: number;
  startTime: string;
  imageUrl: string;
}

// 목록 응답
export interface SessionListResponse {
  listSize: number;
  totalPage: number;
  totalElements: number;
  isFirst: boolean;
  isLast: boolean;
  sessions: SessionListItem[];
}

// ============================================
// 세션 상세 조회 API 관련 타입
// ============================================

// TODO(장근호): 서버 응답 확정 후 수정 필요
export type SessionDetailResponse = SessionListItem;

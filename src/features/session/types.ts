import type { Category, CategoryFilter } from "@/lib/constants/category";

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
  interest_category: Category;
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

// ============================================
// 세션 목록 조회 API 관련 타입
// ============================================

// Enum 타입들
export type SessionCategory = Category;

// 필터용 카테고리 (ALL 포함)
export type SessionCategoryFilter = CategoryFilter;

export type SessionSort = "POPULAR" | "LATEST" | "DEADLINE_APPROACHING";

export type TimeSlot = "MORNING" | "AFTERNOON" | "EVENING";

export type DurationRange =
  | "HALF_TO_ONE_HOUR"
  | "TWO_TO_FOUR_HOURS"
  | "FIVE_TO_EIGHT_HOURS"
  | "TEN_PLUS_HOURS";

export type SessionListStatus = "WAITING" | "IN_PROGRESS";

// 목록 조회 파라미터
export interface SessionListParams {
  keyword?: string;
  category?: SessionCategoryFilter;
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
  sessionId: number;
  category: SessionCategory;
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
// 세션 생성 API 관련 타입
// ============================================

// 세션 생성 요청
export interface CreateSessionRequest {
  title: string; // 제목 (최대 20자)
  summary: string; // 세션 요약 (최대 50자)
  notice: string; // 공지사항 (최대 100자)
  category: SessionCategory; // 카테고리
  startTime: string; // 시작 시간 (현재로부터 5분 이후)
  sessionDurationMinutes: number; // 세션 진행 시간 (분, 양수)
  maxParticipants: number; // 최대 참가 인원 (양수)
  requiredFocusRate?: number; // 최소 집중도 기준 (기본값 0)
  requiredAchievementRate?: number; // 최소 달성률 기준 (기본값 0)
}

// 세션 생성 응답
export interface CreateSessionResponse {
  createdSessionId: number;
}

// ============================================
// 세션 참여 API 관련 타입
// ============================================

// 세션 참여 Role
export type SessionRole = "HOST" | "PARTICIPANT";

// 세션 참여 응답
export interface JoinSessionResponse {
  sessionId: number; // 참여한 세션 ID
  memberId: number; // 참여한 멤버(본인) ID
  role: SessionRole; // 해당 세션에서의 본인의 Role
}

// ============================================
// 세션 목표 설정 API 관련 타입
// ============================================

// 세션 목표 설정 요청
// TODO(장근호): 서버 스펙 확정 후 수정 필요
export interface SetGoalRequest {
  goal: string; // 목표 (필수)
}

// 세션 목표 설정 응답
// TODO(장근호): 서버 응답 확정 후 수정 필요
export interface SetGoalResponse {
  goal: string; // 설정된 목표
}

// ============================================
// 세션 Todo 추가 API 관련 타입
// ============================================

// 세션 Todo 추가 요청
// TODO(장근호): 서버 스펙 확정 후 수정 필요
export interface AddTodosRequest {
  todos: string[]; // Todo 내용 목록 (필수)
}

// 세션 Todo 추가 응답
// TODO(장근호): 서버 응답 확정 후 수정 필요
export interface AddTodosResponse {
  todos: ReportTodoItem[]; // 추가된 Todo 목록
}

// ============================================
// 세션 Todo 완료 토글 API 관련 타입
// ============================================

// 세션 Todo 완료 토글 응답
// TODO(장근호): 서버 응답 확정 후 수정 필요
export interface ToggleTodoResponse {
  todoId: string;
  isCompleted: boolean; // 토글 후 완료 상태
}

// ============================================
// 세션 상세 조회 API 관련 타입
// ============================================

export interface SessionDetailResponse {
  sessionId: number;
  category: string; // 한글로 응답됨 (예: "개발")
  title: string;
  hostNickname: string;
  status: string; // 한글로 응답됨 (예: "대기")
  currentParticipants: number;
  maxParticipants: number;
  sessionDurationMinutes: number;
  startTime: string;
  imageUrl: string;
  summary: string;
  notice: string;
}

// ============================================
// 세션 리포트 조회 API 관련 타입
// ============================================

// 리포트 내 Todo 아이템
export interface ReportTodoItem {
  todoId: string;
  content: string;
  isCompleted: boolean;
}

// 리포트 내 참여자 정보
export interface ReportParticipant {
  memberId: string;
  nickname: string;
  profileImageUrl?: string;
  focusTimeMinutes: number;
  achievementRate: number;
}

// 리포트 응답
// TODO(장근호): 서버 응답 확정 후 수정 필요
export interface SessionReportResponse {
  sessionId: string;
  totalDurationMinutes: number; // 총 세션 시간
  focusTimeMinutes: number; // 집중 시간
  focusRate: number; // 집중률 (0-100)
  goal: string; // 목표
  todoList: ReportTodoItem[]; // todo 목록
  todoAchievementRate: number; // todo 달성률 (0-100)
  participants: ReportParticipant[]; // 참여자 정보
}

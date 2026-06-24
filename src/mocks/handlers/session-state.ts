import type {
  CreateSessionRequest,
  CreateSessionResponse,
  EmojiType,
  InProgressEventData,
  InProgressMemberStatus,
  JoinSessionRequest,
  JoinSessionResponse,
  MemberEmojiResult,
  MyReportResponse,
  SessionDetailResponse,
  SessionListParams,
  SessionListResponse,
  SessionReportResponse,
  SubmitSessionResultRequest,
  SubmitSessionResultResponse,
  ToggleMyStatusResponse,
  WaitingRoomResponse,
} from "@/features/session/types";
import type { CreateSubtaskItem, CreateSubtaskResponse } from "@/features/task/api";
import { getCategoryLabel, type Category } from "@/lib/constants/category";

const MOCK_MEMBER_ID = 1;
const MOCK_NICKNAME = "모각작러";

type MockSessionStatus = "WAITING" | "IN_PROGRESS" | "COMPLETED";

interface MockTodo {
  subtaskId: number;
  content: string;
  isCompleted: boolean;
}

interface MockMemberResult {
  totalFocusSeconds: number;
  overallSeconds: number;
}

interface MockSessionMember {
  memberId: number;
  nickname: string;
  profileImageUrl?: string;
  role: "HOST" | "PARTICIPANT";
  focusRate: number;
  achievementRate: number;
  status: InProgressMemberStatus;
  task: {
    taskId: number;
    goal: string;
    todos: MockTodo[];
  } | null;
  result?: MockMemberResult;
  emojiResult: MemberEmojiResult;
}

interface MockSessionRecord {
  sessionId: number;
  category: Category;
  title: string;
  hostNickname: string;
  status: MockSessionStatus;
  maxParticipants: number;
  sessionDurationMinutes: number;
  startTime: string;
  imageUrl: string;
  summary: string;
  notice: string;
  requiredFocusRate?: number;
  requiredAchievementRate?: number;
  members: MockSessionMember[];
}

let nextSessionId = 901;
let nextTaskId = 1000;
let nextSubtaskId = 5000;
let sessions = createInitialSessions();

export class MockSessionNotFoundError extends Error {
  constructor(sessionId: number) {
    super(`Mock session not found: ${sessionId}`);
    this.name = "MockSessionNotFoundError";
  }
}

export class MockTaskNotFoundError extends Error {
  constructor(taskId: number) {
    super(`Mock task not found: ${taskId}`);
    this.name = "MockTaskNotFoundError";
  }
}

export class MockSubtaskNotFoundError extends Error {
  constructor(subtaskId: number) {
    super(`Mock subtask not found: ${subtaskId}`);
    this.name = "MockSubtaskNotFoundError";
  }
}

export class MockMemberNotFoundError extends Error {
  constructor(memberId: number) {
    super(`Mock member not found: ${memberId}`);
    this.name = "MockMemberNotFoundError";
  }
}

function createInitialSessions(): MockSessionRecord[] {
  return [
    {
      sessionId: 900,
      category: "DEVELOPMENT",
      title: "같이 사이드 프로젝트 완성해봐요",
      hostNickname: MOCK_NICKNAME,
      status: "IN_PROGRESS",
      maxParticipants: 10,
      sessionDurationMinutes: 120,
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      imageUrl: "",
      summary: "각자 맡은 기능 구현 후 PR 올리기",
      notice: "마이크 켜도 됩니다. 편하게 오세요!",
      requiredFocusRate: 60,
      requiredAchievementRate: 50,
      members: [
        {
          memberId: MOCK_MEMBER_ID,
          nickname: MOCK_NICKNAME,
          role: "HOST",
          focusRate: 85,
          achievementRate: 60,
          status: "FOCUSED",
          task: {
            taskId: 1,
            goal: "MSW 로컬 mock 백엔드 완성하기",
            todos: [
              { subtaskId: 1, content: "세션 상세 mock 데이터 확인", isCompleted: true },
              { subtaskId: 2, content: "나의 목표 카드 UI 점검", isCompleted: true },
              { subtaskId: 3, content: "참여자 목록 10명 노출 확인", isCompleted: true },
              { subtaskId: 4, content: "할 일 완료 토글 동작 확인", isCompleted: false },
              { subtaskId: 5, content: "세션 종료 후 리포트 확인", isCompleted: false },
            ],
          },
          emojiResult: emptyEmojiResult(),
        },
        {
          memberId: 2,
          nickname: "기획하는 다람쥐",
          role: "PARTICIPANT",
          focusRate: 78,
          achievementRate: 40,
          status: "FOCUSED",
          task: {
            taskId: 2,
            goal: "서비스 플로우 문서 정리",
            todos: [
              { subtaskId: 6, content: "로그인 플로우 정리", isCompleted: true },
              { subtaskId: 7, content: "세션 생성 플로우 정리", isCompleted: false },
            ],
          },
          emojiResult: emptyEmojiResult(),
        },
        {
          memberId: 3,
          nickname: "디자인하는 고양이",
          role: "PARTICIPANT",
          focusRate: 92,
          achievementRate: 100,
          status: "FOCUSED",
          task: {
            taskId: 3,
            goal: "세션 화면 QA 체크리스트 만들기",
            todos: [
              { subtaskId: 8, content: "대기방 화면 캡처", isCompleted: true },
              { subtaskId: 9, content: "진행 중 화면 캡처", isCompleted: true },
            ],
          },
          emojiResult: emptyEmojiResult(),
        },
        {
          memberId: 4,
          nickname: "개발하는 판다",
          role: "PARTICIPANT",
          focusRate: 66,
          achievementRate: 50,
          status: "REST",
          task: {
            taskId: 4,
            goal: "API 응답 타입 점검",
            todos: [
              { subtaskId: 10, content: "session 타입 확인", isCompleted: true },
              { subtaskId: 11, content: "member 타입 확인", isCompleted: false },
            ],
          },
          emojiResult: emptyEmojiResult(),
        },
        {
          memberId: 5,
          nickname: "테스트하는 여우",
          role: "PARTICIPANT",
          focusRate: 73,
          achievementRate: 50,
          status: "FOCUSED",
          task: {
            taskId: 5,
            goal: "MSW 테스트 케이스 보강",
            todos: [
              { subtaskId: 12, content: "coverage 테스트 확인", isCompleted: true },
              { subtaskId: 13, content: "state 테스트 확인", isCompleted: false },
            ],
          },
          emojiResult: emptyEmojiResult(),
        },
        {
          memberId: 6,
          nickname: "문서쓰는 코알라",
          role: "PARTICIPANT",
          focusRate: 81,
          achievementRate: 0,
          status: "FOCUSED",
          task: {
            taskId: 6,
            goal: "README용 mock 사용법 초안 작성",
            todos: [
              { subtaskId: 14, content: "실행 명령어 정리", isCompleted: false },
              { subtaskId: 15, content: "reset API 설명 추가", isCompleted: false },
            ],
          },
          emojiResult: emptyEmojiResult(),
        },
        {
          memberId: 7,
          nickname: "리뷰하는 수달",
          role: "PARTICIPANT",
          focusRate: 88,
          achievementRate: 50,
          status: "FOCUSED",
          task: {
            taskId: 7,
            goal: "코드 리뷰 체크포인트 확인",
            todos: [
              { subtaskId: 16, content: "strict unhandled 정책 확인", isCompleted: true },
              { subtaskId: 17, content: "SSE 이벤트명 확인", isCompleted: false },
            ],
          },
          emojiResult: emptyEmojiResult(),
        },
        {
          memberId: 8,
          nickname: "집중하는 부엉이",
          role: "PARTICIPANT",
          focusRate: 95,
          achievementRate: 100,
          status: "FOCUSED",
          task: {
            taskId: 8,
            goal: "개인 작업 몰입하기",
            todos: [
              { subtaskId: 18, content: "핵심 작업 1 완료", isCompleted: true },
              { subtaskId: 19, content: "핵심 작업 2 완료", isCompleted: true },
            ],
          },
          emojiResult: emptyEmojiResult(),
        },
        {
          memberId: 9,
          nickname: "정리하는 햄스터",
          role: "PARTICIPANT",
          focusRate: 69,
          achievementRate: 50,
          status: "REST",
          task: {
            taskId: 9,
            goal: "회의 메모 정리",
            todos: [
              { subtaskId: 20, content: "논의 내용 요약", isCompleted: true },
              { subtaskId: 21, content: "후속 액션 정리", isCompleted: false },
            ],
          },
          emojiResult: emptyEmojiResult(),
        },
        {
          memberId: 10,
          nickname: "배포보는 라쿤",
          role: "PARTICIPANT",
          focusRate: 76,
          achievementRate: 0,
          status: "FOCUSED",
          task: {
            taskId: 10,
            goal: "로컬 QA 환경 확인",
            todos: [
              { subtaskId: 22, content: "mock mode 실행", isCompleted: false },
              { subtaskId: 23, content: "브라우저 플로우 확인", isCompleted: false },
            ],
          },
          emojiResult: emptyEmojiResult(),
        },
      ],
    },
  ];
}

function emptyEmojiResult(): MemberEmojiResult {
  return {
    heartCount: 0,
    starCount: 0,
    thumbsUpCount: 0,
    thumbsDownCount: 0,
  };
}

function toDetailStatus(status: MockSessionStatus): SessionDetailResponse["status"] {
  if (status === "WAITING") return "대기";
  if (status === "COMPLETED") return "종료";
  return "진행중";
}

function toListStatus(status: MockSessionStatus): "WAITING" | "IN_PROGRESS" {
  return status === "WAITING" ? "WAITING" : "IN_PROGRESS";
}

function getSessionOrThrow(sessionId: number): MockSessionRecord {
  const session = sessions.find((candidate) => candidate.sessionId === sessionId);
  if (!session) throw new MockSessionNotFoundError(sessionId);

  return session;
}

function getMemberOrDefault(session: MockSessionRecord): MockSessionMember {
  if (session.members[0]) return session.members[0];

  return {
    memberId: MOCK_MEMBER_ID,
    nickname: MOCK_NICKNAME,
    role: "HOST",
    focusRate: 0,
    achievementRate: 0,
    status: "FOCUSED",
    task: null,
    emojiResult: emptyEmojiResult(),
  };
}

function calculateAchievementRate(member: MockSessionMember): number {
  const todos = member.task?.todos ?? [];
  if (todos.length === 0) return 0;
  return Math.round((todos.filter((todo) => todo.isCompleted).length / todos.length) * 100);
}

function calculateFocusRate(result?: MockMemberResult): number {
  if (!result || result.overallSeconds <= 0) return 0;
  return Math.round((result.totalFocusSeconds / result.overallSeconds) * 100);
}

function applyMemberDerivedRates(member: MockSessionMember): MockSessionMember {
  const focusRate = calculateFocusRate(member.result);
  return {
    ...member,
    focusRate: focusRate || member.focusRate,
    achievementRate: calculateAchievementRate(member),
  };
}

export function resetMockSessions(): void {
  nextSessionId = 901;
  nextTaskId = 1000;
  nextSubtaskId = 5000;
  sessions = createInitialSessions();
}

export function createMockSession(body: CreateSessionRequest): CreateSessionResponse {
  const sessionId = nextSessionId++;
  sessions.unshift({
    sessionId,
    category: body.category,
    title: body.title,
    hostNickname: MOCK_NICKNAME,
    status: "WAITING",
    maxParticipants: body.maxParticipants,
    sessionDurationMinutes: body.sessionDurationMinutes,
    startTime: body.startTime,
    imageUrl: "",
    summary: body.summary,
    notice: body.notice,
    requiredFocusRate: body.requiredFocusRate,
    requiredAchievementRate: body.requiredAchievementRate,
    members: [],
  });

  return { createdSessionId: sessionId };
}

export function getMockSessionList(params: SessionListParams = {}): SessionListResponse {
  const keyword = params.keyword?.trim().toLowerCase();
  const page = Math.max((params.page ?? 1) - 1, 0);
  const size = params.size ?? 10;
  const filteredSessions = sessions.filter((session) => {
    const matchesKeyword = keyword
      ? `${session.title} ${session.summary}`.toLowerCase().includes(keyword)
      : true;
    const matchesCategory =
      params.category && params.category !== "ALL" ? session.category === params.category : true;
    return matchesKeyword && matchesCategory;
  });
  const pagedSessions = filteredSessions.slice(page * size, page * size + size);
  const totalPage = Math.ceil(filteredSessions.length / size);

  return {
    listSize: pagedSessions.length,
    totalPage,
    totalElements: filteredSessions.length,
    isFirst: page === 0,
    isLast: totalPage === 0 || page >= totalPage - 1,
    sessions: pagedSessions.map((session) => ({
      sessionId: session.sessionId,
      category: session.category,
      title: session.title,
      hostNickname: session.hostNickname,
      status: toListStatus(session.status),
      currentParticipants: session.members.length,
      maxParticipants: session.maxParticipants,
      sessionDurationMinutes: session.sessionDurationMinutes,
      startTime: session.startTime,
      imageUrl: session.imageUrl,
    })),
  };
}

export function getMockSessionDetail(sessionId: number): SessionDetailResponse {
  const session = getSessionOrThrow(sessionId);
  return {
    sessionId: session.sessionId,
    category: getCategoryLabel(session.category),
    title: session.title,
    hostNickname: session.hostNickname,
    status: toDetailStatus(session.status),
    currentParticipants: session.members.length,
    maxParticipants: session.maxParticipants,
    sessionDurationMinutes: session.sessionDurationMinutes,
    startTime: session.startTime,
    imageUrl: session.imageUrl,
    summary: session.summary,
    notice: session.notice,
    requiredFocusRate: session.requiredFocusRate,
    requiredAchievementRate: session.requiredAchievementRate,
  };
}

export function joinMockSession(sessionId: number, body: JoinSessionRequest): JoinSessionResponse {
  const session = getSessionOrThrow(sessionId);
  const existingMember = session.members.find((member) => member.memberId === MOCK_MEMBER_ID);
  const task = {
    taskId: existingMember?.task?.taskId ?? nextTaskId++,
    goal: body.goal,
    todos: body.todos.map((content) => ({
      subtaskId: nextSubtaskId++,
      content,
      isCompleted: false,
    })),
  };

  if (existingMember) {
    existingMember.task = task;
    existingMember.achievementRate = calculateAchievementRate(existingMember);
  } else {
    session.members.push({
      memberId: MOCK_MEMBER_ID,
      nickname: MOCK_NICKNAME,
      role: session.members.length === 0 ? "HOST" : "PARTICIPANT",
      focusRate: 0,
      achievementRate: 0,
      status: "FOCUSED",
      task,
      emojiResult: emptyEmojiResult(),
    });
  }

  const joinedMember = session.members.find((member) => member.memberId === MOCK_MEMBER_ID)!;
  return {
    sessionId: session.sessionId,
    memberId: joinedMember.memberId,
    role: joinedMember.role,
  };
}

export function getMockWaitingRoom(sessionId: number): WaitingRoomResponse {
  const session = getSessionOrThrow(sessionId);
  return {
    participantCount: session.members.length,
    members: session.members.map((member) => ({
      memberId: member.memberId,
      nickname: member.nickname,
      profileImageUrl: member.profileImageUrl,
      focusRate: member.focusRate,
      achievementRate: member.achievementRate,
      role: member.role,
      task: member.task
        ? {
            taskId: member.task.taskId,
            goal: member.task.goal,
            todos: member.task.todos.map((todo) => ({
              subtaskId: todo.subtaskId,
              content: todo.content,
            })),
          }
        : null,
    })),
  };
}

export function getMockInProgress(sessionId: number): InProgressEventData {
  const session = getSessionOrThrow(sessionId);
  if (session.status === "WAITING" && session.members.length > 0) {
    session.status = "IN_PROGRESS";
  }
  const members = session.members.map(applyMemberDerivedRates);
  const achievementSum = members.reduce((sum, member) => sum + member.achievementRate, 0);

  return {
    participantCount: members.length,
    averageAchievementRate: members.length ? Math.round(achievementSum / members.length) : 0,
    members: members.map((member) => ({
      memberId: member.memberId,
      nickname: member.nickname,
      profileImageUrl: member.profileImageUrl,
      role: member.role,
      achievementRate: member.achievementRate,
      status: member.status,
      task: member.task
        ? {
            taskId: member.task.taskId,
            goal: member.task.goal,
            todos: member.task.todos.map((todo) => ({ ...todo })),
          }
        : null,
    })),
  };
}

export function submitMockSessionResult(
  sessionId: number,
  body: SubmitSessionResultRequest
): SubmitSessionResultResponse {
  const session = getSessionOrThrow(sessionId);
  session.status = "COMPLETED";
  const member = getMemberOrDefault(session);
  member.result = {
    totalFocusSeconds: body.totalFocusSeconds,
    overallSeconds: body.overallSeconds,
  };
  member.focusRate = calculateFocusRate(member.result);
  member.achievementRate = calculateAchievementRate(member);
  if (!session.members.find((candidate) => candidate.memberId === member.memberId)) {
    session.members.push(member);
  }

  return { sessionId: session.sessionId };
}

export function getMockMyReport(sessionId: number): MyReportResponse {
  const session = getSessionOrThrow(sessionId);
  const member = applyMemberDerivedRates(getMemberOrDefault(session));
  return {
    sessionId: session.sessionId,
    currentParticipants: session.members.length,
    sessionMemberResult: {
      memberId: member.memberId,
      nickname: member.nickname,
      profileImageUrl: member.profileImageUrl,
      role: member.role,
      focusRate: member.focusRate,
      totalFocusSeconds: member.result?.totalFocusSeconds ?? 0,
      overallFocusSeconds: member.result?.overallSeconds ?? 0,
      achievementRate: member.achievementRate,
      task: member.task
        ? {
            taskId: member.task.taskId,
            goal: member.task.goal,
            todos: member.task.todos.map((todo) => ({ ...todo })),
          }
        : null,
      emojiResult: member.emojiResult,
    },
  };
}

export function getMockSessionReport(sessionId: number): SessionReportResponse {
  const session = getSessionOrThrow(sessionId);
  const members = session.members.map(applyMemberDerivedRates);
  const totalFocus = members.reduce(
    (sum, member) => sum + (member.result?.totalFocusSeconds ?? 0),
    0
  );
  const overall = members.reduce((sum, member) => sum + (member.result?.overallSeconds ?? 0), 0);
  const achievement = members.reduce((sum, member) => sum + member.achievementRate, 0);
  const focus = members.reduce((sum, member) => sum + member.focusRate, 0);
  const count = members.length || 1;

  return {
    averageTotalFocusSeconds: Math.round(totalFocus / count),
    averageOverallSeconds: Math.round(overall / count),
    averageAchievementRate: Math.round(achievement / count),
    averageFocusRate: Math.round(focus / count),
    members: members.map((member) => ({
      memberId: member.memberId,
      nickname: member.nickname,
      profileImageUrl: member.profileImageUrl,
      role: member.role,
      goal: member.task?.goal ?? "",
      focusRate: member.focusRate,
      achievementRate: member.achievementRate,
    })),
    emojiResult: members.reduce(
      (acc, member) => ({
        heartCount: acc.heartCount + member.emojiResult.heartCount,
        starCount: acc.starCount + member.emojiResult.starCount,
        thumbsUpCount: acc.thumbsUpCount + member.emojiResult.thumbsUpCount,
        thumbsDownCount: acc.thumbsDownCount + member.emojiResult.thumbsDownCount,
      }),
      emptyEmojiResult()
    ),
  };
}

export function sendMockReaction(
  sessionId: number,
  targetMemberId: number,
  emojiType: EmojiType
): { targetMemberId: number; emojiType: EmojiType; result: string } {
  const session = getSessionOrThrow(sessionId);
  const member = session.members.find((candidate) => candidate.memberId === targetMemberId);
  if (!member) throw new MockMemberNotFoundError(targetMemberId);

  if (emojiType === "HEART") member.emojiResult.heartCount += 1;
  if (emojiType === "STAR") member.emojiResult.starCount += 1;
  if (emojiType === "THUMBS_UP") member.emojiResult.thumbsUpCount += 1;
  if (emojiType === "THUMBS_DOWN") member.emojiResult.thumbsDownCount += 1;

  return { targetMemberId, emojiType, result: "SUCCESS" };
}

export function toggleMockMyStatus(sessionId: number): ToggleMyStatusResponse {
  const session = getSessionOrThrow(sessionId);
  const member = getMemberOrDefault(session);
  member.status = member.status === "FOCUSED" ? "REST" : "FOCUSED";
  return { currentStatus: member.status };
}

function findTask(taskId: number): MockSessionMember["task"] | null {
  for (const session of sessions) {
    const task = session.members.find((member) => member.task?.taskId === taskId)?.task;
    if (task) return task;
  }
  return null;
}

function findTodo(subtaskId: number): MockTodo | null {
  for (const session of sessions) {
    for (const member of session.members) {
      const todo = member.task?.todos.find((candidate) => candidate.subtaskId === subtaskId);
      if (todo) return todo;
    }
  }
  return null;
}

function getTaskOrThrow(taskId: number): NonNullable<MockSessionMember["task"]> {
  const task = findTask(taskId);
  if (!task) throw new MockTaskNotFoundError(taskId);

  return task;
}

function getTodoOrThrow(subtaskId: number): MockTodo {
  const todo = findTodo(subtaskId);
  if (!todo) throw new MockSubtaskNotFoundError(subtaskId);

  return todo;
}

export function updateMockTaskGoal(taskId: number, goalContent: string): void {
  getTaskOrThrow(taskId).goal = goalContent;
}

export function createMockSubtasks(
  taskId: number,
  subtasks: CreateSubtaskItem[]
): CreateSubtaskResponse {
  const task = getTaskOrThrow(taskId);

  const subtaskIds = subtasks.map((subtask) => {
    const subtaskId = nextSubtaskId++;
    task.todos.push({
      subtaskId,
      content: subtask.todoContent,
      isCompleted: false,
    });
    return subtaskId;
  });

  return { subtaskIds };
}

export function updateMockSubtask(subtaskId: number, todoContent: string): void {
  getTodoOrThrow(subtaskId).content = todoContent;
}

export function deleteMockSubtask(subtaskId: number): void {
  getTodoOrThrow(subtaskId);

  for (const session of sessions) {
    for (const member of session.members) {
      if (member.task) {
        member.task.todos = member.task.todos.filter((todo) => todo.subtaskId !== subtaskId);
      }
    }
  }
}

export function toggleMockSubtaskCompletion(subtaskId: number): void {
  const todo = getTodoOrThrow(subtaskId);
  todo.isCompleted = !todo.isCompleted;
}

export function leaveMockSession(sessionId: number): void {
  const session = getSessionOrThrow(sessionId);
  session.members = session.members.filter((member) => member.memberId !== MOCK_MEMBER_ID);
}

export function kickMockSessionMembers(sessionId: number, memberIds: number[]): void {
  const session = getSessionOrThrow(sessionId);
  for (const memberId of memberIds) {
    if (!session.members.some((member) => member.memberId === memberId)) {
      throw new MockMemberNotFoundError(memberId);
    }
  }

  session.members = session.members.filter((member) => !memberIds.includes(member.memberId));
}

import { http, HttpResponse } from "msw";

import type {
  InProgressEventData,
  SessionDetailResponse,
  WaitingRoomResponse,
} from "@/features/session/types";
import type { ApiSuccessResponse } from "@/types/shared/types";

// 브라우저 요청의 Referer 헤더에서 현재 페이지 URL의 ?scenario= 파라미터를 읽어 분기
// SSR(instrumentation.ts / msw/node)에서는 Referer가 없으므로 'default' 반환
function getScenario(request: Request): string {
  const referer = request.headers.get("referer") ?? "";
  try {
    return new URL(referer).searchParams.get("scenario") ?? "default";
  } catch {
    return "default";
  }
}

function ok<T>(result: T): ApiSuccessResponse<T> {
  return { isSuccess: true, code: "COMMON200", message: "OK", result };
}

// ============================================================
// Mock 데이터
// ============================================================

const MOCK_DETAIL: Record<string, SessionDetailResponse> = {
  default: {
    sessionId: 1,
    category: "개발",
    title: "같이 사이드 프로젝트 완성해봐요",
    hostNickname: "모각작러",
    status: "진행중",
    currentParticipants: 3,
    maxParticipants: 6,
    sessionDurationMinutes: 120,
    startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    imageUrl: "",
    summary: "각자 맡은 기능 구현 후 PR 올리기",
    notice: "마이크 켜도 됩니다. 편하게 오세요!",
    requiredFocusRate: 60,
    requiredAchievementRate: 50,
  },
  empty: {
    sessionId: 1,
    category: "개발",
    title: "혼자서 시작한 세션",
    hostNickname: "모각작러",
    status: "진행중",
    currentParticipants: 0,
    maxParticipants: 6,
    sessionDurationMinutes: 120,
    startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    imageUrl: "",
    summary: "참여자가 없는 empty state 확인용",
    notice: "",
  },
  ended: {
    sessionId: 1,
    category: "디자인",
    title: "종료된 세션입니다",
    hostNickname: "모각작러",
    status: "종료",
    currentParticipants: 4,
    maxParticipants: 6,
    sessionDurationMinutes: 90,
    startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    imageUrl: "",
    summary: "세션이 종료된 상태의 UI 확인용",
    notice: "",
  },
};

const MOCK_IN_PROGRESS: Record<string, InProgressEventData> = {
  default: {
    participantCount: 3,
    averageAchievementRate: 65,
    members: [
      {
        memberId: 1,
        nickname: "모각작러",
        profileImageUrl: undefined,
        role: "HOST",
        achievementRate: 80,
        status: "FOCUSED",
        task: {
          taskId: 1,
          goal: "MSW 핸들러 작성 완료하기",
          todos: [
            { subtaskId: 1, content: "session 핸들러 작성", isCompleted: true },
            { subtaskId: 2, content: "browser.ts 작성", isCompleted: false },
            { subtaskId: 3, content: "server.ts 작성", isCompleted: false },
          ],
        },
      },
      {
        memberId: 2,
        nickname: "열공러",
        profileImageUrl: undefined,
        role: "PARTICIPANT",
        achievementRate: 50,
        status: "REST",
        task: {
          taskId: 2,
          goal: "알고리즘 문제 5개 풀기",
          todos: [
            { subtaskId: 4, content: "BFS 문제 풀기", isCompleted: true },
            { subtaskId: 5, content: "DP 문제 풀기", isCompleted: false },
          ],
        },
      },
      {
        memberId: 3,
        nickname: "디자인러",
        profileImageUrl: undefined,
        role: "PARTICIPANT",
        achievementRate: 65,
        status: "FOCUSED",
        task: {
          taskId: 3,
          goal: "피그마 컴포넌트 정리",
          todos: [{ subtaskId: 6, content: "버튼 컴포넌트 정리", isCompleted: true }],
        },
      },
    ],
  },
  empty: {
    participantCount: 0,
    averageAchievementRate: 0,
    members: [],
  },
  ended: {
    participantCount: 4,
    averageAchievementRate: 72,
    members: [],
  },
};

const MOCK_WAITING_ROOM: Record<string, WaitingRoomResponse> = {
  default: {
    participantCount: 3,
    members: [
      {
        memberId: 1,
        nickname: "모각작러",
        profileImageUrl: undefined,
        focusRate: 85,
        achievementRate: 78,
        role: "HOST",
        task: {
          taskId: 1,
          goal: "MSW 핸들러 작성 완료하기",
          todos: [
            { subtaskId: 1, content: "session 핸들러 작성" },
            { subtaskId: 2, content: "browser.ts 작성" },
          ],
        },
      },
      {
        memberId: 2,
        nickname: "열공러",
        profileImageUrl: undefined,
        focusRate: 70,
        achievementRate: 60,
        role: "PARTICIPANT",
        task: null,
      },
      {
        memberId: 3,
        nickname: "디자인러",
        profileImageUrl: undefined,
        focusRate: 90,
        achievementRate: 88,
        role: "PARTICIPANT",
        task: {
          taskId: 3,
          goal: "피그마 컴포넌트 정리",
          todos: [{ subtaskId: 6, content: "버튼 컴포넌트 정리" }],
        },
      },
    ],
  },
  empty: {
    participantCount: 0,
    members: [],
  },
  ended: {
    participantCount: 4,
    members: [],
  },
};

// ============================================================
// 핸들러
// ============================================================

export const sessionHandlers = [
  // 세션 상세
  http.get("/api/sessions/:sessionId", ({ request, params }) => {
    const scenario = getScenario(request);

    if (scenario === "error") {
      return HttpResponse.json(
        {
          isSuccess: false,
          code: "INTERNAL_ERROR",
          message: "서버 오류가 발생했습니다.",
          result: null,
        },
        { status: 500 }
      );
    }

    const data = MOCK_DETAIL[scenario] ?? MOCK_DETAIL.default;
    return HttpResponse.json(
      ok({ ...data, sessionId: Number(params.sessionId) || data.sessionId })
    );
  }),

  // 진행 중 참여자 상태
  http.get("/api/sessions/:sessionId/in-progress", ({ request }) => {
    const scenario = getScenario(request);

    if (scenario === "error") {
      return HttpResponse.json(
        {
          isSuccess: false,
          code: "INTERNAL_ERROR",
          message: "서버 오류가 발생했습니다.",
          result: null,
        },
        { status: 500 }
      );
    }

    const data = MOCK_IN_PROGRESS[scenario] ?? MOCK_IN_PROGRESS.default;
    return HttpResponse.json(ok(data));
  }),

  // 대기방 참여자
  http.get("/api/sessions/:sessionId/waiting-room", ({ request }) => {
    const scenario = getScenario(request);

    if (scenario === "error") {
      return HttpResponse.json(
        {
          isSuccess: false,
          code: "INTERNAL_ERROR",
          message: "서버 오류가 발생했습니다.",
          result: null,
        },
        { status: 500 }
      );
    }

    const data = MOCK_WAITING_ROOM[scenario] ?? MOCK_WAITING_ROOM.default;
    return HttpResponse.json(ok(data));
  }),
];

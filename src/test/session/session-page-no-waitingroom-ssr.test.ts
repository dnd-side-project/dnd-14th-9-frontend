import { QueryClient } from "@tanstack/react-query";

import { sessionKeys, sessionQueries } from "@/features/session/hooks/useSessionHooks";
import type { SessionDetailResponse } from "@/features/session/types";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";
import type { ApiSuccessResponse } from "@/types/shared/types";

const mockGetSessionDetail = jest.fn();
const mockGetQueryClient = jest.fn();

jest.mock("@/features/session/server/get-session-detail", () => ({
  getSessionDetail: (...args: unknown[]) => mockGetSessionDetail(...args),
}));

jest.mock("@/lib/getQueryClient", () => ({
  getQueryClient: () => mockGetQueryClient(),
}));

jest.mock("@/features/session/components/SessionPageContent", () => ({
  SessionPageContent: () => null,
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/mocks/is-mock-mode-enabled", () => ({
  isMockModeEnabled: () => false,
}));

function createInProgressSession(sessionId: number): ApiSuccessResponse<SessionDetailResponse> {
  return {
    isSuccess: true,
    code: "COMMON200",
    message: "성공적으로 요청을 처리했습니다.",
    result: {
      sessionId,
      category: "개발",
      title: "진행 중 세션",
      hostNickname: "host",
      status: "진행중",
      currentParticipants: 1,
      maxParticipants: 6,
      sessionDurationMinutes: 60,
      startTime: "2026-08-22T10:00:00",
      imageUrl: "https://example.com/image.png",
      summary: "세션 요약",
      notice: "공지",
    },
  };
}

describe("SessionPage SSR waitingRoom invariant", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSessionDetail.mockReset();
    mockGetQueryClient.mockReset();
  });

  it("인증 쿠키가 있어도 waitingRoom을 서버에서 prefetch/self-hop 하지 않아야 한다", async () => {
    const { cookies } = await import("next/headers");
    jest.mocked(cookies).mockResolvedValue({
      get: jest.fn((name: string) => {
        if (name === ACCESS_TOKEN_COOKIE || name === REFRESH_TOKEN_COOKIE) {
          return { value: "present" };
        }
        return undefined;
      }),
    } as unknown as Awaited<ReturnType<typeof cookies>>);

    const sessionId = "42";
    mockGetSessionDetail.mockResolvedValue(createInProgressSession(42));

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const prefetchSpy = jest.spyOn(queryClient, "prefetchQuery").mockResolvedValue(undefined);
    mockGetQueryClient.mockReturnValue(queryClient);

    const { default: SessionPage } = await import("@/app/(with-header)/session/[sessionId]/page");
    await SessionPage({ params: Promise.resolve({ sessionId }) });

    const waitingRoomPrefetches = prefetchSpy.mock.calls.filter(([options]) => {
      const queryKey = (options as { queryKey?: unknown }).queryKey;
      return Array.isArray(queryKey) && queryKey[0] === "session" && queryKey[1] === "waitingRoom";
    });

    expect(waitingRoomPrefetches).toHaveLength(0);
    expect(prefetchSpy).not.toHaveBeenCalledWith(sessionQueries.waitingRoom(sessionId));
    expect(queryClient.getQueryData(sessionKeys.waitingRoom(sessionId))).toBeUndefined();
    expect(mockGetSessionDetail).toHaveBeenCalledWith(sessionId);
  });
});

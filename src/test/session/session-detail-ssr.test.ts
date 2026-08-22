import { dehydrate, QueryClient } from "@tanstack/react-query";

import { sessionKeys, sessionQueries } from "@/features/session/hooks/useSessionHooks";
import { getSessionDetail } from "@/features/session/server/get-session-detail";
import type { SessionDetailResponse } from "@/features/session/types";
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

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

jest.mock("@/mocks/is-mock-mode-enabled", () => ({
  isMockModeEnabled: () => true,
}));

function createSessionDetailResponse(sessionId: number): ApiSuccessResponse<SessionDetailResponse> {
  return {
    isSuccess: true,
    code: "COMMON200",
    message: "성공적으로 요청을 처리했습니다.",
    result: {
      sessionId,
      category: "개발",
      title: "테스트 세션",
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

describe("session detail SSR hydration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchQuery가 sessionQueries.detail queryKey에 데이터를 저장하고 dehydrate한다", async () => {
    const sessionId = "669";
    const response = createSessionDetailResponse(669);
    mockGetSessionDetail.mockResolvedValue(response);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    await queryClient.fetchQuery({
      ...sessionQueries.detail(sessionId),
      queryFn: () => getSessionDetail(sessionId),
    });

    expect(queryClient.getQueryData(sessionKeys.detail(sessionId))).toEqual(response);
    expect(mockGetSessionDetail).toHaveBeenCalledWith(sessionId);

    const dehydrated = dehydrate(queryClient);
    const hydratedQuery = dehydrated.queries.find(
      (query) =>
        Array.isArray(query.queryKey) &&
        query.queryKey[0] === "session" &&
        query.queryKey[1] === "detail" &&
        query.queryKey[2] === sessionId
    );

    expect(hydratedQuery?.state.data).toEqual(response);
  });

  it("generateMetadata와 SessionPage가 같은 loader를 사용하고 QueryClient에 detail을 넣는다", async () => {
    const sessionId = "669";
    const response = createSessionDetailResponse(669);
    mockGetSessionDetail.mockResolvedValue(response);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockGetQueryClient.mockReturnValue(queryClient);

    const { generateMetadata, default: SessionPage } =
      await import("@/app/(with-header)/session/[sessionId]/page");

    const params = Promise.resolve({ sessionId });
    await generateMetadata({ params });
    await SessionPage({ params });

    expect(mockGetSessionDetail).toHaveBeenCalledWith(sessionId);
    expect(queryClient.getQueryData(sessionKeys.detail(sessionId))).toEqual(response);

    const dehydrated = dehydrate(queryClient);
    expect(
      dehydrated.queries.some(
        (query) =>
          Array.isArray(query.queryKey) &&
          query.queryKey[0] === "session" &&
          query.queryKey[1] === "detail" &&
          query.queryKey[2] === sessionId
      )
    ).toBe(true);
  });
});

import { notFound, redirect } from "next/navigation";

import { dehydrate, QueryClient } from "@tanstack/react-query";

import { sessionKeys, sessionQueries } from "@/features/session/hooks/useSessionHooks";
import { getSessionDetail } from "@/features/session/server/get-session-detail";
import type { SessionDetailResponse } from "@/features/session/types";
import { ApiError } from "@/lib/api/api-client";
import { createPageMetadata } from "@/lib/seo/metadata";
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
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

jest.mock("@/mocks/is-mock-mode-enabled", () => ({
  isMockModeEnabled: () => true,
}));

const mockedNotFound = jest.mocked(notFound);
const mockedRedirect = jest.mocked(redirect);

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function createSessionDetailResponse(
  sessionId: number,
  title = "테스트 세션"
): ApiSuccessResponse<SessionDetailResponse> {
  return {
    isSuccess: true,
    code: "COMMON200",
    message: "성공적으로 요청을 처리했습니다.",
    result: {
      sessionId,
      category: "개발",
      title,
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

async function loadSessionPageModule() {
  return import("@/app/(with-header)/session/[sessionId]/page");
}

describe("session detail SSR hydration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSessionDetail.mockReset();
    mockGetQueryClient.mockReset();
  });

  it("fetchQuery가 sessionQueries.detail queryKey에 데이터를 저장하고 dehydrate한다", async () => {
    const sessionId = "669";
    const response = createSessionDetailResponse(669);
    mockGetSessionDetail.mockResolvedValue(response);

    const queryClient = createTestQueryClient();

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

    const queryClient = createTestQueryClient();
    mockGetQueryClient.mockReturnValue(queryClient);

    const { generateMetadata, default: SessionPage } = await loadSessionPageModule();

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

  it("generateMetadata returns fallback metadata when session detail fetch fails", async () => {
    mockGetSessionDetail.mockRejectedValue(new Error("session not found"));

    const { generateMetadata } = await loadSessionPageModule();
    const metadataPromise = generateMetadata({
      params: Promise.resolve({ sessionId: "669" }),
    });

    await expect(metadataPromise).resolves.toEqual(
      createPageMetadata({
        title: "세션 상세",
        description: "모각작 세션 정보를 확인하세요.",
      })
    );

    const metadata = await metadataPromise;
    expect(metadata.title).toBe("세션 상세");
    expect(metadata.description).toBe("모각작 세션 정보를 확인하세요.");
    expect(mockGetSessionDetail).toHaveBeenCalledWith("669");
    expect(mockedNotFound).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("SessionPage handles session detail fetch failure correctly", async () => {
    const error = new Error("session not found");
    mockGetSessionDetail.mockRejectedValue(error);

    const queryClient = createTestQueryClient();
    mockGetQueryClient.mockReturnValue(queryClient);

    const { default: SessionPage } = await loadSessionPageModule();

    await expect(SessionPage({ params: Promise.resolve({ sessionId: "669" }) })).rejects.toBe(
      error
    );
    expect(mockedNotFound).not.toHaveBeenCalled();
    expect(mockedRedirect).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(sessionKeys.detail("669"))).toBeUndefined();
  });

  it("SessionPage calls notFound when session detail fetch returns 404", async () => {
    mockGetSessionDetail.mockRejectedValue(new ApiError("session not found", 404));

    const queryClient = createTestQueryClient();
    mockGetQueryClient.mockReturnValue(queryClient);

    const { default: SessionPage } = await loadSessionPageModule();

    await expect(SessionPage({ params: Promise.resolve({ sessionId: "669" }) })).rejects.toThrow(
      "NEXT_NOT_FOUND"
    );
    expect(mockedNotFound).toHaveBeenCalledTimes(1);
    expect(mockedRedirect).not.toHaveBeenCalled();
  });

  it("different session ids should keep separate query cache", async () => {
    const responseA = createSessionDetailResponse(669, "session A");
    const responseB = createSessionDetailResponse(670, "session B");

    mockGetSessionDetail.mockImplementation((sessionId: unknown) => {
      if (sessionId === "669") return Promise.resolve(responseA);
      if (sessionId === "670") return Promise.resolve(responseB);
      return Promise.reject(new Error(`unexpected sessionId: ${String(sessionId)}`));
    });

    const queryClient = createTestQueryClient();
    mockGetQueryClient.mockReturnValue(queryClient);

    const { default: SessionPage } = await loadSessionPageModule();
    await SessionPage({ params: Promise.resolve({ sessionId: "669" }) });
    await SessionPage({ params: Promise.resolve({ sessionId: "670" }) });

    expect(sessionKeys.detail("669")).toEqual(["session", "detail", "669"]);
    expect(sessionKeys.detail("670")).toEqual(["session", "detail", "670"]);
    expect(queryClient.getQueryData(sessionKeys.detail("669"))).toEqual(responseA);
    expect(queryClient.getQueryData(sessionKeys.detail("670"))).toEqual(responseB);
    expect(queryClient.getQueryData(sessionKeys.detail("669"))).not.toEqual(
      queryClient.getQueryData(sessionKeys.detail("670"))
    );

    const dehydrated = dehydrate(queryClient);
    const queryA = dehydrated.queries.find(
      (query) =>
        Array.isArray(query.queryKey) &&
        query.queryKey[0] === "session" &&
        query.queryKey[1] === "detail" &&
        query.queryKey[2] === "669"
    );
    const queryB = dehydrated.queries.find(
      (query) =>
        Array.isArray(query.queryKey) &&
        query.queryKey[0] === "session" &&
        query.queryKey[1] === "detail" &&
        query.queryKey[2] === "670"
    );

    expect(queryA?.state.data).toEqual(responseA);
    expect(queryB?.state.data).toEqual(responseB);
    expect(mockGetSessionDetail).toHaveBeenCalledWith("669");
    expect(mockGetSessionDetail).toHaveBeenCalledWith("670");
  });
});

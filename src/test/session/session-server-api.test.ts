/**
 * @jest-environment node
 */

import type { SessionDetailResponse } from "@/features/session/types";
import type { ApiSuccessResponse } from "@/types/shared/types";

jest.mock("server-only", () => ({}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    get: (name: string) => (name === "accessToken" ? cookieStore.accessToken : undefined),
  })),
  headers: jest.fn(async () => ({
    get: () => null,
  })),
}));

const cookieStore: { accessToken?: { value: string } } = {};

function mockJsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

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

describe("sessionServerApi.getDetail", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    cookieStore.accessToken = undefined;
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_USE_MOCK = "false";
    process.env.BACKEND_API_BASE = "https://backend.example.com";
    process.env.FRONTEND_ORIGIN = "http://localhost:3000";
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  async function loadSessionServerApi() {
    const sessionServerApiModule = await import("@/features/session/server/api");
    return sessionServerApiModule.sessionServerApi;
  }

  it("Backend /sessions/:id를 호출하고 /api/sessions/:id는 호출하지 않는다", async () => {
    const payload = createSessionDetailResponse(101);
    const fetchMock = jest.fn().mockResolvedValue(mockJsonResponse(payload));
    global.fetch = fetchMock as typeof fetch;

    const sessionServerApi = await loadSessionServerApi();
    await expect(sessionServerApi.getDetail("101")).resolves.toEqual(payload);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example.com/sessions/101",
      expect.objectContaining({ method: "GET" })
    );

    const requestedUrls = fetchMock.mock.calls.map(([url]) => String(url));
    expect(requestedUrls.some((url) => url.includes("/api/sessions/"))).toBe(false);
  });

  it("프론트 origin의 /api/sessions/:id를 호출하면 테스트가 실패한다", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValue(mockJsonResponse(createSessionDetailResponse(101)));
    global.fetch = fetchMock as typeof fetch;

    const sessionServerApi = await loadSessionServerApi();
    await sessionServerApi.getDetail("101");

    expect(fetchMock).not.toHaveBeenCalledWith(
      "http://localhost:3000/api/sessions/101",
      expect.anything()
    );
  });

  it("404 ApiError를 그대로 던진다", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      mockJsonResponse(
        {
          isSuccess: false,
          code: "SESSION404",
          message: "세션을 찾을 수 없습니다.",
        },
        404
      )
    );
    global.fetch = fetchMock as typeof fetch;

    const sessionServerApi = await loadSessionServerApi();

    await expect(sessionServerApi.getDetail("404")).rejects.toEqual(
      expect.objectContaining({
        name: "ApiError",
        status: 404,
        message: "세션을 찾을 수 없습니다.",
      })
    );
  });

  it("인증 쿠키가 있으면 기존처럼 Authorization을 첨부한다", async () => {
    cookieStore.accessToken = { value: "test-access-token" };
    const fetchMock = jest
      .fn()
      .mockResolvedValue(mockJsonResponse(createSessionDetailResponse(101)));
    global.fetch = fetchMock as typeof fetch;

    const sessionServerApi = await loadSessionServerApi();
    await sessionServerApi.getDetail("101");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example.com/sessions/101",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-access-token",
        }),
      })
    );
  });
});

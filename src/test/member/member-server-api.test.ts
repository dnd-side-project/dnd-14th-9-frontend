/**
 * @jest-environment node
 */

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/cookie-constants";

jest.mock("server-only", () => ({}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(async () => ({
    get: (name: string) => (name === ACCESS_TOKEN_COOKIE ? cookieStore.accessToken : undefined),
  })),
  headers: jest.fn(async () => ({
    get: () => null,
  })),
}));

const cookieStore: { accessToken?: { value: string } } = {};

function mockJsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("memberServerApi report reads", () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    cookieStore.accessToken = { value: "test-access-token" };
    process.env = { ...originalEnv };
    process.env.NEXT_PUBLIC_USE_MOCK = "false";
    process.env.BACKEND_API_BASE = "https://backend.example.com";
    process.env.FRONTEND_ORIGIN = "http://localhost:3000";
  });

  afterEach(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it("리포트 통계와 이력은 백엔드로 직행하고 Authorization을 첨부한다", async () => {
    const fetchMock = jest.fn().mockImplementation(() =>
      Promise.resolve(
        mockJsonResponse({
          isSuccess: true,
          code: "COMMON200",
          message: "ok",
          result: {},
        })
      )
    );
    global.fetch = fetchMock as typeof fetch;

    const { memberServerApi } = await import("@/features/member/server/api");
    await memberServerApi.getReportStats();
    await memberServerApi.getReportSessions({ page: 2, size: 4 });

    const authorization = expect.objectContaining({
      Authorization: "Bearer test-access-token",
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://backend.example.com/members/me/report-stats",
      expect.objectContaining({ method: "GET", headers: authorization })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://backend.example.com/members/me/report-sessions?page=2&size=4",
      expect.objectContaining({ method: "GET", headers: authorization })
    );
  });

  it("me는 백엔드 /members/me/profile로 직행하고 Authorization을 첨부한다", async () => {
    const fetchMock = jest.fn().mockResolvedValue(
      mockJsonResponse({
        isSuccess: true,
        code: "COMMON200",
        message: "ok",
        result: { id: 1 },
      })
    );
    global.fetch = fetchMock as typeof fetch;

    const { memberServerApi } = await import("@/features/member/server/api");
    await memberServerApi.getMe();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://backend.example.com/members/me/profile",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          Authorization: "Bearer test-access-token",
        }),
      })
    );
  });
});

/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from "next/server";

import { api } from "@/lib/api/api";
import { forwardToBackend } from "@/lib/api/api-route-forwarder";

jest.mock("@/lib/api/api", () => ({
  api: {
    server: {
      request: jest.fn(),
    },
  },
}));

const mockedServerRequest = api.server.request as jest.MockedFunction<typeof api.server.request>;

function createJsonResponse(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function hasSetCookie(response: Response, matcher: (cookie: string) => boolean): boolean {
  return response.headers.getSetCookie().some(matcher);
}

describe("forwardToBackend", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("백엔드 응답을 그대로 반환해야 한다", async () => {
    mockedServerRequest.mockResolvedValueOnce(
      createJsonResponse({ isSuccess: true, result: { nickname: "A" } }, 200)
    );

    const request = new NextRequest("http://localhost:3000/api/members/me/profile", {
      headers: {
        cookie: "accessToken=old_access; refreshToken=old_refresh",
      },
    });

    const response = await forwardToBackend({
      request,
      method: "GET",
      pathWithQuery: "/members/me/profile",
      forwardRequestCookies: true,
    });

    expect(response.status).toBe(200);
    expect(mockedServerRequest).toHaveBeenCalledTimes(1);
  });

  it("401을 재시도 없이 그대로 반환해야 한다", async () => {
    mockedServerRequest.mockResolvedValueOnce(createJsonResponse({ code: "AUTH401_3" }, 401));

    const request = new NextRequest("http://localhost:3000/api/members/me/profile", {
      headers: {
        cookie: "accessToken=old_access; refreshToken=old_refresh",
      },
    });

    const response = await forwardToBackend({
      request,
      method: "GET",
      pathWithQuery: "/members/me/profile",
      forwardRequestCookies: true,
    });

    expect(response.status).toBe(401);
    expect(mockedServerRequest).toHaveBeenCalledTimes(1);
  });

  it("로그아웃 성공 시 인증 쿠키를 정리해야 한다", async () => {
    mockedServerRequest.mockResolvedValueOnce(
      createJsonResponse({ isSuccess: true, result: null }, 200)
    );

    const request = new NextRequest("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: {
        cookie: "accessToken=old_access; refreshToken=old_refresh",
      },
    });

    const response = await forwardToBackend({
      request,
      method: "POST",
      pathWithQuery: "/auth/logout",
      clearAuthCookiesOnSuccess: true,
      forwardRequestCookies: true,
    });

    expect(response.status).toBe(200);
    expect(mockedServerRequest).toHaveBeenCalledTimes(1);
    expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
    expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
  });
});

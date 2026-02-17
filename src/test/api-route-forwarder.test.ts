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

  it("401이면 refresh 후 원요청을 1회 재시도해야 한다", async () => {
    mockedServerRequest
      .mockResolvedValueOnce(createJsonResponse({ code: "AUTH401_3" }, 401))
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            result: {
              accessToken: "new_access",
              refreshToken: "new_refresh",
            },
          },
          200
        )
      )
      .mockResolvedValueOnce(createJsonResponse({ isSuccess: true, result: { nickname: "A" } }, 200));

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
    expect(mockedServerRequest).toHaveBeenCalledTimes(3);
    expect(mockedServerRequest).toHaveBeenNthCalledWith(
      2,
      "POST",
      "/auth/refresh",
      undefined,
      expect.objectContaining({
        headers: { Cookie: "refreshToken=old_refresh" },
        throwOnHttpError: false,
        skipAuth: true,
      })
    );
    expect(mockedServerRequest).toHaveBeenNthCalledWith(
      3,
      "GET",
      "/members/me/profile",
      undefined,
      expect.objectContaining({
        headers: { Cookie: "accessToken=new_access; refreshToken=new_refresh" },
        throwOnHttpError: false,
        skipAuth: true,
      })
    );
    expect(hasSetCookie(response, (cookie) => cookie.includes("accessToken=new_access"))).toBe(true);
    expect(hasSetCookie(response, (cookie) => cookie.includes("refreshToken=new_refresh"))).toBe(true);
  });

  it("refresh 실패 시 인증 쿠키를 정리하고 401을 반환해야 한다", async () => {
    mockedServerRequest
      .mockResolvedValueOnce(createJsonResponse({ code: "AUTH401_3" }, 401))
      .mockResolvedValueOnce(createJsonResponse({ code: "AUTH401_4" }, 401));

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
    expect(mockedServerRequest).toHaveBeenCalledTimes(2);
    expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
    expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
  });

  it("401이 아니면 refresh를 시도하지 않아야 한다", async () => {
    mockedServerRequest.mockResolvedValueOnce(createJsonResponse({ isSuccess: true, result: {} }, 200));

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

  it("로그아웃 성공 시에는 refresh로 발급된 토큰 대신 쿠키를 정리해야 한다", async () => {
    mockedServerRequest
      .mockResolvedValueOnce(createJsonResponse({ code: "AUTH401_3" }, 401))
      .mockResolvedValueOnce(
        createJsonResponse(
          {
            result: {
              accessToken: "new_access",
              refreshToken: "new_refresh",
            },
          },
          200
        )
      )
      .mockResolvedValueOnce(createJsonResponse({ isSuccess: true, result: null }, 200));

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
    expect(mockedServerRequest).toHaveBeenCalledTimes(3);
    expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
    expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
    expect(hasSetCookie(response, (cookie) => cookie.includes("accessToken=new_access"))).toBe(false);
    expect(hasSetCookie(response, (cookie) => cookie.includes("refreshToken=new_refresh"))).toBe(false);
  });
});

/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { GET } from "@/app/api/auth/callback/[provider]/route";
import { cookies } from "next/headers";
import { setAuthCookies } from "@/lib/auth/auth-cookies";
import { NextRequest } from "next/server";
import { REDIRECT_AFTER_LOGIN_COOKIE } from "@/lib/auth/cookie-constants";

// Next.js cookies() mock
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

// auth/cookies 모듈 모킹
jest.mock("@/lib/auth/auth-cookies", () => ({
  setAuthCookies: jest.fn(),
  clearAuthCookies: jest.fn(),
}));

const mockSetAuthCookies = setAuthCookies as jest.MockedFunction<typeof setAuthCookies>;

function expectLoginRedirect(response: Response, reason: string) {
  expect(response.status).toBe(307);
  const location = response.headers.get("location");
  expect(location).toBeTruthy();

  const url = new URL(location!);
  expect(url.pathname).toBe("/login");
  expect(url.searchParams.get("reason")).toBe(reason);
  expect(url.searchParams.get("next")).toBeNull();
}

describe("OAuth Callback Route Handler", () => {
  let mockCookieStore: {
    set: jest.Mock;
    get: jest.Mock;
    delete: jest.Mock;
  };
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockCookieStore = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockSetAuthCookies.mockClear();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("성공 케이스", () => {
    it("토큰이 있으면 쿠키에 저장하고 홈으로 리다이렉트해야 함", async () => {
      const url =
        "http://localhost:3000/api/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      // setAuthCookies 호출 확인 (기본값 사용)
      expect(mockSetAuthCookies).toHaveBeenCalledWith(mockCookieStore, {
        accessToken: "access123",
        refreshToken: "refresh456",
      });

      // redirectAfterLogin 쿠키 삭제 확인
      expect(mockCookieStore.delete).toHaveBeenCalledWith(REDIRECT_AFTER_LOGIN_COOKIE);

      // 홈으로 리다이렉트
      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/");
    });

    it("redirectAfterLogin 쿠키가 있으면 해당 경로로 리다이렉트해야 함", async () => {
      mockCookieStore.get.mockReturnValue({ value: "/dashboard" });

      const url =
        "http://localhost:3000/api/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/dashboard");
    });

    it("redirectAfterLogin 쿠키가 없으면 홈으로 리다이렉트해야 함", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const url =
        "http://localhost:3000/api/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/");
    });

    it("redirectAfterLogin 쿠키가 외부 URL이면 홈으로 폴백해야 함", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "https://malicious.com/steal",
      });

      const url =
        "http://localhost:3000/api/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/");
    });

    it("redirectAfterLogin 쿠키가 //로 시작하면 홈으로 폴백해야 함", async () => {
      mockCookieStore.get.mockReturnValue({ value: "//evil.com" });

      const url =
        "http://localhost:3000/api/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/");
    });

    it("redirectAfterLogin 쿠키가 /login이면 홈으로 폴백해야 함", async () => {
      mockCookieStore.get.mockReturnValue({ value: "/login" });

      const url =
        "http://localhost:3000/api/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/");
    });
  });

  describe("에러 케이스", () => {
    it("error 파라미터가 있으면 reason만 포함해 로그인으로 리다이렉트해야 함", async () => {
      const url = "http://localhost:3000/api/auth/callback/google?error=access_denied";
      const request = new NextRequest(url);

      const response = await GET(request);

      expectLoginRedirect(response, "access_denied");
    });

    it("error 분기에서 redirectAfterLogin 쿠키 값이 외부 URL이어도 로그인 리다이렉트 쿼리에 노출하지 않아야 함", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "https://malicious.com/steal",
      });

      const url = "http://localhost:3000/api/auth/callback/google?error=access_denied";
      const request = new NextRequest(url);

      const response = await GET(request);

      expectLoginRedirect(response, "access_denied");
    });

    it("accessToken이 없으면 에러와 함께 리다이렉트해야 함", async () => {
      const url = "http://localhost:3000/api/auth/callback/google?refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(consoleErrorSpy).toHaveBeenCalledWith("OAuth callback: No tokens in query parameters");
      expectLoginRedirect(response, "no_token");
    });

    it("refreshToken이 없으면 에러와 함께 리다이렉트해야 함", async () => {
      const url = "http://localhost:3000/api/auth/callback/google?accessToken=access123";
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(consoleErrorSpy).toHaveBeenCalledWith("OAuth callback: No tokens in query parameters");
      expectLoginRedirect(response, "no_token");
    });

    it("토큰이 모두 없으면 에러와 함께 리다이렉트해야 함", async () => {
      const url = "http://localhost:3000/api/auth/callback/google";
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(consoleErrorSpy).toHaveBeenCalledWith("OAuth callback: No tokens in query parameters");
      expectLoginRedirect(response, "no_token");
    });
  });

  describe("Provider 정책", () => {
    it("Google provider로 로그인해도 정상 동작해야 함", async () => {
      const url =
        "http://localhost:3000/api/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(mockSetAuthCookies).toHaveBeenCalled();
      expect(response.status).toBe(307);
    });

    it("Kakao provider로 로그인해도 정상 동작해야 함", async () => {
      const url =
        "http://localhost:3000/api/auth/callback/kakao?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(mockSetAuthCookies).toHaveBeenCalled();
      expect(response.status).toBe(307);
    });

    it("허용되지 않은 provider면 로그인 페이지(access_denied)로 리다이렉트해야 함", async () => {
      const url =
        "http://localhost:3000/api/auth/callback/naver?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(mockSetAuthCookies).not.toHaveBeenCalled();
      expectLoginRedirect(response, "access_denied");
    });
  });
});

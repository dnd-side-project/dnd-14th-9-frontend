/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/auth/callback/[provider]/route";
import { LOGIN_PROVIDERS } from "@/lib/auth/auth-constants";
import { setAuthCookies } from "@/lib/auth/auth-cookies";
import {
  ACCESS_TOKEN_COOKIE,
  REDIRECT_AFTER_LOGIN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/cookie-constants";

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

function getProviderFromUrl(url: string): string {
  const provider = new URL(url).pathname.split("/").at(-1);
  return provider ?? "";
}

async function executeCallbackRoute(url: string): Promise<Response> {
  const request = new NextRequest(url);
  return GET(request, {
    params: Promise.resolve({
      provider: getProviderFromUrl(url),
    }),
  });
}

function buildCallbackUrl(provider: string, query?: Record<string, string>): string {
  const baseUrl = `http://localhost:3000/api/auth/callback/${provider}`;

  if (!query) {
    return baseUrl;
  }

  return `${baseUrl}?${new URLSearchParams(query).toString()}`;
}

describe("OAuth Callback Route Handler", () => {
  const [googleProvider, kakaoProvider] = LOGIN_PROVIDERS;

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
      const url = buildCallbackUrl(googleProvider, {
        [ACCESS_TOKEN_COOKIE]: "access123",
        [REFRESH_TOKEN_COOKIE]: "refresh456",
      });
      const response = await executeCallbackRoute(url);

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

      const url = buildCallbackUrl(googleProvider, {
        [ACCESS_TOKEN_COOKIE]: "access123",
        [REFRESH_TOKEN_COOKIE]: "refresh456",
      });
      const response = await executeCallbackRoute(url);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/dashboard");
    });

    it("redirectAfterLogin 쿠키가 없으면 홈으로 리다이렉트해야 함", async () => {
      mockCookieStore.get.mockReturnValue(undefined);

      const url = buildCallbackUrl(googleProvider, {
        [ACCESS_TOKEN_COOKIE]: "access123",
        [REFRESH_TOKEN_COOKIE]: "refresh456",
      });
      const response = await executeCallbackRoute(url);

      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/");
    });

    it("redirectAfterLogin 쿠키가 외부 URL이면 홈으로 폴백해야 함", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "https://malicious.com/steal",
      });

      const url = buildCallbackUrl(googleProvider, {
        [ACCESS_TOKEN_COOKIE]: "access123",
        [REFRESH_TOKEN_COOKIE]: "refresh456",
      });
      const response = await executeCallbackRoute(url);

      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/");
    });

    it("redirectAfterLogin 쿠키가 //로 시작하면 홈으로 폴백해야 함", async () => {
      mockCookieStore.get.mockReturnValue({ value: "//evil.com" });

      const url = buildCallbackUrl(googleProvider, {
        [ACCESS_TOKEN_COOKIE]: "access123",
        [REFRESH_TOKEN_COOKIE]: "refresh456",
      });
      const response = await executeCallbackRoute(url);

      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/");
    });

    it("redirectAfterLogin 쿠키가 /login이면 홈으로 폴백해야 함", async () => {
      mockCookieStore.get.mockReturnValue({ value: "/login" });

      const url = buildCallbackUrl(googleProvider, {
        [ACCESS_TOKEN_COOKIE]: "access123",
        [REFRESH_TOKEN_COOKIE]: "refresh456",
      });
      const response = await executeCallbackRoute(url);

      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/");
    });

    it("redirectAfterLogin 쿠키가 /login이면 홈으로 폴백해야 함", async () => {
      mockCookieStore.get.mockReturnValue({ value: "/login" });

      const url = buildCallbackUrl(googleProvider, {
        [ACCESS_TOKEN_COOKIE]: "access123",
        [REFRESH_TOKEN_COOKIE]: "refresh456",
      });
      const response = await executeCallbackRoute(url);

      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/");
    });
  });

  describe("에러 케이스", () => {
    it("error 파라미터가 있으면 reason만 포함해 로그인으로 리다이렉트해야 함", async () => {
      const url = buildCallbackUrl(googleProvider, { error: "access_denied" });
      const response = await executeCallbackRoute(url);

      expectLoginRedirect(response, "access_denied");
    });

    it("error 분기에서 redirectAfterLogin 쿠키 값이 외부 URL이어도 로그인 리다이렉트 쿼리에 노출하지 않아야 함", async () => {
      mockCookieStore.get.mockReturnValue({
        value: "https://malicious.com/steal",
      });

      const url = buildCallbackUrl(googleProvider, { error: "access_denied" });
      const response = await executeCallbackRoute(url);

      expectLoginRedirect(response, "access_denied");
    });

    it("accessToken이 없으면 에러와 함께 리다이렉트해야 함", async () => {
      const url = buildCallbackUrl(googleProvider, {
        [REFRESH_TOKEN_COOKIE]: "refresh456",
      });
      const response = await executeCallbackRoute(url);

      expect(consoleErrorSpy).toHaveBeenCalledWith("OAuth callback: No tokens in query parameters");
      expectLoginRedirect(response, "no_token");
    });

    it("refreshToken이 없으면 에러와 함께 리다이렉트해야 함", async () => {
      const url = buildCallbackUrl(googleProvider, {
        [ACCESS_TOKEN_COOKIE]: "access123",
      });
      const response = await executeCallbackRoute(url);

      expect(consoleErrorSpy).toHaveBeenCalledWith("OAuth callback: No tokens in query parameters");
      expectLoginRedirect(response, "no_token");
    });

    it("토큰이 모두 없으면 에러와 함께 리다이렉트해야 함", async () => {
      const url = buildCallbackUrl(googleProvider);
      const response = await executeCallbackRoute(url);

      expect(consoleErrorSpy).toHaveBeenCalledWith("OAuth callback: No tokens in query parameters");
      expectLoginRedirect(response, "no_token");
    });
  });

  describe("Provider 정책", () => {
    it("Google provider로 로그인해도 정상 동작해야 함", async () => {
      const url = buildCallbackUrl(googleProvider, {
        [ACCESS_TOKEN_COOKIE]: "access123",
        [REFRESH_TOKEN_COOKIE]: "refresh456",
      });
      const response = await executeCallbackRoute(url);

      expect(mockSetAuthCookies).toHaveBeenCalled();
      expect(response.status).toBe(307);
    });

    it("Kakao provider로 로그인해도 정상 동작해야 함", async () => {
      const url = buildCallbackUrl(kakaoProvider, {
        [ACCESS_TOKEN_COOKIE]: "access123",
        [REFRESH_TOKEN_COOKIE]: "refresh456",
      });
      const response = await executeCallbackRoute(url);

      expect(mockSetAuthCookies).toHaveBeenCalled();
      expect(response.status).toBe(307);
    });

    it("허용되지 않은 provider면 로그인 페이지(access_denied)로 리다이렉트해야 함", async () => {
      const url = buildCallbackUrl("naver", {
        [ACCESS_TOKEN_COOKIE]: "access123",
        [REFRESH_TOKEN_COOKIE]: "refresh456",
      });
      const response = await executeCallbackRoute(url);

      expect(mockSetAuthCookies).not.toHaveBeenCalled();
      expectLoginRedirect(response, "access_denied");
    });
  });
});

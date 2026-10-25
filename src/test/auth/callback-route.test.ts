/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { GET } from "@/app/api/auth/callback/[provider]/route";
import { setAuthCookies } from "@/lib/auth/auth-cookies";
import {
  ACCESS_TOKEN_COOKIE,
  OAUTH_CODE_VERIFIER_COOKIE,
  OAUTH_CODE_VERIFIER_COOKIE_PATH,
  REDIRECT_AFTER_LOGIN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/cookie-constants";
import { exchangeAuthCode, type CodeExchangeOutcome } from "@/lib/auth/oauth-code-exchange";
import { LOGIN_PROVIDERS } from "@/lib/auth/oauth-provider-policy";

const BACKEND_API_URL = "https://api.gak.today/api/v1";

let mockServerApiUrl: string | undefined;

// Next.js cookies() mock
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

// auth/cookies 모듈 모킹
jest.mock("@/lib/auth/auth-cookies", () => ({
  setAuthCookies: jest.fn(),
  clearAuthCookies: jest.fn(),
}));

// 백엔드 API 주소는 모듈 로드 시점에 고정되므로 테스트별로 바꿀 수 있게 getter로 모킹한다.
jest.mock("@/lib/api/api-client", () => ({
  get SERVER_API_URL() {
    return mockServerApiUrl;
  },
}));

jest.mock("@/lib/auth/oauth-code-exchange", () => ({
  exchangeAuthCode: jest.fn(),
}));

const mockSetAuthCookies = setAuthCookies as jest.MockedFunction<typeof setAuthCookies>;
const mockExchangeAuthCode = exchangeAuthCode as jest.MockedFunction<typeof exchangeAuthCode>;

const VERIFIER_DELETE_ARGS = {
  name: OAUTH_CODE_VERIFIER_COOKIE,
  path: OAUTH_CODE_VERIFIER_COOKIE_PATH,
};

const SUCCESS_OUTCOME: CodeExchangeOutcome = {
  kind: "success",
  tokens: { accessToken: "access123", refreshToken: "refresh456" },
};

function failureOutcome(
  reason: "http_error" | "invalid_response" | "timeout" | "network_error",
  status: number
): CodeExchangeOutcome {
  return { kind: "failure", reason, status, errorCode: null };
}

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

  let cookieValues: Record<string, string>;
  let mockCookieStore: {
    set: jest.Mock;
    get: jest.Mock;
    delete: jest.Mock;
  };
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    // 로그인 시작 때 발급된 verifier 쿠키가 있는 상태가 기본이다.
    cookieValues = { [OAUTH_CODE_VERIFIER_COOKIE]: "verifier123" };
    mockCookieStore = {
      set: jest.fn(),
      get: jest.fn((name: string) =>
        name in cookieValues ? { value: cookieValues[name] } : undefined
      ),
      delete: jest.fn(),
    };

    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    mockSetAuthCookies.mockClear();
    mockExchangeAuthCode.mockReset();
    mockExchangeAuthCode.mockResolvedValue(SUCCESS_OUTCOME);
    mockServerApiUrl = BACKEND_API_URL;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("성공 케이스", () => {
    it("code와 쿠키의 verifier를 백엔드에 보내 받은 토큰을 쿠키에 저장하고 홈으로 리다이렉트해야 함", async () => {
      const response = await executeCallbackRoute(
        buildCallbackUrl(googleProvider, { code: "code789" })
      );

      expect(mockExchangeAuthCode).toHaveBeenCalledTimes(1);
      expect(mockExchangeAuthCode).toHaveBeenCalledWith(BACKEND_API_URL, "code789", "verifier123");

      // setAuthCookies 호출 확인 (기본값 사용)
      expect(mockSetAuthCookies).toHaveBeenCalledWith(mockCookieStore, {
        accessToken: "access123",
        refreshToken: "refresh456",
      });

      // redirectAfterLogin, verifier 쿠키 삭제 확인
      expect(mockCookieStore.delete).toHaveBeenCalledWith(REDIRECT_AFTER_LOGIN_COOKIE);
      expect(mockCookieStore.delete).toHaveBeenCalledWith(VERIFIER_DELETE_ARGS);

      // 홈으로 리다이렉트
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
    });

    it.each([
      ["redirectAfterLogin 쿠키가 있으면 해당 경로로", "/dashboard", "/dashboard"],
      ["redirectAfterLogin 쿠키가 외부 URL이면 홈으로 폴백", "https://malicious.com/steal", "/"],
      ["redirectAfterLogin 쿠키가 //로 시작하면 홈으로 폴백", "//evil.com", "/"],
      ["redirectAfterLogin 쿠키가 /login이면 홈으로 폴백", "/login", "/"],
    ])("%s 리다이렉트해야 함", async (_name, cookieValue, expectedPath) => {
      cookieValues[REDIRECT_AFTER_LOGIN_COOKIE] = cookieValue;

      const response = await executeCallbackRoute(
        buildCallbackUrl(googleProvider, { code: "code789" })
      );

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(`http://localhost:3000${expectedPath}`);
    });

    it("redirectAfterLogin 쿠키가 없으면 홈으로 리다이렉트해야 함", async () => {
      const response = await executeCallbackRoute(
        buildCallbackUrl(googleProvider, { code: "code789" })
      );

      expect(response.headers.get("location")).toBe("http://localhost:3000/");
    });
  });

  describe("에러 케이스", () => {
    it("error 파라미터가 있으면 교환 없이 reason만 포함해 로그인으로 리다이렉트하고 verifier를 지워야 함", async () => {
      const response = await executeCallbackRoute(
        buildCallbackUrl(googleProvider, { error: "OAUTH401_2" })
      );

      expectLoginRedirect(response, "OAUTH401_2");
      expect(mockExchangeAuthCode).not.toHaveBeenCalled();
      expect(mockSetAuthCookies).not.toHaveBeenCalled();
      expect(mockCookieStore.delete).toHaveBeenCalledWith(VERIFIER_DELETE_ARGS);
    });

    it("error 분기에서 redirectAfterLogin 쿠키 값이 외부 URL이어도 로그인 리다이렉트 쿼리에 노출하지 않아야 함", async () => {
      cookieValues[REDIRECT_AFTER_LOGIN_COOKIE] = "https://malicious.com/steal";

      const response = await executeCallbackRoute(
        buildCallbackUrl(googleProvider, { error: "OAUTH401_2" })
      );

      expectLoginRedirect(response, "OAUTH401_2");
    });

    it("code가 없으면 교환하지 않고 에러와 함께 리다이렉트해야 함", async () => {
      const response = await executeCallbackRoute(buildCallbackUrl(googleProvider));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "OAuth callback: Missing authorization code or code verifier"
      );
      expectLoginRedirect(response, "OAUTH401_1");
      expect(mockExchangeAuthCode).not.toHaveBeenCalled();
      expect(mockSetAuthCookies).not.toHaveBeenCalled();
    });

    it("verifier 쿠키가 없으면 교환하지 않고 에러와 함께 리다이렉트해야 함", async () => {
      delete cookieValues[OAUTH_CODE_VERIFIER_COOKIE];

      const response = await executeCallbackRoute(
        buildCallbackUrl(googleProvider, { code: "code789" })
      );

      expectLoginRedirect(response, "OAUTH401_1");
      expect(mockExchangeAuthCode).not.toHaveBeenCalled();
      expect(mockSetAuthCookies).not.toHaveBeenCalled();
    });

    it("query에 토큰이 실려 와도 로그인시키지 않아야 함 (구방식 제거 확인)", async () => {
      const response = await executeCallbackRoute(
        buildCallbackUrl(googleProvider, {
          [ACCESS_TOKEN_COOKIE]: "access123",
          [REFRESH_TOKEN_COOKIE]: "refresh456",
        })
      );

      expectLoginRedirect(response, "OAUTH401_1");
      expect(mockExchangeAuthCode).not.toHaveBeenCalled();
      expect(mockSetAuthCookies).not.toHaveBeenCalled();
    });

    it.each([
      ["http_error", 401, "OAUTH401_1"],
      ["invalid_response", 200, "OAUTH401_1"],
      ["timeout", 504, "network_error"],
      ["network_error", 500, "network_error"],
    ] as const)(
      "교환이 %s(%i)로 실패하면 쿠키를 저장하지 않고 %s 사유로 로그인에 리다이렉트해야 함",
      async (reason, status, expectedReason) => {
        mockExchangeAuthCode.mockResolvedValue(failureOutcome(reason, status));

        const response = await executeCallbackRoute(
          buildCallbackUrl(googleProvider, { code: "code789" })
        );

        expectLoginRedirect(response, expectedReason);
        expect(mockSetAuthCookies).not.toHaveBeenCalled();
        expect(mockCookieStore.delete).toHaveBeenCalledWith(VERIFIER_DELETE_ARGS);
        expect(mockCookieStore.delete).not.toHaveBeenCalledWith(REDIRECT_AFTER_LOGIN_COOKIE);
      }
    );

    it("실패 로그에 code와 verifier 값을 남기지 않아야 함", async () => {
      mockExchangeAuthCode.mockResolvedValue(failureOutcome("http_error", 401));

      await executeCallbackRoute(buildCallbackUrl(googleProvider, { code: "code789" }));

      const logged = JSON.stringify(consoleErrorSpy.mock.calls);
      expect(logged).not.toContain("code789");
      expect(logged).not.toContain("verifier123");
    });

    it("백엔드 API 주소 설정이 없으면 교환하지 않고 config_error로 리다이렉트해야 함", async () => {
      mockServerApiUrl = undefined;

      const response = await executeCallbackRoute(
        buildCallbackUrl(googleProvider, { code: "code789" })
      );

      expectLoginRedirect(response, "config_error");
      expect(mockExchangeAuthCode).not.toHaveBeenCalled();
    });
  });

  describe("Provider 정책", () => {
    it("Google provider로 로그인해도 정상 동작해야 함", async () => {
      const response = await executeCallbackRoute(
        buildCallbackUrl(googleProvider, { code: "code789" })
      );

      expect(mockSetAuthCookies).toHaveBeenCalled();
      expect(response.status).toBe(307);
    });

    it("Kakao provider로 로그인해도 정상 동작해야 함", async () => {
      const response = await executeCallbackRoute(
        buildCallbackUrl(kakaoProvider, { code: "code789" })
      );

      expect(mockSetAuthCookies).toHaveBeenCalled();
      expect(response.status).toBe(307);
    });

    it("허용되지 않은 provider면 교환 없이 로그인 페이지(OAUTH401_5)로 리다이렉트해야 함", async () => {
      const response = await executeCallbackRoute(buildCallbackUrl("naver", { code: "code789" }));

      expect(mockSetAuthCookies).not.toHaveBeenCalled();
      expect(mockExchangeAuthCode).not.toHaveBeenCalled();
      expectLoginRedirect(response, "OAUTH401_5");
    });
  });
});

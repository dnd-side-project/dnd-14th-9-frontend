/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { proxy } from "@/proxy";
import { NextRequest } from "next/server";

// Global fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe("Proxy Middleware", () => {
  let consoleErrorSpy: jest.SpyInstance;

  function createRefreshSuccessResponse(
    accessToken: string = "new_access",
    refreshToken: string = "new_refresh"
  ) {
    return {
      ok: true,
      json: jest.fn().mockResolvedValue({
        result: {
          accessToken,
          refreshToken,
        },
      }),
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    // 환경 변수 설정
    process.env.BACKEND_API_BASE = "http://localhost:8080";
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    // 환경 변수 정리
    delete process.env.BACKEND_API_BASE;
  });

  /**
   * JWT 토큰 생성 헬퍼
   * @param expiresInSeconds 만료까지 남은 시간 (초)
   */
  function createMockToken(expiresInSeconds: number): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      exp: now + expiresInSeconds,
      userId: "test-user-123",
    };

    // Base64 인코딩 (실제 서명은 불필요, 디코딩만 테스트)
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = btoa(JSON.stringify(payload));
    const signature = "mock_signature";

    return `${header}.${body}.${signature}`;
  }

  function hasSetCookie(response: Response, matcher: (cookie: string) => boolean): boolean {
    return response.headers.getSetCookie().some(matcher);
  }

  describe("공개 라우트", () => {
    it("홈(/) 경로는 인증 없이 통과해야 함", async () => {
      // Given
      const request = new NextRequest("http://localhost:3000/");

      // When
      const response = await proxy(request);

      // Then: 그대로 통과 (NextResponse.next())
      expect(response.status).toBe(200);
    });

    it("/auth 경로는 인증 없이 통과해야 함", async () => {
      // Given
      const request = new NextRequest("http://localhost:3000/auth/callback/google");

      // When
      const response = await proxy(request);

      // Then
      expect(response.status).toBe(200);
    });

    it("/api 경로는 인증 없이 통과해야 함", async () => {
      // Given
      const request = new NextRequest("http://localhost:3000/api/health");

      // When
      const response = await proxy(request);

      // Then
      expect(response.status).toBe(200);
    });

    it("인증 없이 접근 가능한 경로들은 토큰 검증을 하지 않아야 함", async () => {
      const publicPaths = [
        "/",
        "/auth/login",
        "/auth/callback/google",
        "/api/health",
        "/api/posts",
      ];

      for (const path of publicPaths) {
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await proxy(request);

        expect(response.status).toBe(200);
      }

      // fetch가 호출되지 않았는지 확인 (재발급 시도 없음)
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("보호된 라우트 - 토큰 없음", () => {
    it("accessToken과 refreshToken이 모두 없으면 로그인 모달로 리다이렉트해야 함", async () => {
      // Given: 토큰 없는 요청
      const request = new NextRequest("http://localhost:3000/dashboard");

      // When
      const response = await proxy(request);

      // Then: 홈으로 리다이렉트 + 로그인 모달 시그널 쿠키
      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toBe("http://localhost:3000/");
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("loginRequired=1"))).toBe(true);
      expect(
        hasSetCookie(response, (cookie) => cookie.startsWith("loginError=auth_required"))
      ).toBe(true);
      expect(
        hasSetCookie(response, (cookie) =>
          decodeURIComponent(cookie).startsWith("redirectAfterLogin=/dashboard")
        )
      ).toBe(true);
    });

    it("다른 보호된 경로도 동일하게 리다이렉트해야 함", async () => {
      const protectedPaths = ["/dashboard", "/profile", "/settings"];

      for (const path of protectedPaths) {
        jest.clearAllMocks();

        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await proxy(request);

        expect(response.status).toBe(307);
        const location = response.headers.get("location");
        expect(location).toBe("http://localhost:3000/");
        expect(
          hasSetCookie(response, (cookie) =>
            decodeURIComponent(cookie).startsWith(`redirectAfterLogin=${path}`)
          )
        ).toBe(true);
      }
    });
  });

  describe("토큰 만료 검증", () => {
    it("토큰이 5분 이상 남았으면 그대로 통과해야 함", async () => {
      // Given: 10분 후 만료되는 토큰
      const accessToken = createMockToken(10 * 60); // 10분
      const refreshToken = createMockToken(30 * 24 * 60 * 60); // 30일

      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
        },
      });

      // When
      const response = await proxy(request);

      // Then: 그대로 통과
      expect(response.status).toBe(200);
      expect(mockFetch).not.toHaveBeenCalled(); // 재발급 호출 안함
    });

    it("토큰이 5분 이내로 남았으면 재발급을 시도해야 함", async () => {
      // Given: 3분 후 만료되는 토큰
      const accessToken = createMockToken(3 * 60); // 3분
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
        },
      });

      // Mock: 재발급 API 성공 응답
      const newAccessToken = createMockToken(60 * 60); // 1시간
      mockFetch.mockResolvedValueOnce(
        createRefreshSuccessResponse(newAccessToken, "new_refresh_token")
      );

      // When
      const response = await proxy(request);

      // Then: 재발급 API 호출 확인
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/auth/refresh",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Cookie: `refreshToken=${refreshToken}`,
          }),
          credentials: "include",
        })
      );

      // 새 쿠키가 응답에 포함되었는지 확인
      expect(response.status).toBe(200);
      const setCookieHeaders = response.headers.getSetCookie();
      expect(setCookieHeaders.some((cookie) => cookie.includes("accessToken="))).toBe(true);
    });

    it("토큰이 이미 만료되었으면 재발급을 시도해야 함", async () => {
      // Given: 1분 전에 만료된 토큰
      const accessToken = createMockToken(-60); // 1분 전 만료
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
        },
      });

      // Mock: 재발급 성공
      mockFetch.mockResolvedValueOnce(createRefreshSuccessResponse("new_token", "new_refresh"));

      // When
      const response = await proxy(request);

      // Then: 재발급 시도
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/auth/refresh",
        expect.anything()
      );
      expect(response.status).toBe(200);
    });

    it("잘못된 형식의 토큰이면 재발급을 시도해야 함", async () => {
      // Given: 잘못된 JWT 형식 (디코딩 실패)
      const invalidToken = "invalid.token.format";
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `accessToken=${invalidToken}; refreshToken=${refreshToken}`,
        },
      });

      // Mock: 재발급 성공
      mockFetch.mockResolvedValueOnce(createRefreshSuccessResponse("new_token", "new_refresh"));

      // When
      const response = await proxy(request);

      // Then: 디코딩 실패 → 재발급 시도
      expect(mockFetch).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });
  });

  describe("토큰 재발급", () => {
    it("accessToken이 없고 refreshToken만 있으면 재발급을 시도해야 함", async () => {
      // Given: refreshToken만 있는 경우
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      // Mock: 재발급 성공
      mockFetch.mockResolvedValueOnce(createRefreshSuccessResponse("new_access", "new_refresh"));

      // When
      const response = await proxy(request);

      // Then
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/auth/refresh",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Cookie: `refreshToken=${refreshToken}`,
          }),
        })
      );
      expect(response.status).toBe(200);
    });

    it("재발급 성공 시 새 쿠키를 응답에 포함해야 함", async () => {
      // Given
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      const newAccessToken = "new_access_token_12345";
      const newRefreshToken = "new_refresh_token_67890";

      // Mock: 재발급 API 응답
      mockFetch.mockResolvedValueOnce(
        createRefreshSuccessResponse(newAccessToken, newRefreshToken)
      );

      // When
      const response = await proxy(request);

      // Then: 응답에 새 쿠키 포함
      const setCookies = response.headers.getSetCookie();
      expect(setCookies).toHaveLength(2);
      expect(setCookies[0]).toContain(newAccessToken);
      expect(setCookies[1]).toContain(newRefreshToken);
    });

    it("재발급 API가 실패하면 로그인 모달로 리다이렉트해야 함", async () => {
      // Given: refreshToken만 있음
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      // Mock: 재발급 실패 (401)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      // When
      const response = await proxy(request);

      // Then: 로그인 모달로 리다이렉트 + 세션 만료 시그널
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("loginRequired=1"))).toBe(true);
      expect(
        hasSetCookie(response, (cookie) => cookie.startsWith("loginError=session_expired"))
      ).toBe(true);
      expect(
        hasSetCookie(response, (cookie) =>
          decodeURIComponent(cookie).startsWith("redirectAfterLogin=/dashboard")
        )
      ).toBe(true);
    });

    it("재발급 API 호출 중 네트워크 에러가 발생하면 로그인 모달로 리다이렉트해야 함", async () => {
      // Given
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      // Mock: 네트워크 에러
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // When
      const response = await proxy(request);

      // Then: 네트워크 에러 시 로그인 모달 유도
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("loginRequired=1"))).toBe(true);
      expect(
        hasSetCookie(response, (cookie) => cookie.startsWith("loginError=network_error"))
      ).toBe(true);
    });

    it("BACKEND_API_BASE가 설정되지 않으면 로그인 모달로 리다이렉트해야 함", async () => {
      // Given: BACKEND_API_BASE 제거
      delete process.env.BACKEND_API_BASE;

      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      // When
      const response = await proxy(request);

      // Then
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("loginRequired=1"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("loginError=config_error"))).toBe(
        true
      );
      expect(mockFetch).not.toHaveBeenCalled(); // API 호출 안함
    });
  });

  describe("토큰 만료 임박 시 refreshToken 없음", () => {
    it("토큰이 만료 임박했는데 refreshToken이 없으면 로그인 모달로 리다이렉트해야 함", async () => {
      // Given: 만료 임박한 accessToken만 있고 refreshToken 없음
      const accessToken = createMockToken(2 * 60); // 2분

      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `accessToken=${accessToken}`,
        },
      });

      // When
      const response = await proxy(request);

      // Then: refreshToken 없으므로 재발급 불가 → 로그인 모달
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("loginRequired=1"))).toBe(true);
      expect(
        hasSetCookie(response, (cookie) => cookie.startsWith("loginError=refresh_token_missing"))
      ).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("여러 시나리오 통합", () => {
    it("유효한 토큰으로 여러 페이지 접근이 가능해야 함", async () => {
      const accessToken = createMockToken(30 * 60); // 30분
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const pages = ["/dashboard", "/profile", "/settings", "/posts/123"];

      for (const page of pages) {
        const request = new NextRequest(`http://localhost:3000${page}`, {
          headers: {
            cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
          },
        });

        const response = await proxy(request);
        expect(response.status).toBe(200);
      }
    });

    it("만료된 토큰 → 재발급 성공 → 페이지 접근 성공", async () => {
      // Given: 만료된 accessToken
      const expiredToken = createMockToken(-60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `accessToken=${expiredToken}; refreshToken=${refreshToken}`,
        },
      });

      // Mock: 재발급 성공
      mockFetch.mockResolvedValueOnce(createRefreshSuccessResponse("new_token", "new_refresh"));

      // When
      const response = await proxy(request);

      // Then: 재발급 후 접근 성공
      expect(mockFetch).toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it("만료된 토큰 → 재발급 실패 → 로그인 모달", async () => {
      // Given: 만료된 토큰
      const expiredToken = createMockToken(-60);
      const expiredRefreshToken = createMockToken(-60);

      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `accessToken=${expiredToken}; refreshToken=${expiredRefreshToken}`,
        },
      });

      // Mock: 재발급 실패 (refreshToken도 만료)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      // When
      const response = await proxy(request);

      // Then: 로그인 모달로 리다이렉트
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("loginRequired=1"))).toBe(true);
      expect(
        hasSetCookie(response, (cookie) => cookie.startsWith("loginError=session_expired"))
      ).toBe(true);
    });
  });
});

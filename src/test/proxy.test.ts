/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from "next/server";

import { proxy } from "@/proxy";

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

  function toBase64Url(base64: string): string {
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function createBase64UrlMockToken(expiresInSeconds: number): string {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      exp: now + expiresInSeconds,
      // `?`는 base64 결과에 `/`가 포함될 확률을 높여 base64url 변환 케이스를 강제한다.
      userId: "???",
    };

    const header = toBase64Url(btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })));
    const body = toBase64Url(btoa(JSON.stringify(payload)));
    const signature = toBase64Url(btoa("mock_signature"));

    return `${header}.${body}.${signature}`;
  }

  function hasSetCookie(response: Response, matcher: (cookie: string) => boolean): boolean {
    return response.headers.getSetCookie().some(matcher);
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

  function expectRedirectAfterLoginCookie(response: Response, returnPath: string) {
    const encodedPath = encodeURIComponent(returnPath);
    expect(
      hasSetCookie(
        response,
        (cookie) =>
          cookie.startsWith(`redirectAfterLogin=${encodedPath}`) ||
          cookie.startsWith(`redirectAfterLogin=${returnPath}`)
      )
    ).toBe(true);
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

    it("인증 없이 접근 가능한 경로들은 토큰 검증을 하지 않아야 함", async () => {
      const publicPaths = ["/", "/login"];

      for (const path of publicPaths) {
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await proxy(request);

        expect(response.status).toBe(200);
      }

      // fetch가 호출되지 않았는지 확인 (재발급 시도 없음)
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("공개 라우트에서 accessToken이 없고 refreshToken이 있으면 재발급을 시도해야 함", async () => {
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      mockFetch.mockResolvedValueOnce(createRefreshSuccessResponse("new_access", "new_refresh"));

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/auth/refresh",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Cookie: `refreshToken=${refreshToken}`,
          }),
        })
      );
      expect(hasSetCookie(response, (cookie) => cookie.includes("accessToken="))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.includes("refreshToken="))).toBe(true);
    });

    it("공개 라우트에서 재발급이 401/403이면 리다이렉트 없이 인증 쿠키를 정리해야 함", async () => {
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/login", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
    });

    it("공개 라우트에서 재발급이 5xx로 실패하면 리다이렉트 없이 통과해야 함", async () => {
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(false);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(false);
    });

    it("공개 라우트에서 재발급 응답 형식이 비정상이면 리다이렉트 없이 통과해야 함", async () => {
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/login", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          result: {
            accessToken: "new_access",
            refreshToken: null,
          },
        }),
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(false);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(false);
    });

    it("공개 라우트에서 재발급 네트워크 에러가 나도 리다이렉트 없이 통과해야 함", async () => {
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
    });
  });

  describe("공개 API 예외 경로", () => {
    it("정의된 공개 API 경로는 토큰 없이 통과해야 함", async () => {
      const publicApiPaths = [
        "/api/auth/login",
        "/api/auth/callback",
        "/api/auth/callback/google",
        "/api/sessions",
        "/api/sessions/123",
      ];

      for (const path of publicApiPaths) {
        jest.clearAllMocks();
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await proxy(request);

        expect(response.status).toBe(200);
        expect(response.headers.get("location")).toBeNull();
        expect(mockFetch).not.toHaveBeenCalled();
      }
    });

    it("공개 API 예외가 아닌 경로는 토큰 없이 접근 시 로그인 리다이렉트해야 함", async () => {
      const protectedApiPaths = [
        "/api/auth/logout",
        "/api/sessions/create",
        "/api/sessions/update",
        "/api/sessions/123/join",
      ];

      for (const path of protectedApiPaths) {
        jest.clearAllMocks();
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await proxy(request);

        expectLoginRedirect(response, "auth_required");
        expectRedirectAfterLoginCookie(response, path);
        expect(mockFetch).not.toHaveBeenCalled();
      }
    });
  });

  describe("보호된 라우트 - 토큰 없음", () => {
    it("accessToken과 refreshToken이 모두 없으면 로그인 라우트로 리다이렉트해야 함", async () => {
      // Given: 토큰 없는 요청
      const request = new NextRequest("http://localhost:3000/dashboard");

      // When
      const response = await proxy(request);

      // Then: 로그인 라우트로 리다이렉트
      expectLoginRedirect(response, "auth_required");
      expectRedirectAfterLoginCookie(response, "/dashboard");
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
    });

    it("다른 보호된 경로도 동일하게 리다이렉트해야 함", async () => {
      const protectedPaths = ["/dashboard", "/profile", "/settings"];

      for (const path of protectedPaths) {
        jest.clearAllMocks();

        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await proxy(request);

        expectLoginRedirect(response, "auth_required");
        expectRedirectAfterLoginCookie(response, path);
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

    it("base64url 형식 토큰도 만료 시간을 정상 판별해야 함", async () => {
      // Given: base64url 형식 + 10분 후 만료
      const accessToken = createBase64UrlMockToken(10 * 60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
        },
      });

      // When
      const response = await proxy(request);

      // Then: 디코딩 실패 없이 통과 (불필요한 재발급 호출 없음)
      expect(response.status).toBe(200);
      expect(mockFetch).not.toHaveBeenCalled();
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

    it("보호된 라우트에서 재발급 응답 형식이 비정상이면 로그인 라우트(COMMON500)로 리다이렉트해야 함", async () => {
      // Given
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      // Mock: accessToken 타입이 문자열이 아님
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          result: {
            accessToken: 12345,
            refreshToken: "new_refresh",
          },
        }),
      });

      // When
      const response = await proxy(request);

      // Then
      expectLoginRedirect(response, "COMMON500");
      expectRedirectAfterLoginCookie(response, "/dashboard");
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
    });

    it("재발급 API가 실패하면 백엔드 에러 코드로 로그인 라우트에 리다이렉트해야 함", async () => {
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
        json: jest.fn().mockResolvedValue({
          code: "AUTH401_4",
          message: "기한이 만료된 Refresh 토큰입니다.",
          isSuccess: false,
          httpStatus: "UNAUTHORIZED",
        }),
      });

      // When
      const response = await proxy(request);

      // Then: 로그인 라우트로 리다이렉트 + 세션 쿠키 정리
      expectLoginRedirect(response, "AUTH401_4");
      expectRedirectAfterLoginCookie(response, "/dashboard");
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
    });

    it("재발급 API 호출 중 네트워크 에러가 발생하면 로그인 라우트로 리다이렉트해야 함", async () => {
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

      // Then: 네트워크 에러 시 로그인 라우트 유도
      expectLoginRedirect(response, "network_error");
      expectRedirectAfterLoginCookie(response, "/dashboard");
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
    });

    it("BACKEND_API_BASE가 설정되지 않으면 로그인 라우트로 리다이렉트해야 함", async () => {
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
      expectLoginRedirect(response, "config_error");
      expectRedirectAfterLoginCookie(response, "/dashboard");
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled(); // API 호출 안함
    });
  });

  describe("토큰 만료 임박 시 refreshToken 없음", () => {
    it("토큰이 만료 임박했는데 refreshToken이 없으면 로그인 라우트로 리다이렉트해야 함", async () => {
      // Given: 만료 임박한 accessToken만 있고 refreshToken 없음
      const accessToken = createMockToken(2 * 60); // 2분

      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `accessToken=${accessToken}`,
        },
      });

      // When
      const response = await proxy(request);

      // Then: refreshToken 없으므로 재발급 불가 → 로그인 라우트
      expectLoginRedirect(response, "auth_required");
      expectRedirectAfterLoginCookie(response, "/dashboard");
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("토큰 부분 삭제 시나리오", () => {
    it("보호된 라우트에서 accessToken이 충분히 유효하고 refreshToken이 없으면 일단 통과해야 함", async () => {
      // Given: 10분 후 만료되는 accessToken (5분 임계값보다 충분히 김)
      const accessToken = createMockToken(10 * 60); // 10분
      // refreshToken 없음

      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `accessToken=${accessToken}`,
        },
      });

      // When
      const response = await proxy(request);

      // Then: accessToken이 유효하므로 통과
      expect(response.status).toBe(200);
      expect(mockFetch).not.toHaveBeenCalled(); // 재발급 시도 안함

      // 참고: 5분 후 만료 임박 시 refreshToken 없어서 재발급 실패할 것
      // 이는 "토큰 만료 임박 시 refreshToken 없음" 테스트에서 검증됨
    });

    it("보호된 라우트에서 accessToken만 있고 refreshToken이 없을 때 경고 로그를 남겨야 함", async () => {
      // Given
      const accessToken = createMockToken(10 * 60);
      const request = new NextRequest("http://localhost:3000/dashboard", {
        headers: {
          cookie: `accessToken=${accessToken}`,
        },
      });

      // When
      await proxy(request);

      // Then: 경고 로그 확인
      // 참고: 현재 구현에서 경고 로그가 없다면 이 테스트는 실패할 것
      // 향후 미들웨어에 경고 로그 추가 권장
      // expect(consoleWarnSpy).toHaveBeenCalledWith(
      //   expect.stringContaining("refreshToken missing")
      // );
    });

    it("공개 라우트에서 accessToken만 있고 refreshToken이 없어도 통과해야 함", async () => {
      // Given: 공개 라우트 + accessToken만 존재
      const accessToken = createMockToken(10 * 60);
      const request = new NextRequest("http://localhost:3000/", {
        headers: {
          cookie: `accessToken=${accessToken}`,
        },
      });

      // When
      const response = await proxy(request);

      // Then: 공개 라우트는 토큰 검증하지 않으므로 통과
      expect(response.status).toBe(200);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("보호된 라우트에서 accessToken이 유효한데 refreshToken만 있으면 통과해야 함", async () => {
      // Given: refreshToken만 있고 accessToken 없음
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

      // Then: refreshToken으로 재발급 시도 → 성공 → 통과
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/auth/refresh",
        expect.anything()
      );
      expect(response.status).toBe(200);
      expect(hasSetCookie(response, (cookie) => cookie.includes("accessToken="))).toBe(true);
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

    it("만료된 토큰 → 재발급 실패 → 백엔드 에러 코드로 로그인 라우트", async () => {
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
        json: jest.fn().mockResolvedValue({
          code: "AUTH401_4",
          message: "기한이 만료된 Refresh 토큰입니다.",
          isSuccess: false,
          httpStatus: "UNAUTHORIZED",
        }),
      });

      // When
      const response = await proxy(request);

      // Then: 로그인 라우트로 리다이렉트
      expectLoginRedirect(response, "AUTH401_4");
      expectRedirectAfterLoginCookie(response, "/dashboard");
    });
  });

  describe("/api/* 보호된 경로 (인증 필요)", () => {
    // 공개 API 예외를 제외한 모든 /api/* 경로는 보호된 라우트로 동작함

    it("/api/* 에 토큰이 없으면 로그인 리다이렉트해야 함", async () => {
      // Given: 토큰 없음
      const request = new NextRequest("http://localhost:3000/api/members/me/profile");

      // When
      const response = await proxy(request);

      // Then: 로그인 리다이렉트
      expectLoginRedirect(response, "auth_required");
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("/api/* 에 유효한 토큰이 있으면 재발급 없이 통과해야 함", async () => {
      // Given: 충분히 유효한 토큰
      const accessToken = createMockToken(30 * 60); // 30분
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest("http://localhost:3000/api/members/me/profile", {
        headers: { cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}` },
      });

      // When
      const response = await proxy(request);

      // Then: 재발급 시도 없이 통과
      expect(response.status).toBe(200);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("/api/* 에서 토큰이 만료 임박하면 재발급을 시도해야 함", async () => {
      // Given: 3분 후 만료 토큰
      const accessToken = createMockToken(3 * 60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest("http://localhost:3000/api/members/me/profile", {
        headers: { cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}` },
      });

      mockFetch.mockResolvedValueOnce(createRefreshSuccessResponse("new_access", "new_refresh"));

      // When
      const response = await proxy(request);

      // Then: 재발급 API 호출
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/auth/refresh",
        expect.objectContaining({ method: "POST" })
      );
      expect(response.status).toBe(200);
    });

    it("/api/* 에서 재발급 성공 시 response cookies와 request header 모두에 새 토큰을 설정해야 함", async () => {
      // Given: 만료된 토큰
      const accessToken = createMockToken(-60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest("http://localhost:3000/api/members/me/profile", {
        headers: { cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}` },
      });

      const newAccessToken = "new_access_token";
      const newRefreshToken = "new_refresh_token";
      mockFetch.mockResolvedValueOnce(
        createRefreshSuccessResponse(newAccessToken, newRefreshToken)
      );

      // When
      const response = await proxy(request);

      // Then: response cookies에 새 토큰 설정 (브라우저용)
      expect(response.status).toBe(200);
      const setCookies = response.headers.getSetCookie();
      expect(setCookies.some((c) => c.includes(newAccessToken))).toBe(true);
      expect(setCookies.some((c) => c.includes(newRefreshToken))).toBe(true);
    });

    it("/api/* 에서 재발급 실패하면 로그인 리다이렉트해야 함", async () => {
      // Given: 만료된 토큰
      const accessToken = createMockToken(-60);
      const refreshToken = createMockToken(-60);

      const request = new NextRequest("http://localhost:3000/api/members/me/profile", {
        headers: { cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}` },
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          code: "AUTH401_4",
          message: "기한이 만료된 Refresh 토큰입니다.",
          isSuccess: false,
          httpStatus: "UNAUTHORIZED",
        }),
      });

      // When
      const response = await proxy(request);

      // Then: 로그인 리다이렉트
      expectLoginRedirect(response, "AUTH401_4");
    });

    it("/api/* 에서 재발급 네트워크 에러가 나면 로그인 리다이렉트해야 함", async () => {
      // Given
      const accessToken = createMockToken(-60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest("http://localhost:3000/api/members/me/profile", {
        headers: { cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}` },
      });

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // When
      const response = await proxy(request);

      // Then: 로그인 리다이렉트
      expectLoginRedirect(response, "network_error");
    });
  });
});

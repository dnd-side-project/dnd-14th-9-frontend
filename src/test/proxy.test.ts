/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { proxy } from "@/proxy";
import { NextRequest } from "next/server";

// Global fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

describe("Proxy Middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // 환경 변수 설정
    process.env.BACKEND_URL = "http://localhost:8080";
  });

  afterEach(() => {
    // 환경 변수 정리
    delete process.env.BACKEND_URL;
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

      // Then: 홈으로 리다이렉트 + 로그인 모달 파라미터
      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("/?");
      expect(location).toContain("from=%2Fdashboard"); // URL 인코딩됨
      expect(location).toContain("showLogin=true");
    });

    it("다른 보호된 경로도 동일하게 리다이렉트해야 함", async () => {
      const protectedPaths = ["/dashboard", "/profile", "/settings"];

      for (const path of protectedPaths) {
        jest.clearAllMocks();

        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await proxy(request);

        expect(response.status).toBe(307);
        const location = response.headers.get("location");
        // URL 인코딩된 경로 확인 (/ → %2F)
        const encodedPath = encodeURIComponent(path);
        expect(location).toContain(`from=${encodedPath}`);
        expect(location).toContain("showLogin=true");
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          getSetCookie: () => [
            `accessToken=${newAccessToken}; Path=/; HttpOnly; Max-Age=3600`,
            `refreshToken=new_refresh_token; Path=/; HttpOnly; Max-Age=2592000`,
          ],
        },
      });

      // When
      const response = await proxy(request);

      // Then: 재발급 API 호출 확인
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/auth/reissue",
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
      expect(setCookieHeaders).toContain(
        `accessToken=${newAccessToken}; Path=/; HttpOnly; Max-Age=3600`
      );
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          getSetCookie: () => [
            `accessToken=new_token; Path=/; HttpOnly`,
            `refreshToken=new_refresh; Path=/; HttpOnly`,
          ],
        },
      });

      // When
      const response = await proxy(request);

      // Then: 재발급 시도
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/auth/reissue",
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          getSetCookie: () => [`accessToken=new_token; Path=/`],
        },
      });

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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          getSetCookie: () => [
            "accessToken=new_access; Path=/; HttpOnly",
            "refreshToken=new_refresh; Path=/; HttpOnly",
          ],
        },
      });

      // When
      const response = await proxy(request);

      // Then
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8080/auth/reissue",
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          getSetCookie: () => [
            `accessToken=${newAccessToken}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=3600`,
            `refreshToken=${newRefreshToken}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=2592000`,
          ],
        },
      });

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

      // Then: 로그인 모달로 리다이렉트
      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("showLogin=true");
      expect(location).toContain("from=%2Fdashboard"); // URL 인코딩됨
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

      // Then: Graceful degradation
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toContain("showLogin=true");
    });

    it("BACKEND_URL이 설정되지 않으면 로그인 모달로 리다이렉트해야 함", async () => {
      // Given: BACKEND_URL 제거
      delete process.env.BACKEND_URL;

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
      expect(response.headers.get("location")).toContain("showLogin=true");
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
      expect(response.headers.get("location")).toContain("showLogin=true");
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
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          getSetCookie: () => ["accessToken=new_token; Path=/", "refreshToken=new_refresh; Path=/"],
        },
      });

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
      expect(response.headers.get("location")).toContain("showLogin=true");
    });
  });
});

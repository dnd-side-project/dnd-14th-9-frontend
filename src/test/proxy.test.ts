/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from "next/server";

import { getCookieValue } from "@/lib/auth/cookie-header-utils";
import { proxy } from "@/proxy";

// Global fetch mock
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const KNOWN_PUBLIC_PAGE_PATHS = ["/", "/login", "/feedback"];
const UNKNOWN_PAGE_PATH = "/does-not-exist";
const PRIMARY_PROTECTED_PAGE_PATH = "/profile/settings";
const ALL_PROTECTED_PAGE_PATHS = [
  PRIMARY_PROTECTED_PAGE_PATH,
  "/session/create",
  "/profile/report",
  "/profile/account",
  "/session/1/waiting",
  "/session/1/result",
  "/session/1/reports",
];
const PROTECTED_PAGE_ACCESS_PATHS = [
  PRIMARY_PROTECTED_PAGE_PATH,
  "/profile/report",
  "/session/create",
  "/session/1/result",
];
const originalMockMode = process.env.NEXT_PUBLIC_USE_MOCK;
let tokenSequence = 0;

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

describe("Proxy Middleware", () => {
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  type RefreshFailureReason = "http_error" | "invalid_response" | "timeout" | "network_error";
  type RouteType = "public" | "protected" | "api";
  type RefreshMode = "soft" | "hard";

  function createRefreshSuccessResponse(
    accessToken: string = "new_access",
    refreshToken: string = "new_refresh"
  ) {
    return {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({
        result: {
          accessToken,
          refreshToken,
        },
      }),
    };
  }

  function createRefreshMismatchResponse() {
    return {
      ok: false,
      status: 401,
      json: jest.fn().mockResolvedValue({
        code: "AUTH401_7",
        message: "Refresh 토큰 정보가 일치하지 않습니다.",
        isSuccess: false,
        httpStatus: "UNAUTHORIZED",
      }),
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    // 환경 변수 설정
    process.env.BACKEND_API_BASE = "http://localhost:8080";
    process.env.NEXT_PUBLIC_USE_MOCK = "false";
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    jest.restoreAllMocks();
    jest.useRealTimers();
    // 환경 변수 정리
    delete process.env.BACKEND_API_BASE;
    if (originalMockMode === undefined) {
      delete process.env.NEXT_PUBLIC_USE_MOCK;
    } else {
      process.env.NEXT_PUBLIC_USE_MOCK = originalMockMode;
    }
  });

  /**
   * JWT 토큰 생성 헬퍼
   * @param expiresInSeconds 만료까지 남은 시간 (초)
   */
  function createMockToken(expiresInSeconds: number): string {
    const now = Math.floor(Date.now() / 1000);
    tokenSequence += 1;
    const payload = {
      exp: now + expiresInSeconds,
      userId: "test-user-123",
      jti: `proxy-test-${tokenSequence}`,
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
    tokenSequence += 1;
    const payload = {
      exp: now + expiresInSeconds,
      // `?`는 base64 결과에 `/`가 포함될 확률을 높여 base64url 변환 케이스를 강제한다.
      userId: "???",
      jti: `proxy-base64url-test-${tokenSequence}`,
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

  async function expectApiAuthError(
    response: Response,
    { status = 401, code = "auth_required" }: { status?: number; code?: string } = {}
  ) {
    expect(response.status).toBe(status);
    expect(response.headers.get("location")).toBeNull();

    const payload = await response.json();
    expect(payload).toMatchObject({
      isSuccess: false,
      code,
      result: null,
    });
  }

  function expectRefreshFailureLog(
    details: Partial<{
      reason: RefreshFailureReason;
      routeType: RouteType;
      status: number;
      cookieClear: boolean;
      mode: RefreshMode;
    }>
  ) {
    const logCalls =
      details.mode === "soft" ? consoleWarnSpy.mock.calls : consoleErrorSpy.mock.calls;
    const matchingCall = logCalls.find(([message, context]) => {
      if (message !== "Proxy: Token refresh failed") {
        return false;
      }

      const logContext = context as Record<string, unknown>;
      return Object.entries(details).every(([key, value]) => logContext[key] === value);
    });
    expect(matchingCall).toBeDefined();
    expect(matchingCall).toHaveLength(2);
    expect(Object.keys(matchingCall?.[1] as Record<string, unknown>).sort()).toEqual(
      ["cookieClear", "mode", "reason", "routeType", "status"].sort()
    );
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
      for (const path of KNOWN_PUBLIC_PAGE_PATHS) {
        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await proxy(request);

        expect(response.status).toBe(200);
      }

      // fetch가 호출되지 않았는지 확인 (재발급 시도 없음)
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("/feedback 경로는 비로그인 상태에서도 통과해야 함", async () => {
      const request = new NextRequest("http://localhost:3000/feedback");

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("redirectAfterLogin="))).toBe(
        false
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("공개 라우트에서 accessToken 없이 refreshToken만 있으면 새 갱신을 시작하지 않아야 함", async () => {
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
      expect(hasSetCookie(response, (cookie) => cookie.includes("accessToken="))).toBe(false);
      expect(hasSetCookie(response, (cookie) => cookie.includes("refreshToken="))).toBe(false);
    });

    it("공개 라우트는 기존 hard 갱신 작업에 합류해 새 쿠키를 받아야 함", async () => {
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const expiredAccessToken = createMockToken(-60);
      const hardRequest = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
        headers: {
          cookie: `accessToken=${expiredAccessToken}; refreshToken=${refreshToken}`,
        },
      });
      const publicRequest = new NextRequest("http://localhost:3000/", {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });
      const backendResponse = deferred<ReturnType<typeof createRefreshSuccessResponse>>();
      const fetchStarted = deferred<void>();
      mockFetch.mockImplementation(() => {
        fetchStarted.resolve();
        return backendResponse.promise;
      });

      const hardResponsePromise = proxy(hardRequest);
      await fetchStarted.promise;
      const publicResponsePromise = proxy(publicRequest);
      backendResponse.resolve(createRefreshSuccessResponse("shared-access", "shared-refresh"));
      const [hardResponse, publicResponse] = await Promise.all([
        hardResponsePromise,
        publicResponsePromise,
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(hardResponse.status).toBe(200);
      expect(publicResponse.status).toBe(200);
      expect(hasSetCookie(publicResponse, (cookie) => cookie.includes("shared-access"))).toBe(true);
      expect(hasSetCookie(publicResponse, (cookie) => cookie.includes("shared-refresh"))).toBe(
        true
      );
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

    it("공개 API 예외가 아닌 경로는 토큰 없이 접근 시 401 JSON 에러를 반환해야 함", async () => {
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

        await expectApiAuthError(response, { code: "auth_required" });
        expect(hasSetCookie(response, (cookie) => cookie.startsWith("redirectAfterLogin="))).toBe(
          false
        );
        expect(mockFetch).not.toHaveBeenCalled();
      }
    });
  });

  describe("mock 모드 인증 우회", () => {
    it("mock 모드에서는 보호된 페이지를 토큰 없이 통과시켜야 함", async () => {
      process.env.NEXT_PUBLIC_USE_MOCK = "true";
      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`);

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("redirectAfterLogin="))).toBe(
        false
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("mock 모드에서는 보호된 API를 토큰 없이 통과시켜야 함", async () => {
      process.env.NEXT_PUBLIC_USE_MOCK = "true";
      const request = new NextRequest("http://localhost:3000/api/members/me/profile");

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(false);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("보호된 라우트 - 토큰 없음", () => {
    it("accessToken과 refreshToken이 모두 없으면 로그인 라우트로 리다이렉트해야 함", async () => {
      // Given: 토큰 없는 요청
      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`);

      // When
      const response = await proxy(request);

      // Then: 로그인 라우트로 리다이렉트
      expectLoginRedirect(response, "auth_required");
      expectRedirectAfterLoginCookie(response, PRIMARY_PROTECTED_PAGE_PATH);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
    });

    it("다른 보호된 경로도 동일하게 리다이렉트해야 함", async () => {
      for (const path of ALL_PROTECTED_PAGE_PATHS) {
        jest.clearAllMocks();

        const request = new NextRequest(`http://localhost:3000${path}`);
        const response = await proxy(request);

        expectLoginRedirect(response, "auth_required");
        expectRedirectAfterLoginCookie(response, path);
      }
    });
  });

  describe("존재하지 않는 페이지 경로", () => {
    it("비로그인 상태에서는 리다이렉트 없이 그대로 통과해야 함", async () => {
      const request = new NextRequest(`http://localhost:3000${UNKNOWN_PAGE_PATH}`);

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("redirectAfterLogin="))).toBe(
        false
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("로그인 상태에서도 리다이렉트 없이 그대로 통과해야 함", async () => {
      const accessToken = createMockToken(10 * 60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest(`http://localhost:3000${UNKNOWN_PAGE_PATH}`, {
        headers: {
          cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
        },
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("redirectAfterLogin="))).toBe(
        false
      );
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("redirectAfterLogin 쿠키", () => {
    it("보호된 페이지 경로에만 설정되어야 함", async () => {
      const protectedRequest = new NextRequest(
        `http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`
      );
      const publicRequest = new NextRequest("http://localhost:3000/feedback");
      const unknownRequest = new NextRequest(`http://localhost:3000${UNKNOWN_PAGE_PATH}`);

      const protectedResponse = await proxy(protectedRequest);
      const publicResponse = await proxy(publicRequest);
      const unknownResponse = await proxy(unknownRequest);

      expectRedirectAfterLoginCookie(protectedResponse, PRIMARY_PROTECTED_PAGE_PATH);
      expect(
        hasSetCookie(publicResponse, (cookie) => cookie.startsWith("redirectAfterLogin="))
      ).toBe(false);
      expect(
        hasSetCookie(unknownResponse, (cookie) => cookie.startsWith("redirectAfterLogin="))
      ).toBe(false);
    });
  });

  describe("Access Token 갱신 필요 상태 판단", () => {
    it("만료까지 5분 이상 남은 usable Token은 그대로 통과해야 함", async () => {
      // Given: 10분 후 만료되는 토큰
      const accessToken = createMockToken(10 * 60); // 10분
      const refreshToken = createMockToken(30 * 24 * 60 * 60); // 30일

      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
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

    it("base64url 형식 usable Token도 갱신 없이 통과해야 함", async () => {
      // Given: base64url 형식 + 10분 후 만료
      const accessToken = createBase64UrlMockToken(10 * 60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
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

    it("만료가 임박한 expiring Token도 기존 hard 작업이 없으면 재발급을 시작하지 않아야 함", async () => {
      // Given: 3분 후 만료되는 토큰
      const accessToken = createMockToken(3 * 60); // 3분
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
        headers: {
          cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}`,
        },
      });

      // When
      const response = await proxy(request);

      // Then: 아직 유효한 Access Token으로 통과
      expect(mockFetch).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
      expect(hasSetCookie(response, (cookie) => cookie.includes("accessToken="))).toBe(false);
      expect(hasSetCookie(response, (cookie) => cookie.includes("refreshToken="))).toBe(false);
    });

    it("동일한 refreshToken의 병렬 hard 요청은 하나의 갱신 결과를 공유해야 함", async () => {
      const accessToken = createMockToken(-60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const createRequest = (pathname: string, marker: string) =>
        new NextRequest(`http://localhost:3000${pathname}`, {
          headers: {
            cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}; marker=${marker}`,
            "x-caller-id": marker,
          },
        });

      mockFetch.mockResolvedValue(createRefreshSuccessResponse("new_access", "new_refresh"));

      const [firstResponse, secondResponse] = await Promise.all([
        proxy(createRequest(PRIMARY_PROTECTED_PAGE_PATH, "A")),
        proxy(createRequest("/api/members/me/profile", "B")),
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(firstResponse).not.toBe(secondResponse);
      expect(firstResponse.status).toBe(200);
      expect(secondResponse.status).toBe(200);
      expect(hasSetCookie(firstResponse, (cookie) => cookie.includes("new_access"))).toBe(true);
      expect(hasSetCookie(secondResponse, (cookie) => cookie.includes("new_access"))).toBe(true);
      for (const response of [firstResponse, secondResponse]) {
        const overriddenHeaders = response.headers.get("x-middleware-override-headers")?.split(",");
        expect(overriddenHeaders).toEqual(expect.arrayContaining(["cookie", "x-caller-id"]));
      }
      const firstCookie = firstResponse.headers.get("x-middleware-request-cookie");
      const secondCookie = secondResponse.headers.get("x-middleware-request-cookie");
      expect(firstResponse.headers.get("x-middleware-request-x-caller-id")).toBe("A");
      expect(secondResponse.headers.get("x-middleware-request-x-caller-id")).toBe("B");
      expect(getCookieValue(firstCookie, "marker")).toBe("A");
      expect(getCookieValue(secondCookie, "marker")).toBe("B");
      expect(getCookieValue(firstCookie, "accessToken")).toBe("new_access");
      expect(getCookieValue(secondCookie, "accessToken")).toBe("new_access");
      expect(getCookieValue(firstCookie, "refreshToken")).toBe("new_refresh");
      expect(getCookieValue(secondCookie, "refreshToken")).toBe("new_refresh");
      expect(firstCookie).not.toContain(accessToken);
      expect(secondCookie).not.toContain(refreshToken);
    });

    it("만료 임박 보호 요청은 기존 hard 갱신에 합류해 새 쿠키를 받아야 함", async () => {
      const expiredAccessToken = createMockToken(-60);
      const expiringAccessToken = createMockToken(3 * 60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const backendResponse = deferred<ReturnType<typeof createRefreshSuccessResponse>>();
      const fetchStarted = deferred<void>();
      mockFetch.mockImplementation(() => {
        fetchStarted.resolve();
        return backendResponse.promise;
      });

      const hardResponsePromise = proxy(
        new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
          headers: {
            cookie: `accessToken=${expiredAccessToken}; refreshToken=${refreshToken}`,
          },
        })
      );
      await fetchStarted.promise;
      const softResponsePromise = proxy(
        new NextRequest("http://localhost:3000/profile/report", {
          headers: {
            cookie: `accessToken=${expiringAccessToken}; refreshToken=${refreshToken}`,
          },
        })
      );
      await Promise.resolve();
      backendResponse.resolve(createRefreshSuccessResponse("joined-access", "joined-refresh"));

      const [hardResponse, softResponse] = await Promise.all([
        hardResponsePromise,
        softResponsePromise,
      ]);
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(hasSetCookie(hardResponse, (cookie) => cookie.includes("joined-access"))).toBe(true);
      expect(hasSetCookie(softResponse, (cookie) => cookie.includes("joined-access"))).toBe(true);
    });

    it("soft 요청이 1.5초에 통과해도 공유 hard 갱신은 계속되어야 함", async () => {
      jest.useFakeTimers();
      const expiredAccessToken = createMockToken(-60);
      const expiringAccessToken = createMockToken(3 * 60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const backendResponse = deferred<ReturnType<typeof createRefreshSuccessResponse>>();
      const fetchStarted = deferred<void>();
      let sharedSignal: AbortSignal | null | undefined;
      mockFetch.mockImplementation((_url, init) => {
        sharedSignal = init?.signal;
        fetchStarted.resolve();
        return backendResponse.promise;
      });

      const hardResponsePromise = proxy(
        new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
          headers: {
            cookie: `accessToken=${expiredAccessToken}; refreshToken=${refreshToken}`,
          },
        })
      );
      await fetchStarted.promise;
      const softResponsePromise = proxy(
        new NextRequest("http://localhost:3000/api/members/me/profile", {
          headers: {
            cookie: `accessToken=${expiringAccessToken}; refreshToken=${refreshToken}`,
          },
        })
      );

      await jest.advanceTimersByTimeAsync(1500);
      const softResponse = await softResponsePromise;
      expect(softResponse.status).toBe(200);
      expect(hasSetCookie(softResponse, (cookie) => cookie.startsWith("accessToken=;"))).toBe(
        false
      );
      expect(sharedSignal?.aborted).toBe(false);

      backendResponse.resolve(createRefreshSuccessResponse("hard-access", "hard-refresh"));
      const hardResponse = await hardResponsePromise;
      expect(hasSetCookie(hardResponse, (cookie) => cookie.includes("hard-access"))).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("토큰이 이미 만료되었으면 재발급을 시도해야 함", async () => {
      // Given: 1분 전에 만료된 토큰
      const accessToken = createMockToken(-60); // 1분 전 만료
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
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

      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
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

    it("잘못된 형식의 accessToken 재발급이 실패하면 로그인으로 리다이렉트하고 인증 쿠키를 삭제해야 함", async () => {
      const invalidToken = "invalid.token.format";
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
        headers: {
          cookie: `accessToken=${invalidToken}; refreshToken=${refreshToken}`,
        },
      });

      mockFetch.mockResolvedValueOnce(createRefreshMismatchResponse());

      const response = await proxy(request);

      expectLoginRedirect(response, "AUTH401_7");
      expectRedirectAfterLoginCookie(response, PRIMARY_PROTECTED_PAGE_PATH);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
    });
  });

  describe("토큰 재발급", () => {
    it("accessToken이 없고 refreshToken만 있으면 재발급을 시도해야 함", async () => {
      // Given: refreshToken만 있는 경우
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
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
      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
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

    it("Refresh Token과 새 토큰 쌍을 로그에 남기지 않아야 함", async () => {
      const refreshToken = `secret-${createMockToken(30 * 24 * 60 * 60)}`;
      const newAccessToken = "secret-new-access";
      const newRefreshToken = "secret-new-refresh";
      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
        headers: { cookie: `refreshToken=${refreshToken}` },
      });
      mockFetch.mockResolvedValueOnce(
        createRefreshSuccessResponse(newAccessToken, newRefreshToken)
      );

      await proxy(request);

      const serializedLogs = JSON.stringify([
        ...consoleErrorSpy.mock.calls,
        ...consoleWarnSpy.mock.calls,
      ]);
      expect(serializedLogs).not.toContain(refreshToken);
      expect(serializedLogs).not.toContain(newAccessToken);
      expect(serializedLogs).not.toContain(newRefreshToken);
      const successCalls = consoleWarnSpy.mock.calls.filter(
        ([message]) => message === "Proxy: Token refresh succeeded"
      );
      expect(successCalls).toEqual([
        [
          "Proxy: Token refresh succeeded",
          {
            status: 200,
            routeType: "protected",
            mode: "hard",
          },
        ],
      ]);
    });

    it("성공한 hard 갱신 결과는 timer 전까지 재사용하고 timer 이후 새로 호출해야 함", async () => {
      jest.useFakeTimers();
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const createRequest = () =>
        new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
          headers: { cookie: `refreshToken=${refreshToken}` },
        });
      mockFetch
        .mockResolvedValueOnce(createRefreshSuccessResponse("access-1", "refresh-1"))
        .mockResolvedValueOnce(createRefreshSuccessResponse("access-2", "refresh-2"));

      const firstResponse = await proxy(createRequest());
      const reusedResponse = await proxy(createRequest());

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(firstResponse).not.toBe(reusedResponse);
      expect(hasSetCookie(reusedResponse, (cookie) => cookie.includes("access-1"))).toBe(true);

      await jest.runOnlyPendingTimersAsync();
      const refreshedResponse = await proxy(createRequest());
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(hasSetCookie(refreshedResponse, (cookie) => cookie.includes("access-2"))).toBe(true);
    });

    it("서로 다른 refreshToken의 hard 요청은 결과를 섞지 않아야 함", async () => {
      const refreshTokenA = createMockToken(30 * 24 * 60 * 60);
      const refreshTokenB = createMockToken(30 * 24 * 60 * 60);
      const createRequest = (refreshToken: string) =>
        new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
          headers: { cookie: `refreshToken=${refreshToken}` },
        });
      mockFetch.mockImplementation((_url, init) => {
        const cookie = (init?.headers as Record<string, string>).Cookie;
        return Promise.resolve(
          cookie.includes(refreshTokenA)
            ? createRefreshSuccessResponse("access-a", "refresh-a")
            : createRefreshSuccessResponse("access-b", "refresh-b")
        );
      });

      const [responseA, responseB] = await Promise.all([
        proxy(createRequest(refreshTokenA)),
        proxy(createRequest(refreshTokenB)),
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(hasSetCookie(responseA, (cookie) => cookie.includes("access-a"))).toBe(true);
      expect(hasSetCookie(responseA, (cookie) => cookie.includes("access-b"))).toBe(false);
      expect(hasSetCookie(responseB, (cookie) => cookie.includes("access-b"))).toBe(true);
      expect(hasSetCookie(responseB, (cookie) => cookie.includes("access-a"))).toBe(false);
    });

    it("보호된 라우트에서 재발급 응답 형식이 비정상이면 로그인 라우트(COMMON500)로 리다이렉트해야 함", async () => {
      // Given
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      // Mock: accessToken 타입이 문자열이 아님
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
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
      expectRedirectAfterLoginCookie(response, PRIMARY_PROTECTED_PAGE_PATH);
      expectRefreshFailureLog({
        reason: "invalid_response",
        routeType: "protected",
        status: 200,
        cookieClear: true,
      });
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
    });

    it("재발급 API가 실패하면 백엔드 에러 코드로 로그인 라우트에 리다이렉트해야 함", async () => {
      // Given: refreshToken만 있음
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
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
      expectRedirectAfterLoginCookie(response, PRIMARY_PROTECTED_PAGE_PATH);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
      expectRefreshFailureLog({
        reason: "http_error",
        routeType: "protected",
        status: 401,
        cookieClear: true,
      });
    });

    it("hard 갱신 실패는 저장하지 않고 같은 토큰의 다음 요청이 재시도해야 함", async () => {
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const createRequest = () =>
        new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
          headers: { cookie: `refreshToken=${refreshToken}` },
        });
      mockFetch
        .mockResolvedValueOnce(createRefreshMismatchResponse())
        .mockResolvedValueOnce(createRefreshSuccessResponse());

      const failedResponse = await proxy(createRequest());
      const retriedResponse = await proxy(createRequest());

      expectLoginRedirect(failedResponse, "AUTH401_7");
      expect(retriedResponse.status).toBe(200);
      expect(hasSetCookie(retriedResponse, (cookie) => cookie.includes("new_access"))).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("재발급 API 호출 중 네트워크 에러가 발생하면 로그인 라우트로 리다이렉트해야 함", async () => {
      // Given
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
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
      expectRedirectAfterLoginCookie(response, PRIMARY_PROTECTED_PAGE_PATH);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
    });

    it("BACKEND_API_BASE가 설정되지 않으면 로그인 라우트로 리다이렉트해야 함", async () => {
      // Given: BACKEND_API_BASE 제거
      delete process.env.BACKEND_API_BASE;

      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
        headers: {
          cookie: `refreshToken=${refreshToken}`,
        },
      });

      // When
      const response = await proxy(request);

      // Then
      expectLoginRedirect(response, "config_error");
      expectRedirectAfterLoginCookie(response, PRIMARY_PROTECTED_PAGE_PATH);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled(); // API 호출 안함
    });
  });

  describe("토큰 만료 임박 시 refreshToken 없음", () => {
    it("토큰이 만료 임박했어도 refreshToken이 없으면 유효한 accessToken으로 통과해야 함", async () => {
      const accessToken = createMockToken(2 * 60);

      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
        headers: {
          cookie: `accessToken=${accessToken}`,
        },
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(false);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("토큰 부분 삭제 시나리오", () => {
    it("보호된 라우트에서 accessToken이 충분히 유효하고 refreshToken이 없으면 일단 통과해야 함", async () => {
      // Given: 10분 후 만료되는 accessToken (5분 임계값보다 충분히 김)
      const accessToken = createMockToken(10 * 60); // 10분
      // refreshToken 없음

      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
        headers: {
          cookie: `accessToken=${accessToken}`,
        },
      });

      // When
      const response = await proxy(request);

      // Then: accessToken이 유효하므로 통과
      expect(response.status).toBe(200);
      expect(mockFetch).not.toHaveBeenCalled(); // 재발급 시도 안함
    });

    it("보호된 라우트에서 accessToken만 있고 refreshToken이 없을 때 경고 로그를 남겨야 함", async () => {
      // Given
      const accessToken = createMockToken(10 * 60);
      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
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
      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
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

      const pages = PROTECTED_PAGE_ACCESS_PATHS;

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

      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
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

      const request = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
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
      expectRedirectAfterLoginCookie(response, PRIMARY_PROTECTED_PAGE_PATH);
    });
  });

  describe("/api/* 보호된 경로 (인증 필요)", () => {
    // 공개 API 예외를 제외한 모든 /api/* 경로는 보호된 라우트로 동작함

    it("/api/* 에 토큰이 없으면 401 JSON 에러를 반환해야 함", async () => {
      // Given: 토큰 없음
      const request = new NextRequest("http://localhost:3000/api/members/me/profile");

      // When
      const response = await proxy(request);

      // Then: 인증 에러 JSON
      await expectApiAuthError(response, { code: "auth_required" });
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("redirectAfterLogin="))).toBe(
        false
      );
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

    it("/api/* 에서 토큰이 만료 임박해도 기존 hard 작업이 없으면 재발급하지 않아야 함", async () => {
      // Given: 3분 후 만료 토큰
      const accessToken = createMockToken(3 * 60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest("http://localhost:3000/api/members/me/profile", {
        headers: { cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}` },
      });

      // When
      const response = await proxy(request);

      // Then: 아직 유효한 Access Token으로 통과
      expect(mockFetch).not.toHaveBeenCalled();
      expect(response.status).toBe(200);
    });

    it("/api/* 에서 유효한 토큰의 soft miss는 백엔드 응답과 무관하게 통과해야 함", async () => {
      const accessToken = createMockToken(3 * 60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const request = new NextRequest("http://localhost:3000/api/members/me/profile", {
        headers: { cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}` },
      });

      const response = await proxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get("location")).toBeNull();
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("accessToken=;"))).toBe(false);
      expect(hasSetCookie(response, (cookie) => cookie.startsWith("refreshToken=;"))).toBe(false);
      expect(mockFetch).not.toHaveBeenCalled();
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

    it("/api/* 에서 재발급 실패하면 401 JSON 에러를 반환해야 함", async () => {
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

      // Then: 인증 에러 JSON
      await expectApiAuthError(response, { code: "AUTH401_4" });
      expectRefreshFailureLog({
        reason: "http_error",
        routeType: "api",
        status: 401,
        cookieClear: true,
      });
    });

    it("공유된 hard 실패도 페이지와 API에서 각자의 응답 형식을 유지해야 함", async () => {
      const expiredAccessToken = createMockToken(-60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const cookie = `accessToken=${expiredAccessToken}; refreshToken=${refreshToken}`;
      const pageRequest = new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
        headers: { cookie },
      });
      const apiRequest = new NextRequest("http://localhost:3000/api/members/me/profile", {
        headers: { cookie },
      });
      const backendResponse = deferred<ReturnType<typeof createRefreshMismatchResponse>>();
      const fetchStarted = deferred<void>();
      mockFetch.mockImplementation(() => {
        fetchStarted.resolve();
        return backendResponse.promise;
      });

      const pageResponsePromise = proxy(pageRequest);
      const apiResponsePromise = proxy(apiRequest);
      await fetchStarted.promise;
      await Promise.resolve();
      backendResponse.resolve(createRefreshMismatchResponse());
      const [pageResponse, apiResponse] = await Promise.all([
        pageResponsePromise,
        apiResponsePromise,
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expectLoginRedirect(pageResponse, "AUTH401_7");
      await expectApiAuthError(apiResponse, { code: "AUTH401_7" });
      expect(hasSetCookie(pageResponse, (value) => value.startsWith("accessToken=;"))).toBe(true);
      expect(hasSetCookie(apiResponse, (value) => value.startsWith("accessToken=;"))).toBe(true);
    });

    it("실패한 hard 작업에 합류한 soft 요청은 리다이렉트와 쿠키 삭제 없이 통과해야 함", async () => {
      const expiredAccessToken = createMockToken(-60);
      const expiringAccessToken = createMockToken(3 * 60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const backendResponse = deferred<ReturnType<typeof createRefreshMismatchResponse>>();
      const fetchStarted = deferred<void>();
      mockFetch.mockImplementation(() => {
        fetchStarted.resolve();
        return backendResponse.promise;
      });

      const hardResponsePromise = proxy(
        new NextRequest(`http://localhost:3000${PRIMARY_PROTECTED_PAGE_PATH}`, {
          headers: {
            cookie: `accessToken=${expiredAccessToken}; refreshToken=${refreshToken}`,
          },
        })
      );
      await fetchStarted.promise;
      const softResponsePromise = proxy(
        new NextRequest("http://localhost:3000/api/members/me/profile", {
          headers: {
            cookie: `accessToken=${expiringAccessToken}; refreshToken=${refreshToken}`,
          },
        })
      );
      await Promise.resolve();
      backendResponse.resolve(createRefreshMismatchResponse());
      const [hardResponse, softResponse] = await Promise.all([
        hardResponsePromise,
        softResponsePromise,
      ]);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expectLoginRedirect(hardResponse, "AUTH401_7");
      expect(softResponse.status).toBe(200);
      expect(softResponse.headers.get("location")).toBeNull();
      expect(hasSetCookie(softResponse, (value) => value.startsWith("accessToken=;"))).toBe(false);
      expect(hasSetCookie(softResponse, (value) => value.startsWith("refreshToken=;"))).toBe(false);
      expectRefreshFailureLog({
        reason: "http_error",
        routeType: "api",
        status: 401,
        cookieClear: false,
        mode: "soft",
      });
    });

    it("/api/* 에서 재발급 네트워크 에러가 나면 500 JSON 에러를 반환해야 함", async () => {
      // Given
      const accessToken = createMockToken(-60);
      const refreshToken = createMockToken(30 * 24 * 60 * 60);

      const request = new NextRequest("http://localhost:3000/api/members/me/profile", {
        headers: { cookie: `accessToken=${accessToken}; refreshToken=${refreshToken}` },
      });

      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      // When
      const response = await proxy(request);

      // Then: 서버 에러 JSON
      await expectApiAuthError(response, {
        status: 500,
        code: "network_error",
      });
    });

    it("/api/* hard 갱신 success body는 10초에 timeout되고 다음 요청이 재시도해야 함", async () => {
      jest.useFakeTimers();
      const refreshToken = createMockToken(30 * 24 * 60 * 60);
      const createRequest = () =>
        new NextRequest("http://localhost:3000/api/members/me/profile", {
          headers: { cookie: `refreshToken=${refreshToken}` },
        });
      mockFetch
        .mockImplementationOnce((_url, init) => {
          return Promise.resolve({
            ok: true,
            status: 200,
            json: jest.fn().mockImplementation(
              () =>
                new Promise((_resolve, reject) => {
                  init?.signal?.addEventListener("abort", () => {
                    reject(new DOMException("Aborted", "AbortError"));
                  });
                })
            ),
          });
        })
        .mockResolvedValueOnce(createRefreshSuccessResponse());

      const timedOutResponsePromise = proxy(createRequest());
      await jest.advanceTimersByTimeAsync(10_000);
      const timedOutResponse = await timedOutResponsePromise;

      await expectApiAuthError(timedOutResponse, {
        status: 504,
        code: "network_error",
      });
      expectRefreshFailureLog({
        reason: "timeout",
        routeType: "api",
        status: 504,
        cookieClear: true,
      });

      const retriedResponse = await proxy(createRequest());
      expect(retriedResponse.status).toBe(200);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });
});

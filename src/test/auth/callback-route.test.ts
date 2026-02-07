/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { GET } from "@/app/auth/callback/[provider]/route";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// Next.js cookies() mock
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

function setNodeEnv(value: string | undefined) {
  Object.defineProperty(process.env, "NODE_ENV", {
    value,
    configurable: true,
    writable: true,
  });
}

describe("OAuth Callback Route Handler", () => {
  let mockCookieStore: {
    set: jest.Mock;
    get: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    // 매 테스트마다 새로운 mock 객체 생성
    mockCookieStore = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
    };

    (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("성공 케이스", () => {
    it("토큰이 있으면 쿠키에 저장하고 홈으로 리다이렉트해야 함", async () => {
      // Given: 토큰이 포함된 요청
      const url =
        "http://localhost:3000/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      // When: 핸들러 실행
      const response = await GET(request);

      // Then: 쿠키 저장 확인
      expect(mockCookieStore.set).toHaveBeenCalledTimes(2);

      // accessToken 쿠키 저장 확인
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "accessToken",
        "access123",
        expect.objectContaining({
          httpOnly: true,
          maxAge: 60 * 60, // 1시간
          path: "/",
        })
      );

      // refreshToken 쿠키 저장 확인
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "refreshToken",
        "refresh456",
        expect.objectContaining({
          httpOnly: true,
          maxAge: 60 * 60 * 24 * 30, // 30일
          path: "/",
        })
      );

      // 리다이렉트 확인
      expect(response.status).toBe(307); // NextResponse.redirect는 307 상태 코드
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
    });

    it("redirectAfterLogin 쿠키가 있으면 해당 경로로 리다이렉트해야 함", async () => {
      // Given: redirectAfterLogin 쿠키 설정
      mockCookieStore.get.mockReturnValue({ value: "/dashboard" });

      const url =
        "http://localhost:3000/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      // When
      const response = await GET(request);

      // Then: 저장된 경로로 리다이렉트
      expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");

      // redirectAfterLogin 쿠키 삭제 확인
      expect(mockCookieStore.delete).toHaveBeenCalledWith("redirectAfterLogin");
    });

    it("redirectAfterLogin 쿠키가 없으면 홈으로 리다이렉트해야 함", async () => {
      // Given: redirectAfterLogin 쿠키 없음
      mockCookieStore.get.mockReturnValue(undefined);

      const url =
        "http://localhost:3000/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      // When
      const response = await GET(request);

      // Then: 기본값인 홈으로 리다이렉트
      expect(response.headers.get("location")).toBe("http://localhost:3000/");
    });
  });

  describe("에러 케이스", () => {
    it("error 파라미터가 있으면 에러와 함께 홈으로 리다이렉트해야 함", async () => {
      // Given: error 파라미터가 있는 요청
      const url = "http://localhost:3000/auth/callback/google?error=access_denied";
      const request = new NextRequest(url);

      // When
      const response = await GET(request);

      // Then: 에러 파라미터와 함께 리다이렉트
      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("showLogin=true");
      expect(location).toContain("error=access_denied");

      // 쿠키는 저장하지 않음
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it("accessToken이 없으면 에러와 함께 리다이렉트해야 함", async () => {
      // Given: accessToken 없이 refreshToken만 있는 요청
      const url = "http://localhost:3000/auth/callback/google?refreshToken=refresh456";
      const request = new NextRequest(url);

      // When
      const response = await GET(request);

      // Then
      const location = response.headers.get("location");
      expect(location).toContain("showLogin=true");
      expect(location).toContain("error=no_token");
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it("refreshToken이 없으면 에러와 함께 리다이렉트해야 함", async () => {
      // Given: refreshToken 없이 accessToken만 있는 요청
      const url = "http://localhost:3000/auth/callback/google?accessToken=access123";
      const request = new NextRequest(url);

      // When
      const response = await GET(request);

      // Then
      const location = response.headers.get("location");
      expect(location).toContain("error=no_token");
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });

    it("토큰이 모두 없으면 에러와 함께 리다이렉트해야 함", async () => {
      // Given: 토큰이 전혀 없는 요청
      const url = "http://localhost:3000/auth/callback/google";
      const request = new NextRequest(url);

      // When
      const response = await GET(request);

      // Then
      expect(response.status).toBe(307);
      const location = response.headers.get("location");
      expect(location).toContain("showLogin=true");
      expect(location).toContain("error=no_token");
      expect(mockCookieStore.set).not.toHaveBeenCalled();
    });
  });

  describe("환경별 쿠키 설정", () => {
    let originalEnv: string | undefined;

    beforeEach(() => {
      originalEnv = process.env.NODE_ENV;
    });

    afterEach(() => {
      // 환경 변수 복원
      setNodeEnv(originalEnv);
    });

    it("production 환경에서는 secure와 sameSite none을 설정해야 함", async () => {
      // Given: production 환경
      setNodeEnv("production");

      const url =
        "http://localhost:3000/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      // When
      await GET(request);

      // Then: production 설정 확인
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "accessToken",
        "access123",
        expect.objectContaining({
          secure: true,
          sameSite: "none",
        })
      );

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "refreshToken",
        "refresh456",
        expect.objectContaining({
          secure: true,
          sameSite: "none",
        })
      );
    });

    it("development 환경에서는 secure false와 sameSite lax를 설정해야 함", async () => {
      // Given: development 환경
      setNodeEnv("development");

      const url =
        "http://localhost:3000/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      // When
      await GET(request);

      // Then: development 설정 확인
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "accessToken",
        "access123",
        expect.objectContaining({
          secure: false,
          sameSite: "lax",
        })
      );

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "refreshToken",
        "refresh456",
        expect.objectContaining({
          secure: false,
          sameSite: "lax",
        })
      );
    });

    it("test 환경에서는 development와 동일하게 설정해야 함", async () => {
      // Given: test 환경 (NODE_ENV가 'test'일 때)
      setNodeEnv("test");

      const url =
        "http://localhost:3000/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      // When
      await GET(request);

      // Then: production이 아니므로 secure: false, sameSite: lax
      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "accessToken",
        "access123",
        expect.objectContaining({
          secure: false,
          sameSite: "lax",
        })
      );
    });
  });

  describe("다양한 Provider", () => {
    it("Google provider로 로그인해도 정상 동작해야 함", async () => {
      const url =
        "http://localhost:3000/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
    });

    it("Kakao provider로 로그인해도 정상 동작해야 함", async () => {
      const url =
        "http://localhost:3000/auth/callback/kakao?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
    });

    it("Naver provider로 로그인해도 정상 동작해야 함", async () => {
      const url =
        "http://localhost:3000/auth/callback/naver?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(mockCookieStore.set).toHaveBeenCalledTimes(2);
    });
  });

  describe("쿠키 만료 시간", () => {
    it("accessToken은 1시간(3600초) 만료 시간을 가져야 함", async () => {
      const url =
        "http://localhost:3000/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      await GET(request);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "accessToken",
        "access123",
        expect.objectContaining({
          maxAge: 3600, // 60 * 60
        })
      );
    });

    it("refreshToken은 30일(2592000초) 만료 시간을 가져야 함", async () => {
      const url =
        "http://localhost:3000/auth/callback/google?accessToken=access123&refreshToken=refresh456";
      const request = new NextRequest(url);

      await GET(request);

      expect(mockCookieStore.set).toHaveBeenCalledWith(
        "refreshToken",
        "refresh456",
        expect.objectContaining({
          maxAge: 2592000, // 60 * 60 * 24 * 30
        })
      );
    });
  });
});

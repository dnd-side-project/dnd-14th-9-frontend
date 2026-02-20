import {
  LOGIN_PROVIDERS,
  getLoginReasonMessage,
  isLoginProvider,
  normalizeInternalPath,
} from "@/lib/auth/login-policy";

describe("login-policy", () => {
  describe("isLoginProvider", () => {
    const [googleProvider, kakaoProvider] = LOGIN_PROVIDERS;

    it("google과 kakao만 유효한 provider로 허용해야 함", () => {
      expect(isLoginProvider(googleProvider)).toBe(true);
      expect(isLoginProvider(kakaoProvider)).toBe(true);
      expect(isLoginProvider("naver")).toBe(false);
      expect(isLoginProvider("")).toBe(false);
      expect(isLoginProvider(null)).toBe(false);
      expect(isLoginProvider(undefined)).toBe(false);
    });
  });

  describe("normalizeInternalPath", () => {
    it("빈 값은 루트(/)로 폴백해야 함", () => {
      expect(normalizeInternalPath(undefined)).toBe("/");
      expect(normalizeInternalPath(null)).toBe("/");
      expect(normalizeInternalPath("")).toBe("/");
    });

    it("외부/비정상 경로는 루트(/)로 폴백해야 함", () => {
      expect(normalizeInternalPath("https://malicious.com")).toBe("/");
      expect(normalizeInternalPath("//evil.com")).toBe("/");
      expect(normalizeInternalPath("dashboard")).toBe("/");
    });

    it("/login 및 /login? 쿼리 경로는 루트(/)로 폴백해야 함", () => {
      expect(normalizeInternalPath("/login")).toBe("/");
      expect(normalizeInternalPath("/login?reason=auth_required")).toBe("/");
    });

    it("/api 경로는 루트(/)로 폴백해야 함", () => {
      expect(normalizeInternalPath("/api")).toBe("/");
      expect(normalizeInternalPath("/api/members/me/profile")).toBe("/");
    });

    it("정상 내부 경로는 유지해야 함", () => {
      expect(normalizeInternalPath("/dashboard")).toBe("/dashboard");
      expect(normalizeInternalPath("/dashboard?tab=all")).toBe("/dashboard?tab=all");
      expect(normalizeInternalPath("/sessions/123")).toBe("/sessions/123");
    });
  });

  describe("getLoginReasonMessage", () => {
    it("프론트 내부 사유 코드를 사용자 메시지로 변환해야 함", () => {
      expect(getLoginReasonMessage("auth_required")).toBe("로그인이 필요합니다.");
      expect(getLoginReasonMessage("config_error")).toBe(
        "로그인 설정 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
      );
      expect(getLoginReasonMessage("network_error")).toBe(
        "네트워크 오류가 발생했습니다. 다시 시도해 주세요."
      );
    });

    it("백엔드 OAuth 에러 코드를 사용자 메시지로 변환해야 함", () => {
      expect(getLoginReasonMessage("OAUTH401_1")).toBe("OAuth2 로그인에 실패했습니다.");
      expect(getLoginReasonMessage("OAUTH401_2")).toBe("소셜 로그인 인증이 거부되었습니다.");
      expect(getLoginReasonMessage("OAUTH401_3")).toBe(
        "소셜 로그인 제공자 처리 중 오류가 발생했습니다."
      );
      expect(getLoginReasonMessage("OAUTH401_4")).toBe("OAuth2 요청이 올바르지 않습니다.");
      expect(getLoginReasonMessage("OAUTH401_5")).toBe("지원하지 않는 소셜 로그인 제공자입니다.");
      expect(getLoginReasonMessage("OAUTH500_1")).toBe("예상치 못한 오류가 발생했습니다.");
    });

    it("백엔드 인증 에러 코드도 사용자 메시지로 변환해야 함", () => {
      expect(getLoginReasonMessage("AUTH401_4")).toBe("기한이 만료된 Refresh 토큰입니다.");
      expect(getLoginReasonMessage("AUTH401_6")).toBe("Refresh 토큰이 전달되지 않았습니다.");
    });

    it("알 수 없는 코드/빈 값은 null을 반환해야 함", () => {
      expect(getLoginReasonMessage("OAUTH999_1")).toBeNull();
      expect(getLoginReasonMessage("")).toBeNull();
      expect(getLoginReasonMessage(null)).toBeNull();
      expect(getLoginReasonMessage(undefined)).toBeNull();
    });
  });
});

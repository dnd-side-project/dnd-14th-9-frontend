import { isLoginProvider, normalizeInternalPath } from "@/lib/auth/login-policy";

describe("login-policy", () => {
  describe("isLoginProvider", () => {
    it("google과 kakao만 유효한 provider로 허용해야 함", () => {
      expect(isLoginProvider("google")).toBe(true);
      expect(isLoginProvider("kakao")).toBe(true);
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

    it("정상 내부 경로는 유지해야 함", () => {
      expect(normalizeInternalPath("/dashboard")).toBe("/dashboard");
      expect(normalizeInternalPath("/dashboard?tab=all")).toBe("/dashboard?tab=all");
      expect(normalizeInternalPath("/sessions/123")).toBe("/sessions/123");
    });
  });
});

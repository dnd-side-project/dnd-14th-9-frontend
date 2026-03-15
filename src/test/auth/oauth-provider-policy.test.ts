import { LOGIN_PROVIDERS, isLoginProvider } from "@/lib/auth/oauth-provider-policy";

describe("oauth-provider-policy", () => {
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
});

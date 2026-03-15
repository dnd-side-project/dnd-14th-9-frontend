import { isKnownPublicPageRoute, isProtectedPageRoute } from "@/lib/auth/route-access-policy";

describe("route-access-policy", () => {
  it("알려진 공개 페이지를 공개 경로로 판정해야 함", () => {
    expect(isKnownPublicPageRoute("/")).toBe(true);
    expect(isKnownPublicPageRoute("/login")).toBe(true);
    expect(isKnownPublicPageRoute("/feedback")).toBe(true);
    expect(isKnownPublicPageRoute("/session/123")).toBe(true);
    expect(isKnownPublicPageRoute("/terms")).toBe(true);
  });

  it("보호 페이지를 보호 경로로 판정해야 함", () => {
    expect(isProtectedPageRoute("/session/create")).toBe(true);
    expect(isProtectedPageRoute("/profile/settings")).toBe(true);
    expect(isProtectedPageRoute("/profile/report")).toBe(true);
    expect(isProtectedPageRoute("/profile/account")).toBe(true);
    expect(isProtectedPageRoute("/session/123/waiting")).toBe(true);
    expect(isProtectedPageRoute("/session/123/result")).toBe(true);
    expect(isProtectedPageRoute("/session/123/reports")).toBe(true);
  });

  it("알 수 없는 경로나 robots 전용 정책은 보호 경로로 간주하지 않아야 함", () => {
    expect(isKnownPublicPageRoute("/does-not-exist")).toBe(false);
    expect(isProtectedPageRoute("/does-not-exist")).toBe(false);
    expect(isProtectedPageRoute("/feedback")).toBe(false);
    expect(isProtectedPageRoute("/session/123/unknown")).toBe(false);
  });
});

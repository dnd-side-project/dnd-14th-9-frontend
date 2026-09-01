import { sanitizePath } from "@/lib/benchmark/sanitize-url";

describe("sanitizePath", () => {
  it("origin을 제거하고 path만 남긴다", () => {
    expect(sanitizePath("https://api.gak.today/api/v1/sessions/12")).toBe("/api/v1/sessions/12");
  });

  it("backend API base prefix를 제거한다", () => {
    expect(
      sanitizePath("https://api.gak.today/api/v1/sessions/12", "https://api.gak.today/api/v1")
    ).toBe("/sessions/12");
  });

  it("token query를 redacted 한다", () => {
    expect(sanitizePath("http://localhost:3000/api/auth/callback?code=secret&state=abc")).toBe(
      "/api/auth/callback?code=%5Bredacted%5D&state=%5Bredacted%5D"
    );
  });

  it("email query를 redacted 한다", () => {
    expect(sanitizePath("http://localhost:3000/api/members?email=user@example.com")).toBe(
      "/api/members?email=%5Bredacted%5D"
    );
  });
});

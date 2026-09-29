import { clearAuthCookies, setAuthCookies } from "@/lib/auth/auth-cookies";
import {
  ACCESS_TOKEN_COOKIE,
  AUTH_MARKER_COOKIE,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
} from "@/lib/auth/cookie-constants";

function createWriter() {
  return { set: jest.fn(), delete: jest.fn() };
}

describe("auth-cookies 인증 마커", () => {
  it("토큰을 심을 때 클라이언트가 읽을 수 있는 마커를 Refresh Token 수명으로 함께 심어야 한다", () => {
    const writer = createWriter();

    setAuthCookies(writer, { accessToken: "access", refreshToken: "refresh" }, true);

    expect(writer.set).toHaveBeenCalledWith(AUTH_MARKER_COOKIE, "1", {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS,
    });
  });

  it("토큰을 지울 때 마커도 함께 지워야 한다", () => {
    const writer = createWriter();

    clearAuthCookies(writer);

    expect(writer.delete).toHaveBeenCalledWith(ACCESS_TOKEN_COOKIE);
    expect(writer.delete).toHaveBeenCalledWith(REFRESH_TOKEN_COOKIE);
    expect(writer.delete).toHaveBeenCalledWith(AUTH_MARKER_COOKIE);
  });
});

export const ACCESS_TOKEN_COOKIE = "accessToken";
export const REFRESH_TOKEN_COOKIE = "refreshToken";
export const AUTH_MARKER_COOKIE = "hasAuthSession";
export const REDIRECT_AFTER_LOGIN_COOKIE = "redirectAfterLogin";
export const OAUTH_CODE_VERIFIER_COOKIE = "oauthCodeVerifier";

// verifier는 인증 라우트(login, callback)만 읽으므로 그 경로로 범위를 좁힌다.
export const OAUTH_CODE_VERIFIER_COOKIE_PATH = "/api/auth";

export const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60;
export const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
export const REDIRECT_AFTER_LOGIN_MAX_AGE_SECONDS = 60 * 5;
// 로그인 시작부터 callback까지 이 쿠키가 먼저 만료되지 않도록 넉넉히 둔다.
// 실제 한도는 백엔드가 challenge를 보관하는 시간(현재 1분)이다.
export const OAUTH_CODE_VERIFIER_MAX_AGE_SECONDS = 60 * 10;

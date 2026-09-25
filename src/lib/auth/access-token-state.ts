export type AccessTokenRefreshState = "usable" | "expiring" | "expired_or_invalid";

// 토큰 갱신 임계값 (5분)
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;

/**
 * JWT payload는 base64url 인코딩(-, _)과 padding 생략을 사용한다.
 * atob 디코딩 전 표준 base64(+ , /) 및 padding으로 정규화한다.
 */
function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  return atob(normalized + "=".repeat(paddingLength));
}

/**
 * JWT payload의 exp만 base64url decode해 Refresh 필요 상태를 판단한다.
 * 서명 검증은 수행하지 않으므로 이 결과만으로 토큰의 진위나 인증·인가를 보장하지 않는다.
 */
export function getAccessTokenRefreshState(token: string): AccessTokenRefreshState {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) {
      return "expired_or_invalid";
    }

    const payload = JSON.parse(decodeBase64Url(parts[1]));
    if (typeof payload?.exp !== "number") {
      return "expired_or_invalid";
    }

    const remainingMs = payload.exp * 1000 - Date.now();
    if (remainingMs <= 0) {
      return "expired_or_invalid";
    }

    return remainingMs < REFRESH_THRESHOLD_MS ? "expiring" : "usable";
  } catch {
    return "expired_or_invalid";
  }
}

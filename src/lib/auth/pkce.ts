import { createHash, randomBytes } from "node:crypto";

/** 추측할 수 없는 무작위 32바이트를 패딩 없는 43자 base64url 문자열로 만든다(RFC 7636 §4.1). */
export function generateCodeVerifier(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * `BASE64URL(SHA256(ASCII(verifier)))`를 계산한다.
 *
 * 해시 대상은 디코딩한 바이트가 아니라 verifier 문자열 자체다. 백엔드가 같은 방식으로 계산해
 * 저장된 값과 비교하므로 한 글자라도 다르면 모든 로그인 교환이 실패한다.
 */
export function createCodeChallenge(verifier: string): string {
  return createHash("sha256").update(verifier, "ascii").digest("base64url");
}

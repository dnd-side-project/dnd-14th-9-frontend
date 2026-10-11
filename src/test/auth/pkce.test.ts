/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { createCodeChallenge, generateCodeVerifier } from "@/lib/auth/pkce";

// RFC 7636 부록 B의 예시 값. 백엔드도 같은 값으로 테스트해 양쪽 구현이 일치함을 확인한다.
const RFC_7636_VERIFIER = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
const RFC_7636_CHALLENGE = "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM";

describe("PKCE", () => {
  describe("createCodeChallenge", () => {
    it("RFC 7636 부록 B의 verifier로 문서의 challenge를 만들어야 함", () => {
      expect(createCodeChallenge(RFC_7636_VERIFIER)).toBe(RFC_7636_CHALLENGE);
    });

    it("verifier가 한 글자만 달라도 다른 challenge를 만들어야 함", () => {
      const changed = `${RFC_7636_VERIFIER.slice(0, -1)}X`;

      expect(createCodeChallenge(changed)).not.toBe(RFC_7636_CHALLENGE);
    });

    it("패딩(=)과 일반 base64 문자(+, /) 없이 43자여야 함", () => {
      const challenge = createCodeChallenge(generateCodeVerifier());

      expect(challenge).toHaveLength(43);
      expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
    });
  });

  describe("generateCodeVerifier", () => {
    it("RFC가 허용하는 문자만 쓴 43자 문자열이어야 함", () => {
      const verifier = generateCodeVerifier();

      expect(verifier).toHaveLength(43);
      expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    });

    it("호출할 때마다 다른 값을 만들어야 함", () => {
      expect(generateCodeVerifier()).not.toBe(generateCodeVerifier());
    });
  });
});

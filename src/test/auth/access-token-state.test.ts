import { getAccessTokenRefreshState } from "@/lib/auth/access-token-state";

// REFRESH_THRESHOLD_MS(=5분)와 동일한 경계값. 이 파일은 exp 경계 동작을 결정적으로 검증한다.
const THRESHOLD_SECONDS = 5 * 60;

function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/** header.payload.signature 형태의 JWT를 만든다. payload는 base64url로 인코딩한다. */
function makeToken(payloadJson: string): string {
  const header = toBase64Url(btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  return `${header}.${toBase64Url(btoa(payloadJson))}.sig`;
}

/** 현재 시각 기준 exp offset(초)을 가진 정상 JWT를 만든다. */
function tokenWithExpOffset(offsetSeconds: number): string {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return makeToken(JSON.stringify({ exp: nowSeconds + offsetSeconds, userId: "u" }));
}

describe("access-token-state / getAccessTokenRefreshState", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // 초 단위로 딱 떨어지는 시각으로 고정해 exp*1000 - Date.now() 경계를 정확히 만든다.
    jest.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("exp 경계값", () => {
    it("exp가 임계값보다 충분히 미래면 usable", () => {
      expect(getAccessTokenRefreshState(tokenWithExpOffset(THRESHOLD_SECONDS + 60))).toBe("usable");
    });

    it("exp가 임계값과 정확히 같으면(남은 시간 === 5분) usable (경계는 미포함, 엄격한 <)", () => {
      expect(getAccessTokenRefreshState(tokenWithExpOffset(THRESHOLD_SECONDS))).toBe("usable");
    });

    it("exp가 임계값 바로 아래면(4분 59초) expiring", () => {
      expect(getAccessTokenRefreshState(tokenWithExpOffset(THRESHOLD_SECONDS - 1))).toBe(
        "expiring"
      );
    });

    it("exp가 지금 이 순간이면(남은 시간 0) expired_or_invalid", () => {
      expect(getAccessTokenRefreshState(tokenWithExpOffset(0))).toBe("expired_or_invalid");
    });

    it("exp가 과거면 expired_or_invalid", () => {
      expect(getAccessTokenRefreshState(tokenWithExpOffset(-60))).toBe("expired_or_invalid");
    });
  });

  describe("불량 입력", () => {
    it("파트가 3개가 아니면 expired_or_invalid", () => {
      expect(getAccessTokenRefreshState("only.two")).toBe("expired_or_invalid");
    });

    it("payload 파트가 비어 있으면 expired_or_invalid", () => {
      const header = toBase64Url(btoa(JSON.stringify({ alg: "HS256" })));
      expect(getAccessTokenRefreshState(`${header}..sig`)).toBe("expired_or_invalid");
    });

    it("payload가 base64로는 유효하지만 JSON이 아니면 expired_or_invalid", () => {
      const header = toBase64Url(btoa(JSON.stringify({ alg: "HS256" })));
      const notJson = toBase64Url(btoa("not-json{{{"));
      expect(getAccessTokenRefreshState(`${header}.${notJson}.sig`)).toBe("expired_or_invalid");
    });

    it("payload에 exp가 없으면 expired_or_invalid", () => {
      expect(getAccessTokenRefreshState(makeToken(JSON.stringify({ userId: "u" })))).toBe(
        "expired_or_invalid"
      );
    });

    it("exp가 숫자가 아니면 expired_or_invalid", () => {
      expect(getAccessTokenRefreshState(makeToken(JSON.stringify({ exp: "9999999999" })))).toBe(
        "expired_or_invalid"
      );
    });

    it("빈 문자열이면 expired_or_invalid", () => {
      expect(getAccessTokenRefreshState("")).toBe("expired_or_invalid");
    });
  });

  describe("base64url 디코딩", () => {
    it("base64에 '/'·'+'를 만드는 payload도 base64url로 정상 디코딩한다", () => {
      // 0xFF 바이트는 표준 base64에서 '/'(및 '+')를 만들어, decodeBase64Url의 '_'·'-' → '/'·'+'
      // 복원 경로를 강제한다. 이 payload는 exp가 미래이므로 usable이어야 한다.
      const nowSeconds = Math.floor(Date.now() / 1000);
      const payload = JSON.stringify({ exp: nowSeconds + 3600, pad: "ÿÿÿ" });
      expect(getAccessTokenRefreshState(makeToken(payload))).toBe("usable");
    });
  });
});

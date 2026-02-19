import { parsePageParam } from "@/features/session/utils/pagination";

describe("parsePageParam", () => {
  it("유효한 정수 문자열을 페이지 번호로 변환한다", () => {
    expect(parsePageParam("7")).toBe(7);
  });

  it("소수 문자열은 내림 처리한다", () => {
    expect(parsePageParam("3.9")).toBe(3);
  });

  it("0 이하 값은 1로 보정한다", () => {
    expect(parsePageParam("0")).toBe(1);
    expect(parsePageParam("-5")).toBe(1);
  });

  it("숫자가 아닌 값은 1로 보정한다", () => {
    expect(parsePageParam("abc")).toBe(1);
    expect(parsePageParam(undefined)).toBe(1);
    expect(parsePageParam(null)).toBe(1);
  });

  it("무한대 값은 1로 보정한다", () => {
    expect(parsePageParam("Infinity")).toBe(1);
  });
});

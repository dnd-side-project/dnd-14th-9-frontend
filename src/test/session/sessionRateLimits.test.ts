import {
  clampToRateLimit,
  resolveSessionRateRange,
} from "../../features/session/utils/sessionRateLimits";

describe("clampToRateLimit", () => {
  it("상한이 없으면 값을 그대로 둡니다", () => {
    expect(clampToRateLimit(50, undefined)).toBe(50);
  });

  it("상한을 넘는 값은 상한으로 낮춥니다", () => {
    expect(clampToRateLimit(50, 30)).toBe(30);
  });

  it("소수점 상한은 내림해 적용합니다", () => {
    expect(clampToRateLimit(70, 63.7)).toBe(63);
  });

  it("상한 아래 값은 그대로 둡니다", () => {
    expect(clampToRateLimit(20, 60)).toBe(20);
  });
});

describe("resolveSessionRateRange", () => {
  describe("생성 모드", () => {
    it("기본값이 상한을 넘으면 상한으로 낮춥니다", () => {
      expect(
        resolveSessionRateRange({ isEdit: false, input: 50, savedRate: 0, profileRate: 30 })
      ).toEqual({ value: 30, limit: 30 });
    });

    it("프로필 로딩 전에는 값과 상한을 건드리지 않습니다", () => {
      expect(
        resolveSessionRateRange({ isEdit: false, input: 50, savedRate: 0, profileRate: undefined })
      ).toEqual({ value: 50, limit: undefined });
    });
  });

  describe("수정 모드", () => {
    it("상한을 넘는 기존 값을 임의로 낮추지 않습니다", () => {
      const { value } = resolveSessionRateRange({
        isEdit: true,
        input: 80,
        savedRate: 80,
        profileRate: 60,
      });

      expect(value).toBe(80);
    });

    it("상한을 넘는 기존 값이 있으면 상한을 그 값까지 올립니다", () => {
      // value > limit을 슬라이더에 넘기면 aria-valuenow > aria-valuemax가 되고
      // 증가 키가 값을 상한까지 낮춘다. 두 값은 항상 value <= limit이어야 한다.
      const { value, limit } = resolveSessionRateRange({
        isEdit: true,
        input: 80,
        savedRate: 80,
        profileRate: 60,
      });

      expect(limit).toBe(80);
      expect(value).toBeLessThanOrEqual(limit as number);
    });

    it("값을 낮춘 뒤에도 기존 값까지는 되돌릴 수 있어야 합니다", () => {
      // 상한 기준은 현재 입력값이 아니라 저장된 값이므로 70으로 내려도 상한은 80을 유지한다.
      const { limit } = resolveSessionRateRange({
        isEdit: true,
        input: 70,
        savedRate: 80,
        profileRate: 60,
      });

      expect(limit).toBe(80);
    });

    it("기존 값이 상한 이하면 프로필 상한을 그대로 씁니다", () => {
      expect(
        resolveSessionRateRange({ isEdit: true, input: 40, savedRate: 40, profileRate: 60 })
      ).toEqual({ value: 40, limit: 60 });
    });

    it("소수점 프로필 상한은 내림해 적용합니다", () => {
      expect(
        resolveSessionRateRange({ isEdit: true, input: 40, savedRate: 40, profileRate: 63.7 })
      ).toEqual({ value: 40, limit: 63 });
    });

    it("프로필 로딩 전에는 상한을 두지 않습니다", () => {
      expect(
        resolveSessionRateRange({ isEdit: true, input: 80, savedRate: 80, profileRate: undefined })
      ).toEqual({ value: 80, limit: undefined });
    });
  });
});

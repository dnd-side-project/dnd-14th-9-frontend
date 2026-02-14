import {
  formatDateDot,
  formatTimeHHMM,
  formatDateTime,
  isToday,
  isPastTime,
  getCurrentYear,
} from "@/lib/utils/date";

describe("formatDateDot", () => {
  it("Date 객체를 YYYY.MM.DD 형식으로 포맷해야 합니다", () => {
    const date = new Date("2024-03-15T10:30:00");
    expect(formatDateDot(date)).toBe("2024.03.15");
  });

  it("문자열 날짜를 YYYY.MM.DD 형식으로 포맷해야 합니다", () => {
    expect(formatDateDot("2024-01-05T00:00:00")).toBe("2024.01.05");
  });

  it("한 자리 월과 일을 두 자리로 패딩해야 합니다", () => {
    const date = new Date("2024-01-05T00:00:00");
    expect(formatDateDot(date)).toBe("2024.01.05");
  });

  it("연말 날짜를 올바르게 포맷해야 합니다", () => {
    const date = new Date("2024-12-31T23:59:59");
    expect(formatDateDot(date)).toBe("2024.12.31");
  });
});

describe("formatTimeHHMM", () => {
  it("Date 객체를 HH:MM 형식으로 포맷해야 합니다", () => {
    const date = new Date("2024-03-15T10:30:00");
    expect(formatTimeHHMM(date)).toBe("10:30");
  });

  it("문자열 날짜의 시간을 HH:MM 형식으로 포맷해야 합니다", () => {
    expect(formatTimeHHMM("2024-03-15T14:45:00")).toBe("14:45");
  });

  it("한 자리 시간과 분을 두 자리로 패딩해야 합니다", () => {
    const date = new Date("2024-03-15T09:05:00");
    expect(formatTimeHHMM(date)).toBe("09:05");
  });

  it("자정을 올바르게 포맷해야 합니다", () => {
    const date = new Date("2024-03-15T00:00:00");
    expect(formatTimeHHMM(date)).toBe("00:00");
  });

  it("23:59를 올바르게 포맷해야 합니다", () => {
    const date = new Date("2024-03-15T23:59:00");
    expect(formatTimeHHMM(date)).toBe("23:59");
  });
});

describe("formatDateTime", () => {
  it("Date 객체를 'M월 D일 HH:MM' 형식으로 포맷해야 합니다", () => {
    const date = new Date("2024-03-15T10:30:00");
    expect(formatDateTime(date)).toBe("3월 15일 10:30");
  });

  it("문자열 날짜를 'M월 D일 HH:MM' 형식으로 포맷해야 합니다", () => {
    expect(formatDateTime("2024-12-25T14:45:00")).toBe("12월 25일 14:45");
  });

  it("한 자리 월과 일도 올바르게 포맷해야 합니다", () => {
    const date = new Date("2024-01-05T09:05:00");
    expect(formatDateTime(date)).toBe("1월 5일 09:05");
  });

  it("formatTimeHHMM 함수를 사용하여 시간을 포맷해야 합니다", () => {
    const date = new Date("2024-06-20T00:00:00");
    expect(formatDateTime(date)).toBe("6월 20일 00:00");
  });
});

describe("isToday", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-03-15T12:00:00"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("오늘 날짜를 true로 반환해야 합니다", () => {
    const today = new Date("2024-03-15T10:30:00");
    expect(isToday(today)).toBe(true);
  });

  it("오늘 날짜 문자열을 true로 반환해야 합니다", () => {
    expect(isToday("2024-03-15T23:59:59")).toBe(true);
  });

  it("어제 날짜를 false로 반환해야 합니다", () => {
    const yesterday = new Date("2024-03-14T12:00:00");
    expect(isToday(yesterday)).toBe(false);
  });

  it("내일 날짜를 false로 반환해야 합니다", () => {
    const tomorrow = new Date("2024-03-16T12:00:00");
    expect(isToday(tomorrow)).toBe(false);
  });

  it("같은 날 자정을 true로 반환해야 합니다", () => {
    const midnight = new Date("2024-03-15T00:00:00");
    expect(isToday(midnight)).toBe(true);
  });

  it("같은 날 23:59:59를 true로 반환해야 합니다", () => {
    const endOfDay = new Date("2024-03-15T23:59:59");
    expect(isToday(endOfDay)).toBe(true);
  });
});

describe("isPastTime", () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-03-15T12:00:00"));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("과거 시간을 true로 반환해야 합니다", () => {
    const past = new Date("2024-03-15T11:00:00");
    expect(isPastTime(past)).toBe(true);
  });

  it("과거 날짜 문자열을 true로 반환해야 합니다", () => {
    expect(isPastTime("2024-03-14T12:00:00")).toBe(true);
  });

  it("미래 시간을 false로 반환해야 합니다", () => {
    const future = new Date("2024-03-15T13:00:00");
    expect(isPastTime(future)).toBe(false);
  });

  it("미래 날짜를 false로 반환해야 합니다", () => {
    const future = new Date("2024-03-16T12:00:00");
    expect(isPastTime(future)).toBe(false);
  });

  it("매우 오래된 날짜를 true로 반환해야 합니다", () => {
    const oldDate = new Date("2020-01-01T00:00:00");
    expect(isPastTime(oldDate)).toBe(true);
  });

  it("먼 미래 날짜를 false로 반환해야 합니다", () => {
    const farFuture = new Date("2030-12-31T23:59:59");
    expect(isPastTime(farFuture)).toBe(false);
  });
});

describe("getCurrentYear", () => {
  it("주어진 Date의 연도를 반환해야 합니다", () => {
    expect(getCurrentYear(new Date("2026-02-13T00:00:00"))).toBe(2026);
  });
});

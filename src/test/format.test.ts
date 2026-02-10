import {
  formatTimer,
  formatRemaningTimer,
  isUrgent,
  formatParticipantCount,
} from "@/lib/utils/format";

describe("formatTimer", () => {
  it("시간이 0일 때 00:00으로 포맷해야 합니다", () => {
    expect(formatTimer(0)).toBe("00:00");
  });

  it("1분 미만 시간을 MM:SS 형식으로 포맷해야 합니다", () => {
    expect(formatTimer(45)).toBe("00:45");
  });

  it("정확히 1분을 01:00으로 포맷해야 합니다", () => {
    expect(formatTimer(60)).toBe("01:00");
  });

  it("분과 초를 MM:SS 형식으로 포맷해야 합니다", () => {
    expect(formatTimer(125)).toBe("02:05");
  });

  it("정확히 1시간을 HH:MM:SS 형식으로 포맷해야 합니다", () => {
    expect(formatTimer(3600)).toBe("01:00:00");
  });

  it("1시간 이상을 HH:MM:SS 형식으로 포맷해야 합니다", () => {
    expect(formatTimer(3661)).toBe("01:01:01");
  });

  it("복잡한 시간을 올바르게 포맷해야 합니다", () => {
    expect(formatTimer(7384)).toBe("02:03:04");
  });

  it("한 자리 숫자를 두 자리로 패딩해야 합니다", () => {
    expect(formatTimer(3665)).toBe("01:01:05");
  });

  it("10시간 이상을 올바르게 포맷해야 합니다", () => {
    expect(formatTimer(36000)).toBe("10:00:00");
  });

  it("하루(24시간) 이상을 올바르게 포맷해야 합니다", () => {
    expect(formatTimer(86400)).toBe("24:00:00");
  });
});

describe("formatRemaningTimer", () => {
  it("음수 시간에 '곧 시작'을 반환해야 합니다", () => {
    expect(formatRemaningTimer(-1)).toBe("곧 시작");
    expect(formatRemaningTimer(-100)).toBe("곧 시작");
  });

  it("0초에 '1분 미만'을 반환해야 합니다", () => {
    expect(formatRemaningTimer(0)).toBe("1분 미만");
  });

  it("1분 미만에 '1분 미만'을 반환해야 합니다", () => {
    expect(formatRemaningTimer(30)).toBe("1분 미만");
    expect(formatRemaningTimer(59)).toBe("1분 미만");
  });

  it("정확히 1분을 '1분'으로 포맷해야 합니다", () => {
    expect(formatRemaningTimer(60)).toBe("1분");
  });

  it("분만 있는 경우 'N분'으로 포맷해야 합니다", () => {
    expect(formatRemaningTimer(120)).toBe("2분");
    expect(formatRemaningTimer(1800)).toBe("30분");
  });

  it("정확히 1시간을 '1시간'으로 포맷해야 합니다", () => {
    expect(formatRemaningTimer(3600)).toBe("1시간");
  });

  it("시간과 분을 함께 표시해야 합니다", () => {
    expect(formatRemaningTimer(3660)).toBe("1시간 1분");
    expect(formatRemaningTimer(5400)).toBe("1시간 30분");
  });

  it("하루 미만에서 시간과 분을 표시해야 합니다", () => {
    expect(formatRemaningTimer(7200)).toBe("2시간");
    expect(formatRemaningTimer(7320)).toBe("2시간 2분");
  });

  it("정확히 1일을 '1일'로 포맷해야 합니다", () => {
    expect(formatRemaningTimer(86400)).toBe("1일");
  });

  it("1일 이상일 때 분을 표시하지 않아야 합니다", () => {
    expect(formatRemaningTimer(90000)).toBe("1일 1시간");
    expect(formatRemaningTimer(93600)).toBe("1일 2시간");
  });

  it("일과 시간을 함께 표시해야 합니다", () => {
    expect(formatRemaningTimer(172800)).toBe("2일");
    expect(formatRemaningTimer(176400)).toBe("2일 1시간");
  });

  it("여러 날을 올바르게 포맷해야 합니다", () => {
    expect(formatRemaningTimer(259200)).toBe("3일");
    expect(formatRemaningTimer(266400)).toBe("3일 2시간");
  });

  it("1일 이상일 때는 분이 있어도 표시하지 않아야 합니다", () => {
    expect(formatRemaningTimer(86460)).toBe("1일");
    expect(formatRemaningTimer(90060)).toBe("1일 1시간");
  });
});

describe("isUrgent", () => {
  it("0초는 긴급하지 않아야 합니다", () => {
    expect(isUrgent(0)).toBe(false);
  });

  it("음수는 긴급하지 않아야 합니다", () => {
    expect(isUrgent(-1)).toBe(false);
    expect(isUrgent(-100)).toBe(false);
  });

  it("1초는 긴급해야 합니다", () => {
    expect(isUrgent(1)).toBe(true);
  });

  it("30분은 긴급해야 합니다", () => {
    expect(isUrgent(1800)).toBe(true);
  });

  it("59분 59초는 긴급해야 합니다", () => {
    expect(isUrgent(3599)).toBe(true);
  });

  it("정확히 1시간(3600초)은 긴급하지 않아야 합니다", () => {
    expect(isUrgent(3600)).toBe(false);
  });

  it("1시간 이상은 긴급하지 않아야 합니다", () => {
    expect(isUrgent(3601)).toBe(false);
    expect(isUrgent(7200)).toBe(false);
  });

  it("하루 이상은 긴급하지 않아야 합니다", () => {
    expect(isUrgent(86400)).toBe(false);
  });
});

describe("formatParticipantCount", () => {
  it("참가자 수를 'current / max명' 형식으로 포맷해야 합니다", () => {
    expect(formatParticipantCount(5, 10)).toBe("5 / 10명");
  });

  it("0명도 올바르게 포맷해야 합니다", () => {
    expect(formatParticipantCount(0, 10)).toBe("0 / 10명");
  });

  it("최대 인원에 도달했을 때도 올바르게 포맷해야 합니다", () => {
    expect(formatParticipantCount(10, 10)).toBe("10 / 10명");
  });

  it("한 자리 숫자를 올바르게 포맷해야 합니다", () => {
    expect(formatParticipantCount(1, 5)).toBe("1 / 5명");
  });

  it("두 자리 이상 숫자를 올바르게 포맷해야 합니다", () => {
    expect(formatParticipantCount(25, 100)).toBe("25 / 100명");
  });

  it("큰 숫자도 올바르게 포맷해야 합니다", () => {
    expect(formatParticipantCount(999, 1000)).toBe("999 / 1000명");
  });
});

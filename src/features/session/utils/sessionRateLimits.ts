interface ResolveSessionRateRangeOptions {
  /** 수정 모드 여부 */
  isEdit: boolean;
  /** 슬라이더 state에 담긴 현재 입력값 */
  input: number;
  /** 수정 모드에서 이미 저장돼 있던 값 (생성 모드에서는 무시) */
  savedRate: number;
  /** 내 달성률·집중률. 프로필 로딩 전이면 undefined */
  profileRate: number | undefined;
}

interface SessionRateRange {
  /** 슬라이더에 전달할 값 */
  value: number;
  /** 슬라이더에 전달할 선택 상한 */
  limit: number | undefined;
}

/** 비율을 상한 이하로 낮춘다. 소수점 상한(예: 63.5)은 넘기지 않도록 내림한다. */
export function clampToRateLimit(rate: number, limit: number | undefined): number {
  if (limit === undefined) return rate;
  return Math.min(rate, Math.max(0, Math.floor(limit)));
}

/**
 * 참여 조건(달성률·집중률) 슬라이더에 넘길 값과 선택 상한을 계산한다.
 * 참여 조건은 내 달성률·집중률을 넘을 수 없다. (안내 문구와 동일한 규칙)
 *
 * value가 limit을 넘는 상태를 슬라이더에 넘기면 aria-valuenow > aria-valuemax가 되고,
 * 증가 키(ArrowRight/ArrowUp)가 증가를 거부하는 대신 값을 상한까지 "낮춘다".
 * 그래서 두 값은 항상 value <= limit을 만족하도록 함께 계산한다.
 */
export function resolveSessionRateRange({
  isEdit,
  input,
  savedRate,
  profileRate,
}: ResolveSessionRateRangeOptions): SessionRateRange {
  // 생성 모드: 프로필 로딩 전에 잡힌 기본값(50)이 상한을 넘으면 상한으로 낮춰 사용한다.
  if (!isEdit) {
    return { value: clampToRateLimit(input, profileRate), limit: profileRate };
  }

  // 수정 모드: 이미 저장된 값은 상한을 넘더라도 임의로 낮추지 않고, 상향 조작만 슬라이더에서 막는다.
  // 저장된 값까지 상한을 올려 두면 그 값에서 증가 키는 무시되고 하향만 자유로워진다.
  // 기준을 현재 입력값이 아니라 저장된 값으로 고정해야, 한 번 낮춘 뒤 되돌리지 못하는 문제가 없다.
  return {
    value: input,
    limit: profileRate === undefined ? undefined : Math.max(Math.floor(profileRate), savedRate),
  };
}

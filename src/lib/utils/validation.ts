export function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === "";
}

// TODO: nickname 길이 제한 확인 필요.
export function isValidNickname(nickname: string): boolean {
  const regex = /^[가-힣a-zA-Z0-9]{1,5}$/;
  return regex.test(nickname);
}

export function isValidGoal(goal: string, maxLength: number = 50): boolean {
  return goal.trim().length > 0 && goal.trim().length < maxLength;
}

// TODO: 세션 제목 길이 제한 확인 필요.
export function isValidSessionTitle(title: string): boolean {
  return title.trim().length >= 2 && title.length <= 20;
}

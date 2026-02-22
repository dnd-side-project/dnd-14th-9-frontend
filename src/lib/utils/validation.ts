export function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === "";
}

// TODO(장근호): nickname 길이 제한 확인 필요.
export function isValidNickname(nickname: string): boolean {
  const regex = /^[가-힣a-zA-Z0-9]{2,10}$/;
  return regex.test(nickname);
}

export function isValidGoal(goal: string, maxLength: number = 50): boolean {
  const trimmedGoal = goal.trim();
  return trimmedGoal.length > 0 && trimmedGoal.length < maxLength;
}

// TODO(장근호): 세션 제목 길이 제한 확인 필요.
export function isValidSessionTitle(title: string): boolean {
  const trimmedTitle = title.trim();
  return trimmedTitle.length >= 2 && title.length <= 20;
}

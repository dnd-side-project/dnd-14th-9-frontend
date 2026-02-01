export function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === "";
}

// TODO: nickname 길이 제한 확인 필요.
export function isValidNickname(nickname: string): boolean {
  const regex = /^[가-힣a-zA-Z0-9]{1,5}$/;
  return regex.test(nickname);
}

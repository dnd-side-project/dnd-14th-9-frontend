const CHARSET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const BASE = CHARSET.length;

export function encodeBase62(num: number): string {
  if (num === 0) return CHARSET[0];

  let result = "";
  let n = num;

  while (n > 0) {
    result = CHARSET[n % BASE] + result;
    n = Math.floor(n / BASE);
  }

  return result;
}

export function decodeBase62(str: string): number {
  let result = 0;

  for (const char of str) {
    const index = CHARSET.indexOf(char);
    if (index === -1) return -1;
    result = result * BASE + index;
  }

  return result;
}

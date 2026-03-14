export const LOGIN_PROVIDERS = ["google", "kakao"] as const;
export type LoginProvider = (typeof LOGIN_PROVIDERS)[number];

export function isLoginProvider(value: string | null | undefined): value is LoginProvider {
  if (!value) return false;
  return LOGIN_PROVIDERS.includes(value as LoginProvider);
}

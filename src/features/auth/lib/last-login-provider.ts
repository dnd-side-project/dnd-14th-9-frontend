import type { LoginProvider } from "@/lib/auth/login-policy";
import { LOGIN_PROVIDERS } from "@/lib/auth/login-policy";

const STORAGE_KEY = "lastLoginProvider";

export function getLastLoginProvider(): LoginProvider | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  const isValidProvider = LOGIN_PROVIDERS.includes(stored as LoginProvider);
  if (!isValidProvider) return null;

  return stored as LoginProvider;
}

export function saveLastLoginProvider(provider: LoginProvider): void {
  localStorage.setItem(STORAGE_KEY, provider);
}

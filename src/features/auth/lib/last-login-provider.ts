import type { LoginProvider } from "@/lib/auth/auth-constants";
import { LOGIN_PROVIDERS } from "@/lib/auth/auth-constants";

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

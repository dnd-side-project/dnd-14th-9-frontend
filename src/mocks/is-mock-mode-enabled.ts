export function isMockModeEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_USE_MOCK === "true";
}

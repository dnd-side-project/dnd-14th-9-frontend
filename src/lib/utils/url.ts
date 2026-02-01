export function getSessionShareUrl(sessionId: string): string {
  const baseUrl =
    typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL;

  return `${baseUrl}/session/${sessionId}`;
}

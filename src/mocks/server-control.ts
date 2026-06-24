const MOCK_SERVER_STARTED_KEY = "__gak_msw_server_started__";

type GlobalWithMockServerState = typeof globalThis & {
  [MOCK_SERVER_STARTED_KEY]?: boolean;
};

export function isMockModeEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === "true";
}

export async function ensureMockServer(): Promise<void> {
  if (!isMockModeEnabled()) return;
  if (typeof window !== "undefined") return;
  if (process.env.NEXT_RUNTIME === "edge") return;

  const globalWithMockState = globalThis as GlobalWithMockServerState;
  if (globalWithMockState[MOCK_SERVER_STARTED_KEY]) return;

  const { server } = await import("./server");
  const { strictUnhandledApiRequest } = await import("./unhandled-request");

  server.listen({ onUnhandledRequest: strictUnhandledApiRequest });
  globalWithMockState[MOCK_SERVER_STARTED_KEY] = true;
}

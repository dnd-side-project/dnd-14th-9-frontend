import { createSSEProxyHandler } from "@/lib/sse/create-sse-proxy";

export const dynamic = "force-dynamic";

export const GET = createSSEProxyHandler({
  buildBackendUrl: (baseUrl, sessionId) => `${baseUrl}/sessions/${sessionId}/status/events`,
});

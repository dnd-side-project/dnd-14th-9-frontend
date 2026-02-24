import { createSSEProxyHandler } from "@/lib/sse/create-sse-proxy";

export const dynamic = "force-dynamic";

export const GET = createSSEProxyHandler<{ sessionId: string }>({
  buildBackendUrl: (baseUrl, { sessionId }) =>
    `${baseUrl}/sessions/${sessionId}/in-progress/events`,
});

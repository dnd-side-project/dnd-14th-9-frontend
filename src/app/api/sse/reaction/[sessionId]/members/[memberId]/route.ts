import { createSSEProxyHandler } from "@/lib/sse/create-sse-proxy";

export const dynamic = "force-dynamic";

export const GET = createSSEProxyHandler<{ sessionId: string; memberId: string }>({
  buildBackendUrl: (baseUrl, { sessionId, memberId }) =>
    `${baseUrl}/sessions/${sessionId}/members/${memberId}/reaction/events`,
});

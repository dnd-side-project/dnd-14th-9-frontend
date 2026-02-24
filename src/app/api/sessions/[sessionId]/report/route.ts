import { NextRequest } from "next/server";

import { forwardToBackend } from "@/lib/api/api-route-forwarder";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  return forwardToBackend({
    request,
    method: "GET",
    pathWithQuery: `/sessions/${sessionId}/report`,
    forwardRequestCookies: true,
  });
}

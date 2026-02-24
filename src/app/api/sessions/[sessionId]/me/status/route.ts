import { NextRequest } from "next/server";

import { forwardToBackend } from "@/lib/api/api-route-forwarder";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  return forwardToBackend({
    request,
    method: "PATCH",
    pathWithQuery: `/sessions/${sessionId}/me/status`,
    forwardRequestCookies: true,
  });
}

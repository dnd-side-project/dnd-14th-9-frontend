import { NextRequest } from "next/server";

import { forwardToBackend } from "@/lib/api/api-route-forwarder";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  return forwardToBackend({
    request,
    method: "DELETE",
    pathWithQuery: `/sessions/${sessionId}/leave`,
    forwardRequestCookies: true,
  });
}

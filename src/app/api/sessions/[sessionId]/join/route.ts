import { NextRequest } from "next/server";

import { forwardToBackend } from "@/lib/api/api-route-forwarder";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  return forwardToBackend({
    request,
    method: "POST",
    pathWithQuery: `/sessions/${sessionId}/join`,
    includeRequestBody: "json",
    forwardRequestCookies: true,
  });
}

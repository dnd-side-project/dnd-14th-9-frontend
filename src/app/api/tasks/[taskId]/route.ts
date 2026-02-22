import { NextRequest } from "next/server";

import { forwardToBackend } from "@/lib/api/api-route-forwarder";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  return forwardToBackend({
    request,
    method: "PATCH",
    pathWithQuery: `/tasks/${taskId}`,
    includeRequestBody: "json",
    forwardRequestCookies: true,
  });
}

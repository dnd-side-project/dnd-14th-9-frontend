import { NextRequest } from "next/server";

import { forwardToBackend } from "@/lib/api/api-route-forwarder";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  return forwardToBackend({
    request,
    method: "POST",
    pathWithQuery: `/tasks/${taskId}/subtasks`,
    includeRequestBody: "json",
    forwardRequestCookies: true,
  });
}

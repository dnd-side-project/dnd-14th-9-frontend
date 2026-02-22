import { NextRequest } from "next/server";

import { forwardToBackend } from "@/lib/api/api-route-forwarder";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  const { subtaskId } = await params;

  return forwardToBackend({
    request,
    method: "PATCH",
    pathWithQuery: `/subtasks/${subtaskId}/completion`,
    forwardRequestCookies: true,
  });
}

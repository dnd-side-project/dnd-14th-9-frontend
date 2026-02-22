import { NextRequest } from "next/server";

import { forwardToBackend } from "@/lib/api/api-route-forwarder";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  const { subtaskId } = await params;

  return forwardToBackend({
    request,
    method: "PATCH",
    pathWithQuery: `/subtasks/${subtaskId}`,
    includeRequestBody: "json",
    forwardRequestCookies: true,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subtaskId: string }> }
) {
  const { subtaskId } = await params;

  return forwardToBackend({
    request,
    method: "DELETE",
    pathWithQuery: `/subtasks/${subtaskId}`,
    forwardRequestCookies: true,
  });
}

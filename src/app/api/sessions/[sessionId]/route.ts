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
    pathWithQuery: `/sessions/${sessionId}`,
    forwardRequestCookies: true,
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  return forwardToBackend({
    request,
    method: "PATCH",
    pathWithQuery: `/sessions/${sessionId}`,
    includeRequestBody: "formData",
    forwardRequestCookies: true,
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  return forwardToBackend({
    request,
    method: "DELETE",
    pathWithQuery: `/sessions/${sessionId}`,
    forwardRequestCookies: true,
  });
}

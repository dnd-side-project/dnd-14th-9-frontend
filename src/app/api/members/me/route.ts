import { NextRequest } from "next/server";
import { forwardToBackend } from "@/lib/api/bff-proxy";

export async function GET(request: NextRequest) {
  return forwardToBackend({
    request,
    method: "GET",
    pathWithQuery: "/members/me",
    forwardRequestCookies: true,
  });
}

export async function PATCH(request: NextRequest) {
  return forwardToBackend({
    request,
    method: "PATCH",
    pathWithQuery: "/members/me",
    includeRequestBody: true,
    forwardRequestCookies: true,
  });
}

export async function DELETE(request: NextRequest) {
  return forwardToBackend({
    request,
    method: "DELETE",
    pathWithQuery: "/members/me",
    clearAuthCookiesOnSuccess: true,
    forwardRequestCookies: true,
  });
}

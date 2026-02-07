import { NextRequest } from "next/server";
import { forwardToBackend } from "../_shared";

export async function GET() {
  return forwardToBackend({
    method: "GET",
    pathWithQuery: "/members/me",
  });
}

export async function PATCH(request: NextRequest) {
  return forwardToBackend({
    request,
    method: "PATCH",
    pathWithQuery: "/members/me",
    includeRequestBody: true,
  });
}

export async function DELETE() {
  return forwardToBackend({
    method: "DELETE",
    pathWithQuery: "/members/me",
    clearAuthCookiesOnSuccess: true,
  });
}

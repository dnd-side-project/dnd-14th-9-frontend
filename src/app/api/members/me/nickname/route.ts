import { NextRequest } from "next/server";

import { forwardToBackend } from "@/lib/api/api-route-forwarder";

export async function PATCH(request: NextRequest) {
  return forwardToBackend({
    request,
    method: "PATCH",
    pathWithQuery: "/members/me/nickname",
    includeRequestBody: true,
    forwardRequestCookies: true,
  });
}

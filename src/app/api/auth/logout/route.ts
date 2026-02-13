import { NextRequest } from "next/server";

import { forwardToBackend } from "@/lib/api/api-route-forwarder";

export async function POST(request: NextRequest) {
  return forwardToBackend({
    request,
    method: "POST",
    pathWithQuery: "/auth/logout",
    clearAuthCookiesOnSuccess: true,
    forwardRequestCookies: true,
  });
}

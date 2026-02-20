import { NextRequest } from "next/server";

import { forwardToBackend } from "@/lib/api/api-route-forwarder";

export async function GET(request: NextRequest) {
  return forwardToBackend({
    request,
    method: "GET",
    pathWithQuery: `/sessions${request.nextUrl.search}`,
    forwardRequestCookies: true,
  });
}

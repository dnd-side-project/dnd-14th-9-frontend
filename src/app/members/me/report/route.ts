import { NextRequest } from "next/server";
import { forwardToBackend } from "@/lib/api/bff-proxy";

export async function GET(request: NextRequest) {
  return forwardToBackend({
    request,
    method: "GET",
    pathWithQuery: "/members/me/report",
    forwardRequestCookies: true,
  });
}

import { NextRequest } from "next/server";
import { forwardToBackend } from "@/lib/api/bff-proxy";

export async function GET(request: NextRequest) {
  const queryString = request.nextUrl.searchParams.toString();

  return forwardToBackend({
    request,
    method: "GET",
    pathWithQuery: queryString
      ? `/members/nickname/exists?${queryString}`
      : "/members/nickname/exists",
    forwardRequestCookies: true,
  });
}

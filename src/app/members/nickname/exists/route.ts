import { NextRequest } from "next/server";
import { forwardToBackend } from "../../_shared";

export async function GET(request: NextRequest) {
  const queryString = request.nextUrl.searchParams.toString();

  return forwardToBackend({
    method: "GET",
    pathWithQuery: queryString
      ? `/members/nickname/exists?${queryString}`
      : "/members/nickname/exists",
  });
}

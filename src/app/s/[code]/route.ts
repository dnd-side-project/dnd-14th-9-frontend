import { NextResponse, type NextRequest } from "next/server";

import { decodeBase62 } from "@/lib/utils/base62";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const sessionId = decodeBase62(code);

  if (sessionId < 0) {
    return NextResponse.redirect(new URL("/", request.url), 308);
  }

  return NextResponse.redirect(new URL(`/session/${sessionId}`, request.url), 308);
}

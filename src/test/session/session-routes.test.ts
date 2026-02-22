/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { GET as getInProgress } from "@/app/api/sessions/[sessionId]/in-progress/route";
import { forwardToBackend } from "@/lib/api/api-route-forwarder";

jest.mock("@/lib/api/api-route-forwarder", () => ({
  forwardToBackend: jest.fn(),
}));

const mockedForwardToBackend = forwardToBackend as jest.MockedFunction<typeof forwardToBackend>;

describe("session route handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("in-progress 라우트는 forwardToBackend로 /sessions/{sessionId}/in-progress를 위임해야 한다", async () => {
    mockedForwardToBackend.mockResolvedValueOnce(NextResponse.json({}, { status: 200 }));
    const request = new NextRequest("http://localhost:3000/api/sessions/123/in-progress", {
      method: "GET",
    });

    await getInProgress(request, { params: Promise.resolve({ sessionId: "123" }) });

    expect(mockedForwardToBackend).toHaveBeenCalledWith({
      request,
      method: "GET",
      pathWithQuery: "/sessions/123/in-progress",
      forwardRequestCookies: true,
    });
  });
});

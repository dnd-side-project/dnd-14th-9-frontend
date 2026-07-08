/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from "next/server";

import { GET } from "./route";

describe("GET /api/chat/ws-token", () => {
  it("accessToken 쿠키가 있으면 200과 함께 토큰을 반환해야 함", async () => {
    const request = new NextRequest("http://localhost:3000/api/chat/ws-token", {
      headers: {
        cookie: "accessToken=valid_access_token",
      },
    });

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ accessToken: "valid_access_token" });
  });

  it("토큰 응답이 캐시되지 않도록 Cache-Control: no-store를 설정해야 함", async () => {
    const request = new NextRequest("http://localhost:3000/api/chat/ws-token", {
      headers: {
        cookie: "accessToken=valid_access_token",
      },
    });

    const response = await GET(request);

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("accessToken 쿠키가 없으면 401을 반환해야 함", async () => {
    const request = new NextRequest("http://localhost:3000/api/chat/ws-token");

    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "Unauthorized" });
  });
});

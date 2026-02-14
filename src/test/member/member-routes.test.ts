/**
 * @jest-environment @edge-runtime/jest-environment
 */

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { GET as getMeForEdit } from "@/app/api/members/me/edit/route";
import { PATCH as patchInterestCategories } from "@/app/api/members/me/interest-categories/route";
import { PATCH as patchNickname } from "@/app/api/members/me/nickname/route";
import { GET as getMeProfile } from "@/app/api/members/me/profile/route";
import { PATCH as patchProfileImage } from "@/app/api/members/me/profile-image/route";
import { forwardToBackend } from "@/lib/api/api-route-forwarder";

jest.mock("@/lib/api/api-route-forwarder", () => ({
  forwardToBackend: jest.fn(),
}));

jest.mock("@/lib/api/api-client", () => ({
  SERVER_API_URL: "https://backend.example.com",
}));

const mockedForwardToBackend = forwardToBackend as jest.MockedFunction<typeof forwardToBackend>;

describe("member route handlers", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("profile 라우트는 forwardToBackend로 /members/me/profile을 위임해야 한다", async () => {
    mockedForwardToBackend.mockResolvedValueOnce(NextResponse.json({}, { status: 200 }));
    const request = new NextRequest("http://localhost:3000/api/members/me/profile", {
      method: "GET",
    });

    await getMeProfile(request);

    expect(mockedForwardToBackend).toHaveBeenCalledWith({
      request,
      method: "GET",
      pathWithQuery: "/members/me/profile",
      forwardRequestCookies: true,
    });
  });

  it("edit 라우트는 forwardToBackend로 /members/me/edit를 위임해야 한다", async () => {
    mockedForwardToBackend.mockResolvedValueOnce(NextResponse.json({}, { status: 200 }));
    const request = new NextRequest("http://localhost:3000/api/members/me/edit", {
      method: "GET",
    });

    await getMeForEdit(request);

    expect(mockedForwardToBackend).toHaveBeenCalledWith({
      request,
      method: "GET",
      pathWithQuery: "/members/me/edit",
      forwardRequestCookies: true,
    });
  });

  it("nickname 라우트는 forwardToBackend로 /members/me/nickname을 위임해야 한다", async () => {
    mockedForwardToBackend.mockResolvedValueOnce(NextResponse.json({}, { status: 200 }));
    const request = new NextRequest("http://localhost:3000/api/members/me/nickname", {
      method: "PATCH",
      body: JSON.stringify({ nickname: "용" }),
      headers: { "Content-Type": "application/json" },
    });

    await patchNickname(request);

    expect(mockedForwardToBackend).toHaveBeenCalledWith({
      request,
      method: "PATCH",
      pathWithQuery: "/members/me/nickname",
      includeRequestBody: true,
      forwardRequestCookies: true,
    });
  });

  it("interest-categories 라우트는 forwardToBackend로 /members/me/interest-categories를 위임해야 한다", async () => {
    mockedForwardToBackend.mockResolvedValueOnce(NextResponse.json({}, { status: 200 }));
    const request = new NextRequest("http://localhost:3000/api/members/me/interest-categories", {
      method: "PATCH",
      body: JSON.stringify({
        firstInterestCategory: "DEVELOPMENT",
        secondInterestCategory: "DESIGN",
      }),
      headers: { "Content-Type": "application/json" },
    });

    await patchInterestCategories(request);

    expect(mockedForwardToBackend).toHaveBeenCalledWith({
      request,
      method: "PATCH",
      pathWithQuery: "/members/me/interest-categories",
      includeRequestBody: true,
      forwardRequestCookies: true,
    });
  });

  it("profile-image 라우트는 multipart body와 쿠키를 backend로 전달해야 한다", async () => {
    const responsePayload = {
      isSuccess: true,
      code: "COMMON200",
      message: "성공",
      result: { id: 1 },
    };
    fetchMock.mockResolvedValueOnce({
      status: 200,
      statusText: "OK",
      text: async () => JSON.stringify(responsePayload),
    });

    const formData = new FormData();
    const file = new File(["binary"], "profile.png", { type: "image/png" });
    formData.append("profileImage", file);

    const request = new NextRequest("http://localhost:3000/api/members/me/profile-image", {
      method: "PATCH",
      body: formData,
      headers: { cookie: "accessToken=abc" },
    });

    const response = await patchProfileImage(request);
    const body = await response.json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://backend.example.com/members/me/profile-image");
    expect(options.method).toBe("PATCH");
    expect(options.headers).toEqual({ Cookie: "accessToken=abc" });
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get("profileImage")).toBeTruthy();

    expect(response.status).toBe(200);
    expect(body).toEqual(responsePayload);
  });
});

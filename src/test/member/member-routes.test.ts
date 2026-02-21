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
import type { UpdateInterestCategoriesRequest } from "@/features/member/types";
import { forwardToBackend } from "@/lib/api/api-route-forwarder";

jest.mock("@/lib/api/api-route-forwarder", () => ({
  forwardToBackend: jest.fn(),
}));

const mockedForwardToBackend = forwardToBackend as jest.MockedFunction<typeof forwardToBackend>;

describe("member route handlers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      includeRequestBody: "json",
      forwardRequestCookies: true,
    });
  });

  it("interest-categories 라우트는 forwardToBackend로 /members/me/interest-categories를 위임해야 한다", async () => {
    mockedForwardToBackend.mockResolvedValueOnce(NextResponse.json({}, { status: 200 }));

    const body: UpdateInterestCategoriesRequest = {
      firstInterestCategory: "DEVELOPMENT",
      secondInterestCategory: "DESIGN",
      thirdInterestCategory: null,
    };

    const request = new NextRequest("http://localhost:3000/api/members/me/interest-categories", {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    await patchInterestCategories(request);

    expect(mockedForwardToBackend).toHaveBeenCalledWith({
      request,
      method: "PATCH",
      pathWithQuery: "/members/me/interest-categories",
      includeRequestBody: "json",
      forwardRequestCookies: true,
    });
  });

  it("profile-image 라우트는 forwardToBackend로 /members/me/profile-image를 위임해야 한다", async () => {
    mockedForwardToBackend.mockResolvedValueOnce(NextResponse.json({}, { status: 200 }));
    const request = new NextRequest("http://localhost:3000/api/members/me/profile-image", {
      method: "PATCH",
    });

    await patchProfileImage(request);

    expect(mockedForwardToBackend).toHaveBeenCalledWith({
      request,
      method: "PATCH",
      pathWithQuery: "/members/me/profile-image",
      includeRequestBody: "formData",
      forwardRequestCookies: true,
    });
  });
});

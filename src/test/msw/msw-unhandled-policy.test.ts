import { MEMBER_PROFILE_IMAGE_FORM_KEY } from "@/features/member/api";
import {
  parseRequiredJsonText,
  readRequiredMultipartJsonPart,
  requireMultipartPart,
} from "@/mocks/handlers/json";
import { isUnhandledBackendApiRequest, strictUnhandledApiRequest } from "@/mocks/unhandled-request";

describe("MSW strict unhandled API policy", () => {
  it.each([
    "http://localhost:3000/api/unknown",
    "http://localhost:3000/api/sessions/unknown/deep/path",
    "https://example.com/api/unknown",
  ])("fails unhandled backend API request: %s", (url) => {
    expect(isUnhandledBackendApiRequest({ url, method: "GET" })).toBe(true);
    expect(() => strictUnhandledApiRequest({ url, method: "GET" })).toThrow(
      `[MSW] Unhandled backend API request: GET ${url}`
    );
  });

  it.each([
    "http://localhost:3000/_next/static/chunk.js",
    "http://localhost:3000/favicon.ico",
    "http://localhost:3000/images/logo.png",
    "https://cdn.example.com/api-client.js",
  ])("does not fail non-backend/static request: %s", (url) => {
    expect(isUnhandledBackendApiRequest({ url, method: "GET" })).toBe(false);
    expect(() => strictUnhandledApiRequest({ url, method: "GET" })).not.toThrow();
  });

  it("malformed or empty mutation payload는 성공 fallback 대신 parse error를 낸다", () => {
    expect(() => parseRequiredJsonText("", "member nickname update")).toThrow(
      "member nickname update payload is required"
    );
    expect(() => parseRequiredJsonText("{", "member nickname update")).toThrow(
      "member nickname update payload must be valid JSON"
    );
    expect(
      parseRequiredJsonText<{ nickname: string }>(
        '{"nickname":"모각작러"}',
        "member nickname update"
      )
    ).toEqual({
      nickname: "모각작러",
    });
  });

  it("multipart mutation payload도 required part가 없으면 parse error를 낸다", async () => {
    const emptyFormRequest = {
      formData: async () => new FormData(),
    } as Request;

    await expect(
      readRequiredMultipartJsonPart(emptyFormRequest, "request", "session create")
    ).rejects.toThrow("session create request part is required");

    const emptyImageRequest = {
      formData: async () => new FormData(),
    } as Request;

    await expect(
      requireMultipartPart(
        emptyImageRequest,
        MEMBER_PROFILE_IMAGE_FORM_KEY,
        "member profile image update"
      )
    ).rejects.toThrow("member profile image update profileImage part is required");
  });

  it("multipart profileImage key는 실제 memberApi 필드명과 일치한다", async () => {
    const formData = new FormData();
    const profileImage = new Blob(["mock-image"], { type: "image/png" });
    formData.append(MEMBER_PROFILE_IMAGE_FORM_KEY, profileImage);
    const request = { formData: async () => formData } as Request;

    await expect(
      requireMultipartPart(request, MEMBER_PROFILE_IMAGE_FORM_KEY, "member profile image update")
    ).resolves.toBeTruthy();
  });
});

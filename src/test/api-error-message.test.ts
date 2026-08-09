import { ApiError, executeFetch } from "@/lib/api/api-client";

function mockErrorResponse(body: unknown, status = 400) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: false,
    status,
    statusText: "Bad Request",
    headers: new Headers({ "content-type": "application/json" }),
    json: async () => body,
    text: async () => JSON.stringify(body),
  }) as unknown as typeof fetch;
}

describe("API 에러 메시지 해석", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  // 백엔드가 SESSION400_15를 "세션 생성 제한"과 "수정 불가" 양쪽에 재사용한다.
  // 코드 매핑을 고정 적용하면 생성 화면에서 "수정" 문구가 나온다.
  it("재사용되는 코드라도 서버 메시지를 그대로 노출해야 한다", async () => {
    mockErrorResponse({
      httpStatus: "BAD_REQUEST",
      isSuccess: false,
      code: "SESSION400_15",
      message: "한 번에 하나의 세션만 생성할 수 있습니다",
    });

    await expect(
      executeFetch("POST", "https://example.test/api/sessions/create", {})
    ).rejects.toThrow(new ApiError("한 번에 하나의 세션만 생성할 수 있습니다", 400));
  });

  it("isSuccess 필드가 없는 응답에서도 서버 메시지를 노출해야 한다", async () => {
    mockErrorResponse({
      httpStatus: "BAD_REQUEST",
      code: "SESSION400_15",
      message: "한 번에 하나의 세션만 생성할 수 있습니다",
    });

    await expect(
      executeFetch("POST", "https://example.test/api/sessions/create", {})
    ).rejects.toThrow("한 번에 하나의 세션만 생성할 수 있습니다");
  });

  it("서버 메시지가 비어 있으면 코드 매핑으로 폴백해야 한다", async () => {
    mockErrorResponse({
      httpStatus: "BAD_REQUEST",
      isSuccess: false,
      code: "SESSION400_15",
      message: "   ",
    });

    await expect(
      executeFetch("POST", "https://example.test/api/sessions/create", {})
    ).rejects.toThrow("세션에 참여자가 있어 수정할 수 없어요.");
  });
});

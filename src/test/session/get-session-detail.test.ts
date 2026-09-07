import { sessionServerApi } from "@/features/session/server/api";
import { getSessionDetail } from "@/features/session/server/get-session-detail";
import type { SessionDetailResponse } from "@/features/session/types";
import { ApiError } from "@/lib/api/api-client";
import type { ApiSuccessResponse } from "@/types/shared/types";

jest.mock("server-only", () => ({}));

jest.mock("@/features/session/server/api", () => ({
  sessionServerApi: {
    getDetail: jest.fn(),
  },
}));

const mockedGetDetail = sessionServerApi.getDetail as jest.MockedFunction<
  typeof sessionServerApi.getDetail
>;

function createSessionDetailResponse(sessionId: number): ApiSuccessResponse<SessionDetailResponse> {
  return {
    isSuccess: true,
    code: "COMMON200",
    message: "성공적으로 요청을 처리했습니다.",
    result: {
      sessionId,
      category: "개발",
      title: "테스트 세션",
      hostNickname: "host",
      status: "진행중",
      currentParticipants: 1,
      maxParticipants: 6,
      sessionDurationMinutes: 60,
      startTime: "2026-08-22T10:00:00",
      imageUrl: "https://example.com/image.png",
      summary: "세션 요약",
      notice: "공지",
    },
  };
}

describe("getSessionDetail", () => {
  beforeEach(() => {
    mockedGetDetail.mockReset();
  });

  it("sessionServerApi.getDetail에 sessionId를 그대로 전달한다", async () => {
    const response = createSessionDetailResponse(101);
    mockedGetDetail.mockResolvedValue(response);

    await expect(getSessionDetail("101")).resolves.toEqual(response);
    expect(mockedGetDetail).toHaveBeenCalledWith("101");
  });

  it("sessionServerApi.getDetail 실패를 그대로 전파한다", async () => {
    const error = new Error("session not found");
    mockedGetDetail.mockRejectedValue(error);

    await expect(getSessionDetail("404")).rejects.toBe(error);
  });

  it("404 ApiError를 그대로 전파한다", async () => {
    const error = new ApiError("session not found", 404);
    mockedGetDetail.mockRejectedValue(error);

    await expect(getSessionDetail("404")).rejects.toBe(error);
  });
});

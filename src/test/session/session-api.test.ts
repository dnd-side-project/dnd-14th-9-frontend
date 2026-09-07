import { sessionApi } from "@/features/session/api";
import type { SessionDetailResponse } from "@/features/session/types";
import { api } from "@/lib/api/api";
import { ApiError } from "@/lib/api/api-client";
import type { ApiSuccessResponse } from "@/types/shared/types";

jest.mock("@/lib/api/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

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

describe("sessionApi.getDetail", () => {
  beforeEach(() => {
    mockedApi.get.mockReset();
  });

  it("클라이언트 조회는 기존처럼 /api/sessions/:id를 사용한다", async () => {
    const response = createSessionDetailResponse(101);
    mockedApi.get.mockResolvedValue(response);

    await expect(sessionApi.getDetail("101")).resolves.toEqual(response);
    expect(mockedApi.get).toHaveBeenCalledWith("/api/sessions/101");
    expect(mockedApi.get).not.toHaveBeenCalledWith("/sessions/101");
  });

  it("404 ApiError를 그대로 전파한다", async () => {
    const error = new ApiError("session not found", 404);
    mockedApi.get.mockRejectedValue(error);

    await expect(sessionApi.getDetail("404")).rejects.toBe(error);
    expect(mockedApi.get).toHaveBeenCalledWith("/api/sessions/404");
  });
});

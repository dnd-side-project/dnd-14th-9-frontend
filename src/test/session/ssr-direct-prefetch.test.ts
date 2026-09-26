import { QueryClient } from "@tanstack/react-query";

import { memberKeys } from "@/features/member/hooks/useMemberHooks";
import { sessionApi } from "@/features/session/api";
import { sessionKeys } from "@/features/session/hooks/useSessionHooks";
import type { SessionDetailResponse, WaitingRoomResponse } from "@/features/session/types";
import type { ApiSuccessResponse } from "@/types/shared/types";

const mockGetSessionDetail = jest.fn();
const mockGetWaitingRoom = jest.fn();
const mockGetQueryClient = jest.fn();

jest.mock("@/features/session/server/get-session-detail", () => ({
  getSessionDetail: (...args: unknown[]) => mockGetSessionDetail(...args),
}));

jest.mock("@/features/session/server/api", () => ({
  sessionServerApi: {
    getWaitingRoom: (...args: unknown[]) => mockGetWaitingRoom(...args),
  },
}));

jest.mock("@/features/lobby/components/WaitingRoomContent", () => ({
  WaitingRoomContent: () => null,
}));

jest.mock("@/features/session/components/SessionEditContent", () => ({
  SessionEditContent: () => null,
}));

jest.mock("@/lib/getQueryClient", () => ({
  getQueryClient: () => mockGetQueryClient(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/mocks/is-mock-mode-enabled", () => ({
  isMockModeEnabled: () => false,
}));

function createSession(sessionId: number): ApiSuccessResponse<SessionDetailResponse> {
  return {
    isSuccess: true,
    code: "COMMON200",
    message: "성공적으로 요청을 처리했습니다.",
    result: {
      sessionId,
      category: "개발",
      title: "테스트 세션",
      hostNickname: "host",
      status: "대기",
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

const waitingRoomResponse: ApiSuccessResponse<WaitingRoomResponse> = {
  isSuccess: true,
  code: "COMMON200",
  message: "성공적으로 요청을 처리했습니다.",
  result: { participantCount: 1, members: [] },
};

describe("SSR prefetch server direct queryFn", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSessionDetail.mockReset();
    mockGetWaitingRoom.mockReset();
    mockGetQueryClient.mockReset();
  });

  function createQueryClient() {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    mockGetQueryClient.mockReturnValue(queryClient);
    return queryClient;
  }

  it("대기실 페이지는 detail과 waitingRoom을 서버 함수로 같은 queryKey에 저장한다", async () => {
    const sessionId = "42";
    const serverDetail = createSession(42);
    mockGetSessionDetail.mockResolvedValue(serverDetail);
    mockGetWaitingRoom.mockResolvedValue(waitingRoomResponse);
    jest.spyOn(sessionApi, "getDetail").mockResolvedValue(createSession(99));
    jest.spyOn(sessionApi, "getWaitingRoom").mockResolvedValue({
      ...waitingRoomResponse,
      result: { participantCount: 9, members: [] },
    });
    const queryClient = createQueryClient();
    queryClient.setQueryData(memberKeys.me(), { result: { memberId: 1 } });

    const { default: WaitingRoomPage } =
      await import("@/app/(with-header)/session/[sessionId]/waiting/page");
    await WaitingRoomPage({ params: Promise.resolve({ sessionId }) });

    expect(mockGetSessionDetail).toHaveBeenCalledWith(sessionId);
    expect(mockGetWaitingRoom).toHaveBeenCalledWith(sessionId);
    expect(sessionApi.getDetail).not.toHaveBeenCalled();
    expect(sessionApi.getWaitingRoom).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(sessionKeys.detail(sessionId))).toEqual(serverDetail);
    expect(queryClient.getQueryData(sessionKeys.waitingRoom(sessionId))).toEqual(
      waitingRoomResponse
    );
  });

  it("세션 수정 페이지는 detail queryKey에 서버 조회 결과를 저장한다", async () => {
    const sessionId = "7";
    const serverDetail = createSession(7);
    mockGetSessionDetail.mockResolvedValue(serverDetail);
    jest.spyOn(sessionApi, "getDetail").mockResolvedValue(createSession(8));
    const queryClient = createQueryClient();

    const { default: SessionEditPage } =
      await import("@/app/(with-header)/session/[sessionId]/edit/page");
    await SessionEditPage({ params: Promise.resolve({ sessionId }) });

    expect(mockGetSessionDetail).toHaveBeenCalledWith(sessionId);
    expect(sessionApi.getDetail).not.toHaveBeenCalled();
    expect(queryClient.getQueryData(sessionKeys.detail(sessionId))).toEqual(serverDetail);
  });
});

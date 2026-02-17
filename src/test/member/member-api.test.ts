import { memberApi } from "@/features/member/api";
import type {
  GetMeForEditResponse,
  GetMeResponse,
  MemberInterestCategory,
  MemberProfileMutationResponse,
  MemberProfileView,
  MemberReport,
} from "@/features/member/types";
import { api } from "@/lib/api/api";
import type { ApiSuccessResponse } from "@/types/shared/types";

jest.mock("@/lib/api/api", () => ({
  api: {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const mockMemberProfile: MemberProfileView = {
  id: 1,
  nickname: "new용",
  profileImageUrl: "https://example.com/profile.png",
  email: "tem@tem.com",
  socialProvider: "kakao",
  totalParticipationTime: 60,
  focusedTime: 30,
  focusRate: 50,
  totalTodoCount: 10,
  completedTodoCount: 8,
  todoCompletionRate: 80,
  firstLogin: false,
};

const mockMemberProfileResponse: GetMeResponse = {
  isSuccess: true,
  code: "COMMON200",
  message: "성공적으로 요청을 처리했습니다.",
  result: mockMemberProfile,
};

const mockMemberEditResponse: GetMeForEditResponse = {
  ...mockMemberProfileResponse,
  result: {
    id: 1,
    nickname: "new용",
    profileImageUrl: "https://example.com/profile.png",
    email: "tem@tem.com",
    bio: "안녕하세요",
    firstInterestCategory: "DEVELOPMENT",
    secondInterestCategory: "DESIGN",
    thirdInterestCategory: null,
  },
};

const mockMemberMutationResponse: MemberProfileMutationResponse = {
  ...mockMemberEditResponse,
};

const mockReportResponse: ApiSuccessResponse<MemberReport> = {
  isSuccess: true,
  code: "COMMON200",
  message: "성공적으로 요청을 처리했습니다.",
  result: {
    totalParticipationTime: 40,
    focusedTime: 30,
    completedSessionCount: 5,
    todoCompletionRate: 70,
    devSessionParticipationRate: 20,
    designParticipationRate: 20,
    planningPmParticipationRate: 10,
    careerSelfDevelopmentParticipationRate: 10,
    studyReadingParticipationRate: 10,
    creativeParticipationRate: 10,
    teamProjectParticipationRate: 10,
    freeParticipationRate: 10,
  },
};

describe("memberApi", () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("닉네임 수정 시 분리된 nickname 엔드포인트를 호출해야 한다", async () => {
    mockedApi.patch.mockResolvedValueOnce(mockMemberMutationResponse);

    await memberApi.updateNickname({ nickname: "new용" });

    expect(mockedApi.patch).toHaveBeenCalledWith("/api/members/me/nickname", {
      nickname: "new용",
    });
  });

  it("관심 카테고리 수정 시 분리된 interest-categories 엔드포인트를 호출해야 한다", async () => {
    mockedApi.patch.mockResolvedValueOnce(mockMemberMutationResponse);

    const body: {
      firstInterestCategory: MemberInterestCategory;
      secondInterestCategory: MemberInterestCategory;
      thirdInterestCategory: MemberInterestCategory | null;
    } = {
      firstInterestCategory: "DEVELOPMENT",
      secondInterestCategory: "DESIGN",
      thirdInterestCategory: null,
    };

    await memberApi.updateInterestCategories(body);

    expect(mockedApi.patch).toHaveBeenCalledWith("/api/members/me/interest-categories", body);
  });

  it("프로필 이미지 수정 시 multipart 요청으로 profile-image 엔드포인트를 호출해야 한다", async () => {
    const file = new File(["binary"], "profile.png", { type: "image/png" });
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockMemberMutationResponse,
    });

    await memberApi.updateProfileImage({ profileImage: file });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];

    expect(url).toBe("/api/members/me/profile-image");
    expect(options.method).toBe("PATCH");
    expect(options.credentials).toBe("include");
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get("profileImage")).toBe(file);
  });

  it("조회/리포트/탈퇴 엔드포인트가 명세 경로를 호출해야 한다", async () => {
    mockedApi.get
      .mockResolvedValueOnce(mockMemberProfileResponse)
      .mockResolvedValueOnce(mockMemberEditResponse)
      .mockResolvedValueOnce(mockReportResponse);
    mockedApi.delete.mockResolvedValueOnce({
      isSuccess: true,
      code: "COMMON200",
      message: "성공적으로 요청을 처리했습니다.",
      result: null,
    });

    await memberApi.getMe();
    await memberApi.getMeForEdit();
    await memberApi.getMyReport();
    await memberApi.deleteMe();

    expect(mockedApi.get).toHaveBeenNthCalledWith(1, "/api/members/me/profile");
    expect(mockedApi.get).toHaveBeenNthCalledWith(2, "/api/members/me/edit");
    expect(mockedApi.get).toHaveBeenNthCalledWith(3, "/api/members/me/report");
    expect(mockedApi.delete).toHaveBeenCalledWith("/api/members/me");
  });
});

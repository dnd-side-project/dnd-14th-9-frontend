import { fireEvent, render } from "@testing-library/react";

import { ProfileSummary } from "@/features/member/components/Profile/ProfileSummary";
import { useMe, useUpdateProfileImage } from "@/features/member/hooks/useMemberHooks";
import { toast } from "@/lib/toast";

jest.mock("@/features/member/hooks/useMemberHooks", () => ({
  useMe: jest.fn(),
  useUpdateProfileImage: jest.fn(),
}));

jest.mock("@/lib/toast", () => ({
  toast: {
    subscribe: jest.fn(),
    showToast: jest.fn(),
    hideToast: jest.fn(),
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}));

const mockedUseMe = useMe as jest.MockedFunction<typeof useMe>;
const mockedUseUpdateProfileImage = useUpdateProfileImage as jest.MockedFunction<
  typeof useUpdateProfileImage
>;
const mockedToast = toast as jest.Mocked<typeof toast>;

const mockProfile = {
  id: 1,
  nickname: "테스트유저",
  profileImageUrl: null,
  email: "test@example.com",
  bio: null,
  socialProvider: "kakao" as const,
  totalParticipationTime: 0,
  focusedTime: 0,
  focusRate: 0,
  totalTodoCount: 0,
  completedTodoCount: 0,
  todoCompletionRate: 0,
  participationSessionCount: 0,
  firstLogin: false,
};

describe("ProfileSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseMe.mockReturnValue({ data: { result: mockProfile } } as ReturnType<typeof useMe>);
  });

  it("유효한 이미지 파일 선택 시 프로필 이미지 수정 mutation을 호출해야 한다", () => {
    const mutate = jest.fn();
    mockedUseUpdateProfileImage.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateProfileImage>);

    const { container } = render(<ProfileSummary />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const file = new File(["image"], "profile.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(mutate).toHaveBeenCalledWith(
      { profileImage: file },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });

  it("허용되지 않은 파일 형식 선택 시 에러 토스트를 표시하고 mutation을 호출하지 않아야 한다", () => {
    const mutate = jest.fn();
    mockedUseUpdateProfileImage.mockReturnValue({
      mutate,
      isPending: false,
    } as unknown as ReturnType<typeof useUpdateProfileImage>);

    const { container } = render(<ProfileSummary />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    const invalidFile = new File(["pdf"], "profile.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(mutate).not.toHaveBeenCalled();
    expect(mockedToast.error).toHaveBeenCalledWith("jpg, png, webp만 지원해요");
  });

  it("업로드 진행 중에는 파일 입력이 비활성화되어야 한다", () => {
    mockedUseUpdateProfileImage.mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    } as unknown as ReturnType<typeof useUpdateProfileImage>);

    const { container } = render(<ProfileSummary />);
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;

    expect(fileInput).toBeDisabled();
  });

  it("프로필 기본 정보와 formatHHMMSS로 포맷된 누적 시간을 렌더링해야 한다", () => {
    mockedUseMe.mockReturnValue({
      data: {
        result: {
          ...mockProfile,
          nickname: "각 잡은 호랑이 #1234",
          email: "tiger1234@gmail.com",
          bio: "안녕하세요!",
          participationSessionCount: 24,
          totalParticipationTime: 2912, // 00:48:32
          todoCompletionRate: 85,
          focusRate: 30,
        },
      },
    } as ReturnType<typeof useMe>);

    const { getByText } = render(<ProfileSummary />);

    expect(getByText("각 잡은 호랑이 #1234")).toBeInTheDocument();
    expect(getByText("tiger1234@gmail.com")).toBeInTheDocument();
    expect(getByText("안녕하세요!")).toBeInTheDocument();
    expect(getByText("24")).toBeInTheDocument();
    expect(getByText("00:48:32")).toBeInTheDocument();
    expect(getByText("85%")).toBeInTheDocument();
    expect(getByText("30%")).toBeInTheDocument();
  });
});

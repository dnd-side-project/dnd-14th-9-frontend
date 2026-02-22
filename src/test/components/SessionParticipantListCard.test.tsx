import { fireEvent, render, screen } from "@testing-library/react";

import { SessionParticipantListCard } from "@/features/session/components/SessionParticipantListCard";
import type { SessionParticipantCardViewModel } from "@/features/session/utils/mapInProgressToParticipantCard";

jest.mock("@/features/session/components/SessionParticipantListCard/ChatPopup", () => ({
  ChatPopup: () => null,
}));

function createData(): SessionParticipantCardViewModel {
  return {
    participantCount: 1,
    averageAchievementRate: 42,
    members: [
      {
        memberId: "1",
        nickname: "사용자 이름",
        profileImageUrl: undefined,
        isHost: true,
        goal: "목표",
        isFocusing: true,
        focusedSeconds: 0,
        achievementRate: 20,
        completedCount: 1,
        todos: [
          {
            todoId: "11",
            content: "할 일",
            isCompleted: true,
          },
        ],
      },
    ],
  };
}

describe("SessionParticipantListCard", () => {
  it("focusedSeconds가 0이면 00:00을 렌더링해야 한다", () => {
    render(<SessionParticipantListCard data={createData()} />);

    expect(screen.getByText("00:00")).toBeInTheDocument();
  });

  it("에러가 있으면 에러 메시지를 렌더링해야 한다", () => {
    render(<SessionParticipantListCard error="참여자 정보를 불러오지 못했습니다." />);

    expect(screen.getByText("참여자 정보를 불러오지 못했습니다.")).toBeInTheDocument();
  });

  it("멤버 목록이 비어 있으면 빈 상태 메시지를 렌더링해야 한다", () => {
    render(
      <SessionParticipantListCard
        data={{ participantCount: 0, averageAchievementRate: 0, members: [] }}
      />
    );

    expect(screen.getByText("참여자가 없습니다.")).toBeInTheDocument();
  });

  it("토글 버튼 클릭 시 todo 목록이 펼쳐져야 한다", () => {
    render(<SessionParticipantListCard data={createData()} />);

    fireEvent.click(screen.getByRole("button", { name: "할 일 펼치기" }));

    expect(screen.getByText("To do list")).toBeInTheDocument();
    expect(screen.getByText("할 일")).toBeInTheDocument();
  });
});

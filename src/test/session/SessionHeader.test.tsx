import { fireEvent, render, screen } from "@testing-library/react";

import { SessionHeader } from "@/features/session/components/SessionHeader";

jest.mock("@/features/session/hooks/useLeaveSessionHandler", () => ({
  useLeaveSessionHandler: () => ({ handleLeave: jest.fn(), isPending: false, serverError: null }),
}));

function renderSessionHeader(onShowDialog = jest.fn()) {
  render(
    <SessionHeader
      sessionId="header-test"
      showDialog={false}
      onShowDialog={onShowDialog}
      onCloseDialog={jest.fn()}
      isLeavingRef={{ current: false }}
    />
  );
  return { onShowDialog, leaveButton: screen.getByRole("button", { name: "나가기" }) };
}

describe("SessionHeader", () => {
  it("제목과 안내 문구를 보여준다", () => {
    // Given: 진행 중인 세션의 헤더
    // When: 렌더링하면
    renderSessionHeader();

    // Then: 제목은 기본 글자색, 안내 문구는 보조 글자색이다
    expect(screen.getByRole("heading", { level: 1, name: "세션 진행 중!" })).toHaveClass(
      "text-text-primary"
    );
    expect(screen.getByText("시간이 흐르고 있어요. 세션에 몰입해 보세요.")).toHaveClass(
      "text-text-tertiary"
    );
  });

  it("나가기 버튼은 44px 높이이고 글자 오른쪽에 로그아웃 아이콘이 있다", () => {
    // Given: 진행 중인 세션의 헤더
    // When: 렌더링하면
    const { leaveButton } = renderSessionHeader();

    // Then: medium(44px) 버튼이고, 마지막 자식이 아이콘이다
    expect(leaveButton).toHaveClass("h-11");
    expect(leaveButton.lastElementChild?.querySelector("svg")).not.toBeNull();
  });

  it("나가기 버튼을 누르면 나가기 확인 다이얼로그를 열도록 요청한다", () => {
    // Given: 렌더링된 헤더
    const { leaveButton, onShowDialog } = renderSessionHeader();

    // When: 나가기 버튼을 누르면
    fireEvent.click(leaveButton);

    // Then: onShowDialog가 한 번 호출된다
    expect(onShowDialog).toHaveBeenCalledTimes(1);
  });
});

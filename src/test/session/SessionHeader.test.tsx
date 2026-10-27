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

  it("다음 영역과의 간격은 부모의 gap이 정하므로 자기 아래 여백을 두지 않는다", () => {
    // Given: 진행 중인 세션의 헤더
    // When: 렌더링하면
    renderSessionHeader();

    // Then: 헤더에 mb-* 여백 클래스가 없다 (있으면 부모 gap과 합쳐져 40px보다 커진다)
    expect(screen.getByRole("banner").className).not.toMatch(/\bmb-/);
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

  it("제목과 안내 문구는 모바일 18px · 13px, 태블릿부터 24px · 16px이다", () => {
    // Given: 진행 중인 세션의 헤더
    // When: 렌더링하면
    renderSessionHeader();

    // Then: 기본이 모바일 크기이고 md부터 커진다 (text-lg/text-2xl이 줄 높이를 정하므로 1.4를 같이 둔다)
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass(
      "text-lg",
      "md:text-2xl",
      "leading-[1.4]"
    );
    expect(screen.getByText("시간이 흐르고 있어요. 세션에 몰입해 보세요.")).toHaveClass(
      "text-[13px]",
      "md:text-base",
      "leading-[1.4]"
    );
  });

  it("제목과 안내 문구 사이 간격은 모바일 2px, 태블릿부터 4px이다", () => {
    // Given: 진행 중인 세션의 헤더
    // When: 렌더링하면
    renderSessionHeader();

    // Then: gap-3xs → md:gap-2xs
    const textColumn = screen.getByRole("heading", { level: 1 }).parentElement;
    expect(textColumn).toHaveClass("gap-3xs", "md:gap-2xs");
    expect(textColumn).not.toHaveClass("gap-2xs");
  });

  it("나가기 버튼은 모바일에서 글자 없이 44px 아이콘 버튼이고, 태블릿부터 글자가 보인다", () => {
    // Given: 진행 중인 세션의 헤더
    // When: 렌더링하면
    const { leaveButton } = renderSessionHeader();

    // Then: 글자는 화면에서만 숨겨(sr-only) 이름은 그대로이고, 버튼은 모바일에서 44px 정사각형이다
    expect(screen.getByText("나가기")).toHaveClass("max-md:sr-only");
    expect(leaveButton).toHaveClass("max-md:size-11", "max-md:min-w-0", "max-md:p-sm");
  });
});

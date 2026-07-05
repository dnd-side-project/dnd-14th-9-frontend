import { render, screen } from "@testing-library/react";

import { ChatBubble } from "@/components/ChatBubble/ChatBubble";

describe("ChatBubble", () => {
  it("text를 렌더링한다", () => {
    render(<ChatBubble text="안녕하세요" align="left" />);
    expect(screen.getByText("안녕하세요")).toBeInTheDocument();
  });

  it("quickAction이 있으면 label을 렌더링하고 text는 표시하지 않는다", () => {
    render(
      <ChatBubble
        text="사용되지 않는 텍스트"
        align="right"
        quickAction={{ icon: <span data-testid="qa-icon" />, label: "좋아요" }}
      />
    );

    expect(screen.getByText("좋아요")).toBeInTheDocument();
    expect(screen.getByTestId("qa-icon")).toBeInTheDocument();
    expect(screen.queryByText("사용되지 않는 텍스트")).not.toBeInTheDocument();
  });

  it("align=left이면 기본적으로 아바타를 노출한다", () => {
    render(<ChatBubble text="hi" align="left" avatarSrc="/avatar.png" senderNickname="호랑이" />);
    expect(screen.getByAltText("호랑이")).toBeInTheDocument();
  });

  it("align=right이면 기본적으로 아바타를 노출하지 않는다", () => {
    render(<ChatBubble text="hi" align="right" avatarSrc="/avatar.png" senderNickname="호랑이" />);
    expect(screen.queryByAltText("호랑이")).not.toBeInTheDocument();
  });

  it("showAvatar를 명시하면 align과 무관하게 아바타 노출을 제어할 수 있다", () => {
    // 정렬(align)과 아바타 노출(showAvatar)이 독립적으로 동작하는지 검증
    render(
      <ChatBubble
        text="hi"
        align="right"
        showAvatar
        avatarSrc="/avatar.png"
        senderNickname="호랑이"
      />
    );
    expect(screen.getByAltText("호랑이")).toBeInTheDocument();
  });

  it("isSenderHost이면 아바타에 방장 배지를 노출한다", () => {
    render(
      <ChatBubble
        text="hi"
        align="left"
        isSenderHost
        avatarSrc="/avatar.png"
        senderNickname="호랑이"
      />
    );
    expect(screen.getByLabelText("방장")).toBeInTheDocument();
  });
});

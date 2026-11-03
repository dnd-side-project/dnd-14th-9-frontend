import { render, screen } from "@testing-library/react";

import { Avatar } from "@/components/Avatar/Avatar";

/** 아바타 원(테두리 링이 붙는 요소)을 렌더링해서 돌려준다 */
function renderAvatar(props: Partial<React.ComponentProps<typeof Avatar>> = {}) {
  render(<Avatar data-testid="avatar" {...props} />);
  return screen.getByTestId("avatar");
}

describe("Avatar — 테두리(Figma Avatar 시안)", () => {
  it("빈 아바타는 모든 크기에서 흰색 8% 테두리(ring-border-subtle)이다", () => {
    // Given/When: 빈 아바타를 크기별로 렌더링하면
    // Then: 32%(strong)가 아니라 8%(subtle) 링이다
    for (const size of ["xlarge", "large", "medium", "small"] as const) {
      const { unmount } = render(<Avatar data-testid={`empty-${size}`} size={size} type="empty" />);
      const circle = screen.getByTestId(`empty-${size}`);
      expect(circle).toHaveClass("ring-1", "ring-inset", "ring-border-subtle");
      expect(circle).not.toHaveClass("ring-border-strong");
      unmount();
    }
  });

  it("이미지 아바타는 흰색 32% 테두리(ring-border-strong)이다", () => {
    // Given/When: 이미지 아바타를 렌더링하면
    const circle = renderAvatar({ type: "image", src: "/avatar.png", alt: "프로필" });

    // Then: 32% 링이다
    expect(circle).toHaveClass("ring-border-strong");
    expect(circle).not.toHaveClass("ring-border-subtle");
  });

  it("이미지 타입이어도 src가 없어 기본 아이콘을 보여주면 빈 아바타의 8% 테두리를 쓴다", () => {
    // Given/When: type은 image인데 src가 없으면 (기본 프로필 아이콘이 그려진다)
    const circle = renderAvatar({ type: "image" });

    // Then: 보이는 모양(빈 아바타)에 맞춰 8% 링이다
    expect(circle).toHaveClass("ring-border-subtle");
  });
});

describe("Avatar — 방장 배지 위치와 크기(Figma Leader Badge)", () => {
  it.each([
    // [크기, 배지 크기 클래스, 중심 위치 클래스(아바타 중심에서 오른쪽·아래로 N px)]
    ["xlarge", "size-5", "top-[calc(50%+16px)]", "left-[calc(50%+16px)]"],
    ["large", "size-4", "top-[calc(50%+14px)]", "left-[calc(50%+14px)]"],
    ["medium", "size-3", "top-[calc(50%+12px)]", "left-[calc(50%+12px)]"],
  ] as const)(
    "%s 아바타의 방장 배지는 %s 크기이고 중심이 아바타 중심에서 시안의 거리만큼 떨어져 있다",
    (size, badgeSize, top, left) => {
      // Given/When: 방장 배지가 있는 아바타를 렌더링하면
      render(<Avatar size={size} showBadge />);

      // Then: 배지 크기와 중심(top/left)이 Figma 값이다 (xl 40/48, lg 34/40, md 28/32)
      const badge = screen.getByLabelText("방장");
      expect(badge).toHaveClass("absolute", "-translate-x-1/2", "-translate-y-1/2", top, left);
      expect(badge.firstElementChild).toHaveClass(badgeSize);
    }
  );

  it("배지의 2px 고리는 초록 원 바깥에 그려진다 (원이 20/16/12px 그대로 보이도록 border가 아니라 ring)", () => {
    // Given/When: 방장 배지가 있는 아바타를 렌더링하면
    render(<Avatar size="xlarge" showBadge />);

    // Then: Figma Leader Badge는 초록 원 크기가 20px이고 gray-subtler 고리 2px가 그 바깥에 있다
    const icon = screen.getByLabelText("방장").firstElementChild;
    expect(icon).toHaveClass("rounded-full", "ring-2", "ring-border-gray-subtler");
    expect(icon).not.toHaveClass("border-2");
  });

  it("시안에 방장 배지가 없는 small 아바타는 기존 위치(85%)를 유지한다", () => {
    // Given/When: small 아바타에 배지를 켜면
    render(<Avatar size="small" showBadge />);

    // Then: 기존 85% 위치 그대로다 (시안 없음, 동작 변경 없음)
    expect(screen.getByLabelText("방장")).toHaveClass("top-[85%]", "left-[85%]");
  });
});

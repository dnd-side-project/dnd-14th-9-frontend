import type { MouseEvent } from "react";

import { fireEvent, render, screen } from "@testing-library/react";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { navigateWithHardReload } from "@/lib/navigation/hardNavigate";

jest.mock("@/lib/navigation/hardNavigate", () => ({
  navigateWithHardReload: jest.fn(),
}));

describe("ButtonLink", () => {
  const hardReloadMock = jest.mocked(navigateWithHardReload);

  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("soft navigation에서 UrlObject href를 정상 렌더링한다", () => {
    render(
      <ButtonLink href={{ pathname: "/session", query: { page: "2" }, hash: "top" }}>
        세션 보기
      </ButtonLink>
    );

    expect(screen.getByRole("link", { name: "세션 보기" })).toHaveAttribute(
      "href",
      "/session?page=2#top"
    );
  });

  it("hardNavigate일 때 브라우저가 계산한 href로 full reload를 수행한다", () => {
    render(
      <ButtonLink href="/login?from=header#cta" hardNavigate>
        로그인
      </ButtonLink>
    );

    fireEvent.click(screen.getByRole("link", { name: "로그인" }));

    expect(hardReloadMock).toHaveBeenCalledWith("http://localhost/login?from=header#cta");
  });

  it("hardNavigate에서 onClick이 기본 동작을 막으면 reload하지 않는다", () => {
    const handleClick = jest.fn((e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
    });

    render(
      <ButtonLink href="/login" hardNavigate onClick={handleClick}>
        로그인
      </ButtonLink>
    );

    fireEvent.click(screen.getByRole("link", { name: "로그인" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(hardReloadMock).not.toHaveBeenCalled();
  });
});

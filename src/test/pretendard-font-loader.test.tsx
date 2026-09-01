import { fireEvent, render } from "@testing-library/react";

import { PretendardFontLoader } from "@/app/PretendardFontLoader";

const STYLESHEET_URL = "/fonts/pretendard/pretendardvariable-dynamic-subset.css";

describe("PretendardFontLoader", () => {
  afterEach(() => {
    document.body.classList.remove("pretendard-ready");
    document.head.querySelector(`link[href="${STYLESHEET_URL}"]`)?.remove();
  });

  it.each(["load", "error"] as const)("CSS %s 후 폰트 우선순위를 활성화한다", (event) => {
    render(<PretendardFontLoader />);

    const stylesheet = document.head.querySelector<HTMLLinkElement>(
      `link[href="${STYLESHEET_URL}"]`
    );

    expect(stylesheet).toHaveAttribute("rel", "stylesheet");
    fireEvent[event](stylesheet!);
    expect(document.body).toHaveClass("pretendard-ready");
  });
});

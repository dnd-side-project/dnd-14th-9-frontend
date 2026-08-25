import { render, screen } from "@testing-library/react";

import { DefaultBanner } from "@/features/session/components/Banner/DefaultBanner";
import { BREAKPOINT_MD_PX, BREAKPOINT_XL_PX } from "@/lib/constants/breakpoints";

jest.mock("@/hooks/useViewportLayout", () => ({
  useViewportLayout: () => ({ layout: "mobile", isResolved: true }),
}));

describe("DefaultBanner critical images", () => {
  it("gives PNG cards display-width sizes and does not preload them", () => {
    render(<DefaultBanner isHovered={false} />);

    const goals = screen.getByAltText("목표 섹션 미리보기");
    const datepicker = screen.getByAltText("달력 미리보기");
    const profile = screen.getByAltText("프로필 카드 미리보기");

    expect(goals).toHaveAttribute(
      "sizes",
      `(max-width: ${BREAKPOINT_MD_PX - 1}px) 168px, (max-width: ${BREAKPOINT_XL_PX - 1}px) 247px, 335px`
    );
    expect(datepicker).toHaveAttribute(
      "sizes",
      `(max-width: ${BREAKPOINT_MD_PX - 1}px) 86px, (max-width: ${BREAKPOINT_XL_PX - 1}px) 127px, 172px`
    );
    expect(profile).toHaveAttribute(
      "sizes",
      `(max-width: ${BREAKPOINT_MD_PX - 1}px) 105px, (max-width: ${BREAKPOINT_XL_PX - 1}px) 169px, 232px`
    );

    for (const image of [goals, datepicker, profile]) {
      expect(image).not.toHaveAttribute("fetchpriority", "high");
      expect(image.getAttribute("sizes")).not.toBe("100vw");
    }
  });

  it("still renders decorative LCP line SVGs", () => {
    render(<DefaultBanner isHovered={false} />);

    expect(
      document.querySelector('img[src="/images/banner/lines-horizontal.svg"]')
    ).toBeInTheDocument();
    expect(
      document.querySelector('img[src="/images/banner/lines-diagonal.svg"]')
    ).toBeInTheDocument();
  });
});

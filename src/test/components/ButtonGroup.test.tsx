import { render, screen } from "@testing-library/react";

import { Button } from "@/components/Button/Button";
import { ButtonGroup } from "@/components/ButtonGroup/ButtonGroup";

describe("ButtonGroup", () => {
  it("defaults to Figma dual horizontal layout", () => {
    render(
      <ButtonGroup>
        <Button>취소</Button>
        <Button>확인</Button>
      </ButtonGroup>
    );

    expect(screen.getByRole("group")).toHaveClass("flex-row", "flex-wrap", "items-start", "gap-md");
  });

  it("supports Figma dual vertical layout", () => {
    render(
      <ButtonGroup layout="dual" horizontal={false}>
        <Button>건너뛰기</Button>
        <Button>로그인하고 참여하기</Button>
      </ButtonGroup>
    );

    expect(screen.getByRole("group")).toHaveClass("flex-col", "items-center", "gap-sm");
  });

  it("supports Figma single vertical layout", () => {
    render(
      <ButtonGroup layout="single" horizontal={false}>
        <Button>참여하기</Button>
      </ButtonGroup>
    );

    expect(screen.getByRole("group")).toHaveClass("flex-col", "gap-x-0", "gap-y-md");
  });
});

import { render } from "@testing-library/react";

import { AlertIcon } from "@/components/Icon/AlertIcon";

it("기본 색상을 강제하지 않고 부모의 currentColor를 상속한다", () => {
  const { container } = render(
    <button className="text-text-muted">
      <AlertIcon />
    </button>
  );

  expect(container.querySelector("span")).not.toHaveClass("text-text-primary");
  expect(container.querySelector("path")).toHaveAttribute("fill", "currentColor");
});

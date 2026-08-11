import { fireEvent, render, screen } from "@testing-library/react";

import { TextInput } from "@/components/Input/TextInput";

it("onClear가 없으면 값이 있어도 초기화 버튼을 노출하지 않는다", () => {
  render(<TextInput value="퀵 메시지" onChange={() => {}} />);

  fireEvent.focus(screen.getByRole("textbox"));

  expect(screen.queryByRole("button", { name: "입력 초기화" })).not.toBeInTheDocument();
});

it("onClear가 있으면 초기화 버튼으로 값을 지울 수 있다", () => {
  const onClear = jest.fn();
  render(<TextInput value="일반 입력" onChange={() => {}} onClear={onClear} />);

  fireEvent.focus(screen.getByRole("textbox"));
  fireEvent.click(screen.getByRole("button", { name: "입력 초기화" }));

  expect(onClear).toHaveBeenCalledTimes(1);
});

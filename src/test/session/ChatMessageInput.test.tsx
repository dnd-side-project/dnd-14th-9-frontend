import { useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";

import { ChatMessageInput } from "@/features/session/components/ChatDialog/ChatMessageInput";

function EditableChatMessageInput() {
  const [value, setValue] = useState("");

  return <ChatMessageInput value={value} onChange={setValue} onSend={() => {}} />;
}

it("일반 채팅 입력은 초기화할 수 있다", () => {
  render(<EditableChatMessageInput />);

  const input = screen.getByRole("textbox");
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: "일반 메시지" } });
  fireEvent.click(screen.getByRole("button", { name: "입력 초기화" }));

  expect(input).toHaveValue("");
});

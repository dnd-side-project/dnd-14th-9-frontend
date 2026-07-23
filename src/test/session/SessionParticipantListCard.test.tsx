import { fireEvent, render, screen } from "@testing-library/react";

import { SessionParticipantListCard } from "@/features/session/components/SessionParticipantListCard/SessionParticipantListCard";

// 카드가 useSessionChat(→ useChatSocket)을 직접 호출하므로 소켓 연결을 차단한다
jest.mock("@/lib/socket/useChatSocket", () => ({
  useChatSocket: () => ({ status: "connected", send: jest.fn() }),
}));

jest.mock("@/features/session/components/ChatDialog/ChatDialog", () => ({
  ChatDialog: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="chat-dialog">
      <button type="button" onClick={onClose}>
        닫기
      </button>
    </div>
  ),
}));

const BASE_PROPS = {
  sessionId: "42",
  isHost: false,
  myMemberId: 1,
  category: "개발",
  title: "아침 코딩 모각작",
  description: "각자 코딩 작업에 집중하는 세션",
  notice: "빡집중해서 같이 코딩해요!",
};

describe("SessionParticipantListCard — 채팅 트리거", () => {
  it("채팅 열기 버튼을 렌더링한다", () => {
    render(<SessionParticipantListCard {...BASE_PROPS} />);
    expect(screen.getByRole("button", { name: "채팅 열기" })).toBeInTheDocument();
  });

  it("처음에는 채팅 다이얼로그가 닫혀 있다", () => {
    render(<SessionParticipantListCard {...BASE_PROPS} />);
    expect(screen.queryByTestId("chat-dialog")).not.toBeInTheDocument();
  });

  it("채팅 열기 버튼을 누르면 다이얼로그가 열리고, 닫으면 사라진다", () => {
    render(<SessionParticipantListCard {...BASE_PROPS} />);

    fireEvent.click(screen.getByRole("button", { name: "채팅 열기" }));
    expect(screen.getByTestId("chat-dialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(screen.queryByTestId("chat-dialog")).not.toBeInTheDocument();
  });
});

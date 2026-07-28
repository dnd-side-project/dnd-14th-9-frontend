import { act, fireEvent, render, screen, within } from "@testing-library/react";

import { QUICK_ACTION_CONFIG } from "@/features/session/components/ChatDialog/quickActionConfig";
import { SessionParticipantListCard } from "@/features/session/components/SessionParticipantListCard/SessionParticipantListCard";
import type { InProgressMember } from "@/features/session/types";
import type {
  ChatError,
  ChatReceivedMessage,
  ChatSendPayload,
  ConnectionStatus,
} from "@/lib/socket/types";
import { toast } from "@/lib/toast";

interface CapturedOptions {
  sessionId: string;
  onMessage?: (message: ChatReceivedMessage) => void;
  onError?: (error: ChatError) => void;
}

const mockSend = jest.fn<void, [ChatSendPayload]>();
let mockStatus: ConnectionStatus = "connected";
let capturedOptions: CapturedOptions | null = null;

jest.mock("@/lib/socket/useChatSocket", () => ({
  useChatSocket: (options: CapturedOptions) => {
    capturedOptions = options;
    return { status: mockStatus, send: mockSend };
  },
}));

jest.mock("@/lib/toast", () => ({
  toast: { error: jest.fn(), success: jest.fn(), info: jest.fn() },
}));

const MEMBERS: InProgressMember[] = [
  {
    memberId: 1,
    nickname: "나참여자",
    role: "PARTICIPANT",
    achievementRate: 0,
    status: "FOCUSED",
    task: null,
  },
  {
    memberId: 2,
    nickname: "방장호랑이",
    role: "HOST",
    achievementRate: 50,
    status: "FOCUSED",
    task: null,
  },
];

const BASE_PROPS = {
  sessionId: "42",
  isHost: false,
  myMemberId: 1,
  category: "개발",
  title: "아침 코딩 모각작",
  description: "각자 코딩 작업에 집중하는 세션",
  notice: "빡집중해서 같이 코딩해요!",
  participantCount: 2,
  members: MEMBERS,
};

// 채팅 상태(소켓·수신 기록)는 카드가 소유하므로, 카드를 렌더한 뒤 다이얼로그를 연다.
// 카드에도 참여자 아바타·닉네임이 렌더되므로 다이얼로그 내부는 within으로 범위를 좁힌다.
function renderCard(props: Partial<typeof BASE_PROPS> = {}) {
  return render(<SessionParticipantListCard {...BASE_PROPS} {...props} />);
}

function openChat() {
  fireEvent.click(screen.getByRole("button", { name: "채팅 열기" }));
  return within(screen.getByRole("dialog"));
}

const RECEIVED_TEXT: ChatReceivedMessage = {
  memberId: 2,
  type: "TEXT",
  content: "다들 집중 잘 하고 계신가요?",
  quickActionType: null,
};

beforeAll(() => {
  // jsdom은 HTMLDialogElement.showModal을 구현하지 않음.
  // open을 실제로 켜지 않으면 getByRole이 dialog 내부를 숨김 처리해 버린다.
  HTMLDialogElement.prototype.showModal = jest.fn(function (this: HTMLDialogElement) {
    this.open = true;
  });
});

beforeEach(() => {
  mockStatus = "connected";
  capturedOptions = null;
  jest.clearAllMocks();
});

describe("세션 채팅 (참여자 카드 + 다이얼로그)", () => {
  describe("세션 정보 헤더", () => {
    it("카테고리/제목/설명/공지/참여자 수를 렌더링한다", () => {
      renderCard();
      const dialog = openChat();

      expect(dialog.getByText("개발")).toBeInTheDocument();
      expect(dialog.getByText("아침 코딩 모각작")).toBeInTheDocument();
      expect(dialog.getByText("각자 코딩 작업에 집중하는 세션")).toBeInTheDocument();
      expect(dialog.getByText("빡집중해서 같이 코딩해요!")).toBeInTheDocument();
      expect(dialog.getByText(/2명/)).toBeInTheDocument();
    });

    it("안내 문구(현재는 방장만 채팅할 수 있어요)를 항상 표시한다", () => {
      renderCard();
      const dialog = openChat();
      expect(dialog.getByText("현재는 방장만 채팅할 수 있어요")).toBeInTheDocument();
    });
  });

  describe("참여자(비호스트) 렌더 분기", () => {
    it("퀵액션 바를 렌더링하지 않는다", () => {
      renderCard({ isHost: false });
      const dialog = openChat();
      expect(dialog.queryByRole("button", { name: /좋아요/ })).not.toBeInTheDocument();
      expect(dialog.queryByRole("button", { name: /지금 당장 각!/ })).not.toBeInTheDocument();
    });

    it("입력창과 보내기 버튼이 비활성화된다", () => {
      renderCard({ isHost: false });
      const dialog = openChat();
      expect(dialog.getByPlaceholderText("텍스트를 입력해 주세요")).toBeDisabled();
      expect(dialog.getByRole("button", { name: /보내기/ })).toBeDisabled();
    });
  });

  describe("호스트 렌더 분기", () => {
    it("퀵액션 버튼 5개를 모두 렌더링한다", () => {
      renderCard({ isHost: true });
      const dialog = openChat();

      expect(dialog.getByRole("button", { name: /지금 당장 각!/ })).toBeInTheDocument();
      expect(dialog.getByRole("button", { name: /핸드폰 금지/ })).toBeInTheDocument();
      expect(dialog.getByRole("button", { name: /좋아요/ })).toBeInTheDocument();
      expect(dialog.getByRole("button", { name: /잠깐 쉬어갈까요\?/ })).toBeInTheDocument();
      expect(dialog.getByRole("button", { name: /투두 완료!/ })).toBeInTheDocument();
    });

    it("입력창과 보내기 버튼이 활성화된다", () => {
      renderCard({ isHost: true });
      const dialog = openChat();
      expect(dialog.getByPlaceholderText("텍스트를 입력해 주세요")).toBeEnabled();
      expect(dialog.getByRole("button", { name: /보내기/ })).toBeEnabled();
    });

    it("호스트여도 연결되지 않은 상태면 입력창과 보내기 버튼이 비활성화된다", () => {
      // 연결 전/재연결 중에 전송하면 메시지가 조용히 유실되므로 입력을 막는다
      mockStatus = "connecting";
      renderCard({ isHost: true });
      const dialog = openChat();
      expect(dialog.getByPlaceholderText("텍스트를 입력해 주세요")).toBeDisabled();
      expect(dialog.getByRole("button", { name: /보내기/ })).toBeDisabled();
    });
  });

  describe("메시지 전송 (호스트)", () => {
    it("텍스트 입력 후 보내기를 누르면 TEXT 메시지를 발행한다", () => {
      renderCard({ isHost: true });
      const dialog = openChat();

      fireEvent.change(dialog.getByPlaceholderText("텍스트를 입력해 주세요"), {
        target: { value: "모두 집중해주세요!" },
      });
      fireEvent.click(dialog.getByRole("button", { name: /보내기/ }));

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({ type: "TEXT", content: "모두 집중해주세요!" });
    });

    it("빈 입력으로 보내기를 누르면 아무것도 발행하지 않는다", () => {
      renderCard({ isHost: true });
      const dialog = openChat();
      fireEvent.click(dialog.getByRole("button", { name: /보내기/ }));
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("퀵액션을 선택하면 지정 문구가 입력창에 채워지고, 보내기 시 content로 발행된다", () => {
      renderCard({ isHost: true });
      const dialog = openChat();

      fireEvent.click(dialog.getByRole("button", { name: /좋아요/ }));
      expect(dialog.getByPlaceholderText("텍스트를 입력해 주세요")).toHaveValue(
        QUICK_ACTION_CONFIG.LIKE.message
      );

      fireEvent.click(dialog.getByRole("button", { name: /보내기/ }));

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({
        type: "QUICK_ACTION",
        quickActionType: "LIKE",
        content: QUICK_ACTION_CONFIG.LIKE.message,
      });
    });

    it("퀵액션 선택 중에는 입력창이 잠기고(readOnly) 보내기는 가능하다", () => {
      // 디자이너 요구: 지정 문구는 변형 없이 그대로만 전송돼야 한다
      renderCard({ isHost: true });
      const dialog = openChat();

      fireEvent.click(dialog.getByRole("button", { name: /핸드폰 금지/ }));

      expect(dialog.getByPlaceholderText("텍스트를 입력해 주세요")).toHaveAttribute("readonly");
      expect(dialog.getByRole("button", { name: /보내기/ })).toBeEnabled();
    });

    it("다른 퀵액션으로 전환하면 입력창이 새 지정 문구로 교체된다", () => {
      renderCard({ isHost: true });
      const dialog = openChat();

      fireEvent.click(dialog.getByRole("button", { name: /좋아요/ }));
      fireEvent.click(dialog.getByRole("button", { name: /투두 완료!/ }));

      expect(dialog.getByPlaceholderText("텍스트를 입력해 주세요")).toHaveValue(
        QUICK_ACTION_CONFIG.TODO_DONE.message
      );
    });

    it("전송 후 입력이 비워지고 퀵액션 선택이 초기화된다", () => {
      renderCard({ isHost: true });
      const dialog = openChat();

      fireEvent.click(dialog.getByRole("button", { name: /좋아요/ }));
      fireEvent.click(dialog.getByRole("button", { name: /보내기/ }));
      mockSend.mockClear();

      expect(dialog.getByPlaceholderText("텍스트를 입력해 주세요")).toHaveValue("");
      fireEvent.click(dialog.getByRole("button", { name: /보내기/ }));
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("같은 퀵액션을 다시 누르면 선택이 해제되고 입력창이 비워진다", () => {
      renderCard({ isHost: true });
      const dialog = openChat();
      const input = dialog.getByPlaceholderText("텍스트를 입력해 주세요");

      fireEvent.click(dialog.getByRole("button", { name: /좋아요/ }));
      fireEvent.click(dialog.getByRole("button", { name: /좋아요/ }));

      // 지정 문구가 일반 텍스트로 남지 않아야 하고, 잠금도 풀려야 한다
      expect(input).toHaveValue("");
      expect(input).not.toHaveAttribute("readonly");

      fireEvent.change(input, { target: { value: "텍스트만" } });
      fireEvent.click(dialog.getByRole("button", { name: /보내기/ }));

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({ type: "TEXT", content: "텍스트만" });
    });
  });

  describe("메시지 수신", () => {
    it("수신한 TEXT 메시지를 발신자 정보와 함께 렌더링한다", () => {
      renderCard();
      const dialog = openChat();

      act(() => {
        capturedOptions?.onMessage?.(RECEIVED_TEXT);
      });

      expect(dialog.getByText("다들 집중 잘 하고 계신가요?")).toBeInTheDocument();
    });

    it("수신한 QUICK_ACTION 메시지를 라벨 칩으로 렌더링한다", () => {
      renderCard();
      const dialog = openChat();

      act(() => {
        capturedOptions?.onMessage?.({
          memberId: 2,
          type: "QUICK_ACTION",
          content: null,
          quickActionType: "BREAK_TIME",
        });
      });

      expect(dialog.getByText("잠깐 쉬어갈까요?")).toBeInTheDocument();
    });

    it("같은 발신자의 연속 메시지도 각각 아바타를 노출한다", () => {
      // 디자인상 메시지 1개당 프로필 1개 — 연속 메시지를 묶어 아바타를 생략하지 않는다
      renderCard();
      const dialog = openChat();

      act(() => {
        capturedOptions?.onMessage?.({ ...RECEIVED_TEXT, content: "첫 번째" });
        capturedOptions?.onMessage?.({ ...RECEIVED_TEXT, content: "두 번째" });
      });

      expect(dialog.getAllByLabelText("방장")).toHaveLength(2);
    });

    it("content가 있는 퀵액션 메시지는 말풍선과 칩을 아바타 하나로 묶어 렌더한다", () => {
      // 백엔드 합의: 퀵액션 메시지 한 건에 지정 문구(content)와 quickActionType이 함께 담긴다
      renderCard();
      const dialog = openChat();

      act(() => {
        capturedOptions?.onMessage?.({
          memberId: 2,
          type: "QUICK_ACTION",
          content: "핸드폰 내려놓고 집중!",
          quickActionType: "PHONE_BAN",
        });
      });

      expect(dialog.getByText("핸드폰 내려놓고 집중!")).toBeInTheDocument();
      expect(dialog.getByText("핸드폰 금지")).toBeInTheDocument();
      expect(dialog.getAllByLabelText("방장")).toHaveLength(1);
    });
  });

  describe("채팅 기록 보존", () => {
    it("다이얼로그를 닫았다 다시 열어도 수신한 메시지가 유지된다", () => {
      renderCard();
      let dialog = openChat();

      act(() => {
        capturedOptions?.onMessage?.({ ...RECEIVED_TEXT, content: "기록 보존 테스트" });
      });
      expect(dialog.getByText("기록 보존 테스트")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "채팅 닫기" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      dialog = openChat();
      expect(dialog.getByText("기록 보존 테스트")).toBeInTheDocument();
    });

    it("다이얼로그가 닫혀 있는 동안 수신한 메시지도 다시 열면 보인다", () => {
      renderCard();

      act(() => {
        capturedOptions?.onMessage?.({ ...RECEIVED_TEXT, content: "닫힌 동안 온 메시지" });
      });

      const dialog = openChat();
      expect(dialog.getByText("닫힌 동안 온 메시지")).toBeInTheDocument();
    });
  });

  describe("연결 상태/에러", () => {
    it("disconnected 상태면 연결 실패 안내를 표시한다", () => {
      mockStatus = "disconnected";
      renderCard();
      const dialog = openChat();
      expect(dialog.getByText("연결할 수 없어요")).toBeInTheDocument();
    });

    it("connecting 상태면 연결 중 안내를 표시한다", () => {
      mockStatus = "connecting";
      renderCard();
      const dialog = openChat();
      expect(dialog.getByText("연결 중이에요")).toBeInTheDocument();
    });

    it("채팅 도중 재연결 중이면 기존 메시지를 유지하고 재연결 안내를 함께 표시한다", () => {
      const { rerender } = renderCard();
      const dialog = openChat();

      act(() => {
        capturedOptions?.onMessage?.({ ...RECEIVED_TEXT, content: "곧 돌아올게요" });
      });

      mockStatus = "reconnecting";
      rerender(<SessionParticipantListCard {...BASE_PROPS} />);

      expect(dialog.getByText("곧 돌아올게요")).toBeInTheDocument();
      expect(dialog.getByText("다시 연결 중이에요")).toBeInTheDocument();
    });

    it("연결이 복구되면 재연결 안내가 사라진다", () => {
      mockStatus = "reconnecting";
      const { rerender } = renderCard();
      const dialog = openChat();

      act(() => {
        capturedOptions?.onMessage?.({ ...RECEIVED_TEXT, content: "곧 돌아올게요" });
      });

      mockStatus = "connected";
      rerender(<SessionParticipantListCard {...BASE_PROPS} />);

      expect(dialog.queryByText("다시 연결 중이에요")).not.toBeInTheDocument();
    });

    it("채팅 에러 수신 시 토스트로 표시한다", () => {
      renderCard();
      openChat();

      act(() => {
        capturedOptions?.onError?.({ code: "SESSION403_01", message: "HOST만 채팅이 가능합니다." });
      });

      expect(toast.error).toHaveBeenCalledWith("HOST만 채팅이 가능합니다.");
    });
  });
});

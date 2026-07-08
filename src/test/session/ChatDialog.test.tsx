import { act, fireEvent, render, screen } from "@testing-library/react";

import { ChatDialog } from "@/features/session/components/ChatDialog/ChatDialog";
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
  onClose: jest.fn(),
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

describe("ChatDialog", () => {
  describe("세션 정보 헤더", () => {
    it("카테고리/제목/설명/공지/참여자 수를 렌더링한다", () => {
      render(<ChatDialog {...BASE_PROPS} />);

      expect(screen.getByText("개발")).toBeInTheDocument();
      expect(screen.getByText("아침 코딩 모각작")).toBeInTheDocument();
      expect(screen.getByText("각자 코딩 작업에 집중하는 세션")).toBeInTheDocument();
      expect(screen.getByText("빡집중해서 같이 코딩해요!")).toBeInTheDocument();
      expect(screen.getByText(/2명/)).toBeInTheDocument();
    });

    it("안내 문구(현재는 방장만 채팅할 수 있어요)를 항상 표시한다", () => {
      render(<ChatDialog {...BASE_PROPS} />);
      expect(screen.getByText("현재는 방장만 채팅할 수 있어요")).toBeInTheDocument();
    });
  });

  describe("참여자(비호스트) 렌더 분기", () => {
    it("퀵액션 바를 렌더링하지 않는다", () => {
      render(<ChatDialog {...BASE_PROPS} isHost={false} />);
      expect(screen.queryByRole("button", { name: /좋아요/ })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /지금 당장 각!/ })).not.toBeInTheDocument();
    });

    it("입력창과 보내기 버튼이 비활성화된다", () => {
      render(<ChatDialog {...BASE_PROPS} isHost={false} />);
      expect(screen.getByPlaceholderText("텍스트를 입력해 주세요")).toBeDisabled();
      expect(screen.getByRole("button", { name: /보내기/ })).toBeDisabled();
    });
  });

  describe("호스트 렌더 분기", () => {
    it("퀵액션 버튼 5개를 모두 렌더링한다", () => {
      render(<ChatDialog {...BASE_PROPS} isHost />);

      expect(screen.getByRole("button", { name: /지금 당장 각!/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /핸드폰 금지/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /좋아요/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /잠깐 쉬어갈까요\?/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /투두 완료!/ })).toBeInTheDocument();
    });

    it("입력창과 보내기 버튼이 활성화된다", () => {
      render(<ChatDialog {...BASE_PROPS} isHost />);
      expect(screen.getByPlaceholderText("텍스트를 입력해 주세요")).toBeEnabled();
      expect(screen.getByRole("button", { name: /보내기/ })).toBeEnabled();
    });

    it("호스트여도 연결되지 않은 상태면 입력창과 보내기 버튼이 비활성화된다", () => {
      // 연결 전/재연결 중에 전송하면 메시지가 조용히 유실되므로 입력을 막는다
      mockStatus = "connecting";
      render(<ChatDialog {...BASE_PROPS} isHost />);
      expect(screen.getByPlaceholderText("텍스트를 입력해 주세요")).toBeDisabled();
      expect(screen.getByRole("button", { name: /보내기/ })).toBeDisabled();
    });
  });

  describe("메시지 전송 (호스트)", () => {
    it("텍스트 입력 후 보내기를 누르면 TEXT 메시지를 발행한다", () => {
      render(<ChatDialog {...BASE_PROPS} isHost />);

      fireEvent.change(screen.getByPlaceholderText("텍스트를 입력해 주세요"), {
        target: { value: "모두 집중해주세요!" },
      });
      fireEvent.click(screen.getByRole("button", { name: /보내기/ }));

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({ type: "TEXT", content: "모두 집중해주세요!" });
    });

    it("빈 입력으로 보내기를 누르면 아무것도 발행하지 않는다", () => {
      render(<ChatDialog {...BASE_PROPS} isHost />);
      fireEvent.click(screen.getByRole("button", { name: /보내기/ }));
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("퀵액션 선택 후 보내기를 누르면 QUICK_ACTION 메시지를 발행한다", () => {
      render(<ChatDialog {...BASE_PROPS} isHost />);

      fireEvent.click(screen.getByRole("button", { name: /좋아요/ }));
      fireEvent.click(screen.getByRole("button", { name: /보내기/ }));

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({ type: "QUICK_ACTION", quickActionType: "LIKE" });
    });

    it("텍스트+퀵액션을 함께 보내면 TEXT 다음 QUICK_ACTION 순서로 발행한다", () => {
      render(<ChatDialog {...BASE_PROPS} isHost />);

      fireEvent.click(screen.getByRole("button", { name: /핸드폰 금지/ }));
      fireEvent.change(screen.getByPlaceholderText("텍스트를 입력해 주세요"), {
        target: { value: "핸드폰 내려놓고 집중!" },
      });
      fireEvent.click(screen.getByRole("button", { name: /보내기/ }));

      expect(mockSend).toHaveBeenNthCalledWith(1, {
        type: "TEXT",
        content: "핸드폰 내려놓고 집중!",
      });
      expect(mockSend).toHaveBeenNthCalledWith(2, {
        type: "QUICK_ACTION",
        quickActionType: "PHONE_BAN",
      });
    });

    it("전송 후 입력과 퀵액션 선택이 초기화된다", () => {
      render(<ChatDialog {...BASE_PROPS} isHost />);

      fireEvent.click(screen.getByRole("button", { name: /좋아요/ }));
      fireEvent.change(screen.getByPlaceholderText("텍스트를 입력해 주세요"), {
        target: { value: "안녕" },
      });
      fireEvent.click(screen.getByRole("button", { name: /보내기/ }));
      mockSend.mockClear();

      fireEvent.click(screen.getByRole("button", { name: /보내기/ }));
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("같은 퀵액션을 다시 누르면 선택이 해제된다", () => {
      render(<ChatDialog {...BASE_PROPS} isHost />);

      fireEvent.click(screen.getByRole("button", { name: /좋아요/ }));
      fireEvent.click(screen.getByRole("button", { name: /좋아요/ }));
      fireEvent.change(screen.getByPlaceholderText("텍스트를 입력해 주세요"), {
        target: { value: "텍스트만" },
      });
      fireEvent.click(screen.getByRole("button", { name: /보내기/ }));

      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledWith({ type: "TEXT", content: "텍스트만" });
    });
  });

  describe("메시지 수신", () => {
    it("수신한 TEXT 메시지를 발신자 정보와 함께 렌더링한다", () => {
      render(<ChatDialog {...BASE_PROPS} />);

      act(() => {
        capturedOptions?.onMessage?.({
          memberId: 2,
          type: "TEXT",
          content: "다들 집중 잘 하고 계신가요?",
          quickActionType: null,
        });
      });

      expect(screen.getByText("다들 집중 잘 하고 계신가요?")).toBeInTheDocument();
    });

    it("수신한 QUICK_ACTION 메시지를 라벨 칩으로 렌더링한다", () => {
      render(<ChatDialog {...BASE_PROPS} />);

      act(() => {
        capturedOptions?.onMessage?.({
          memberId: 2,
          type: "QUICK_ACTION",
          content: null,
          quickActionType: "BREAK_TIME",
        });
      });

      expect(screen.getByText("잠깐 쉬어갈까요?")).toBeInTheDocument();
    });
  });

  describe("연결 상태/에러", () => {
    it("disconnected 상태면 연결 실패 안내를 표시한다", () => {
      mockStatus = "disconnected";
      render(<ChatDialog {...BASE_PROPS} />);
      expect(screen.getByText("연결할 수 없어요")).toBeInTheDocument();
    });

    it("채팅 에러 수신 시 토스트로 표시한다", () => {
      render(<ChatDialog {...BASE_PROPS} />);

      act(() => {
        capturedOptions?.onError?.({ code: "SESSION403_01", message: "HOST만 채팅이 가능합니다." });
      });

      expect(toast.error).toHaveBeenCalledWith("HOST만 채팅이 가능합니다.");
    });
  });
});

import { Client } from "@stomp/stompjs";

import { createChatSocket } from "@/lib/socket/client";
import type { ChatError, ChatReceivedMessage } from "@/lib/socket/types";

interface MockStompConfig {
  brokerURL: string;
  connectHeaders?: Record<string, string>;
  reconnectDelay: number;
  onConnect?: () => void;
  onStompError?: (frame: { headers: Record<string, string>; body: string }) => void;
  onWebSocketClose?: () => void;
  onWebSocketError?: (event: Event) => void;
  debug?: (str: string) => void;
}

class MockStompClient {
  config: MockStompConfig;
  active = false;
  connected = false;
  activate = jest.fn(() => {
    this.active = true;
  });
  deactivate = jest.fn(() => {
    this.active = false;
    this.connected = false;
  });
  publish = jest.fn();
  subscriptions = new Map<string, (message: { body: string }) => void>();
  subscribe = jest.fn((destination: string, callback: (message: { body: string }) => void) => {
    this.subscriptions.set(destination, callback);
    return { unsubscribe: jest.fn() };
  });

  constructor(config: MockStompConfig) {
    this.config = config;
  }

  simulateConnect() {
    this.connected = true;
    this.config.onConnect?.();
  }

  simulateStompError(message = "Auth failed") {
    this.config.onStompError?.({ headers: { message }, body: "" });
  }

  simulateWebSocketClose() {
    this.connected = false;
    this.config.onWebSocketClose?.();
  }

  simulateMessage(destination: string, data: unknown) {
    this.subscriptions.get(destination)?.({ body: JSON.stringify(data) });
  }

  simulateRawMessage(destination: string, rawBody: string) {
    this.subscriptions.get(destination)?.({ body: rawBody });
  }
}

let mockClientInstance: MockStompClient | null = null;
// 재연결로 새 client가 생성되면 옛 인스턴스 참조가 필요하므로 전부 보관한다
const mockInstances: MockStompClient[] = [];

jest.mock("@stomp/stompjs", () => ({
  Client: jest.fn().mockImplementation((config: MockStompConfig) => {
    const instance = new MockStompClient(config);
    mockClientInstance = instance;
    mockInstances.push(instance);
    return instance;
  }),
}));

beforeEach(() => {
  mockClientInstance = null;
  mockInstances.length = 0;
  process.env.NEXT_PUBLIC_WS_URL = "wss://api.gak.today";
});

afterEach(() => {
  jest.clearAllMocks();
  delete process.env.NEXT_PUBLIC_WS_URL;
});

describe("ChatSocket", () => {
  describe("초기 상태", () => {
    it("초기 status는 idle이어야 합니다", () => {
      const socket = createChatSocket();
      expect(socket.status).toBe("idle");
    });
  });

  describe("connect", () => {
    it("connect 호출 시 status가 connecting으로 변경되어야 합니다", () => {
      const socket = createChatSocket();
      socket.connect("1", "token-abc");

      expect(socket.status).toBe("connecting");
    });

    it("connectHeaders에 Authorization: Bearer {token} 형식으로 전달되어야 합니다", () => {
      const socket = createChatSocket();
      socket.connect("1", "token-abc");

      expect(mockClientInstance!.config.connectHeaders).toEqual({
        Authorization: "Bearer token-abc",
      });
    });

    it("brokerURL이 NEXT_PUBLIC_WS_URL 기반 /ws 엔드포인트여야 합니다", () => {
      const socket = createChatSocket();
      socket.connect("1", "token-abc");

      expect(mockClientInstance!.config.brokerURL).toBe("wss://api.gak.today/ws");
    });

    it("onConnect 시 status가 connected로 변경되어야 합니다", () => {
      const socket = createChatSocket();
      socket.connect("1", "token-abc");

      mockClientInstance!.simulateConnect();

      expect(socket.status).toBe("connected");
    });

    it("onConnect 시 /sub/chat/{sessionId}와 /user/queue/chat/error를 모두 구독해야 합니다", () => {
      const socket = createChatSocket();
      socket.connect("42", "token-abc");

      mockClientInstance!.simulateConnect();

      expect(mockClientInstance!.subscribe).toHaveBeenCalledWith(
        "/sub/chat/42",
        expect.any(Function)
      );
      expect(mockClientInstance!.subscribe).toHaveBeenCalledWith(
        "/user/queue/chat/error",
        expect.any(Function)
      );
    });

    it("이미 활성 연결 상태면 재호출을 무시해야 합니다", () => {
      const socket = createChatSocket();
      socket.connect("1", "token-abc");
      mockClientInstance!.simulateConnect();

      socket.connect("2", "token-def");

      // Client 생성자가 두 번째 connect에서 다시 호출되지 않아야 함
      expect(Client).toHaveBeenCalledTimes(1);
    });
  });

  describe("메시지 수신", () => {
    it("/sub/chat/{sessionId} 메시지를 message 이벤트로 전달해야 합니다", () => {
      const socket = createChatSocket();
      const callback = jest.fn();
      socket.on("message", callback);

      socket.connect("42", "token-abc");
      mockClientInstance!.simulateConnect();

      const payload: ChatReceivedMessage = {
        memberId: 1,
        type: "TEXT",
        content: "안녕하세요",
        quickActionType: null,
      };
      mockClientInstance!.simulateMessage("/sub/chat/42", payload);

      expect(callback).toHaveBeenCalledWith(payload);
    });

    it("/user/queue/chat/error 메시지를 error 이벤트로 전달해야 합니다", () => {
      const socket = createChatSocket();
      const callback = jest.fn();
      socket.on("error", callback);

      socket.connect("42", "token-abc");
      mockClientInstance!.simulateConnect();

      const payload: ChatError = { code: "SESSION403_01", message: "HOST만 채팅이 가능합니다." };
      mockClientInstance!.simulateMessage("/user/queue/chat/error", payload);

      expect(callback).toHaveBeenCalledWith(payload);
    });

    it("잘못된 JSON 메시지는 무시하고 콜백을 호출하지 않아야 합니다", () => {
      const socket = createChatSocket();
      const callback = jest.fn();
      socket.on("message", callback);

      socket.connect("42", "token-abc");
      mockClientInstance!.simulateConnect();
      mockClientInstance!.simulateRawMessage("/sub/chat/42", "not-json");

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("send", () => {
    it("연결된 상태에서 /pub/chat/{sessionId}로 publish해야 합니다", () => {
      const socket = createChatSocket();
      socket.connect("42", "token-abc");
      mockClientInstance!.simulateConnect();

      socket.send({ type: "TEXT", content: "hello" });

      expect(mockClientInstance!.publish).toHaveBeenCalledWith({
        destination: "/pub/chat/42",
        body: JSON.stringify({ type: "TEXT", content: "hello" }),
      });
    });

    it("연결되지 않은 상태에서는 publish를 호출하지 않아야 합니다", () => {
      const socket = createChatSocket();
      socket.connect("42", "token-abc");
      // simulateConnect를 호출하지 않아 connected: false 상태 유지

      socket.send({ type: "TEXT", content: "hello" });

      expect(mockClientInstance!.publish).not.toHaveBeenCalled();
    });
  });

  describe("status 이벤트", () => {
    it("connecting → connected → disconnected 순서로 emit되어야 합니다", () => {
      const socket = createChatSocket({ maxReconnectAttempts: 0 });
      const statuses: string[] = [];
      socket.on("status", (status: string) => statuses.push(status));

      socket.connect("42", "token-abc");
      mockClientInstance!.simulateConnect();
      mockClientInstance!.simulateWebSocketClose();

      expect(statuses).toEqual(["connecting", "connected", "disconnected"]);
    });
  });

  describe("재연결", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("WebSocket close 시 지수 백오프로 재연결을 시도해야 합니다", () => {
      const socket = createChatSocket({ maxReconnectAttempts: 3, reconnectInterval: 1000 });
      socket.connect("42", "token-abc");
      mockClientInstance!.simulateConnect();

      mockClientInstance!.simulateWebSocketClose();
      expect(socket.status).toBe("reconnecting");

      jest.advanceTimersByTime(1000);

      expect(Client).toHaveBeenCalledTimes(2);
    });

    it("최대 재연결 시도 횟수를 초과하면 더 이상 재시도하지 않아야 합니다", () => {
      const socket = createChatSocket({ maxReconnectAttempts: 1, reconnectInterval: 1000 });
      socket.connect("42", "token-abc");
      mockClientInstance!.simulateConnect();

      mockClientInstance!.simulateWebSocketClose();
      jest.advanceTimersByTime(1000); // 1차 재연결 시도 (재연결된 새 client에서)
      mockClientInstance!.simulateWebSocketClose();
      jest.advanceTimersByTime(10000); // 2차 재연결 시도는 없어야 함

      expect(Client).toHaveBeenCalledTimes(2); // 최초 1회 + 재연결 1회
    });

    it("STOMP CONNECT 거부(토큰 없음/만료) 시에도 disconnected로 전환 후 재연결을 시도해야 합니다", () => {
      const socket = createChatSocket({ maxReconnectAttempts: 3, reconnectInterval: 1000 });
      socket.connect("42", "token-abc");
      mockClientInstance!.simulateConnect();

      mockClientInstance!.simulateStompError("Token expired");
      expect(socket.status).toBe("reconnecting");

      jest.advanceTimersByTime(1000);

      expect(Client).toHaveBeenCalledTimes(2);
    });

    it("STOMP CONNECT 거부 시 /user/queue/chat/error 계약에 없는 에러를 조작해 emit하지 않아야 합니다", () => {
      const socket = createChatSocket({ maxReconnectAttempts: 3, reconnectInterval: 1000 });
      const errorCallback = jest.fn();
      socket.on("error", errorCallback);

      socket.connect("42", "token-abc");
      mockClientInstance!.simulateConnect();
      mockClientInstance!.simulateStompError("Token expired");

      expect(errorCallback).not.toHaveBeenCalled();
    });

    it("폐기된 client의 뒤늦은 close는 재연결을 다시 트리거하지 않아야 합니다", () => {
      // deactivate()는 비동기라, 폐기된 client의 close 이벤트가 discardClient() 완료 후
      // 뒤늦게 도착한다. 이 뒤늦은 close가 진행 중인 재연결을 이중으로 트리거하면 안 된다.
      const socket = createChatSocket({ maxReconnectAttempts: 3, reconnectInterval: 1000 });
      const statuses: string[] = [];
      socket.on("status", (status: string) => statuses.push(status));

      socket.connect("42", "token-abc");
      mockInstances[0].simulateConnect();

      // STOMP 에러 → discardClient(구 client deactivate) + tryReconnect (1회)
      mockInstances[0].simulateStompError("Token expired");
      // 구 client의 deactivate가 유발하는 뒤늦은 close (비동기 close 재현)
      mockInstances[0].simulateWebSocketClose();

      // 재연결 시도는 STOMP 에러로 인한 1회뿐이어야 한다
      expect(statuses.filter((status) => status === "reconnecting")).toHaveLength(1);
    });

    it("폐기된 client의 뒤늦은 stompError는 새 연결을 끊거나 재연결을 다시 트리거하지 않아야 합니다", () => {
      // close가 먼저 오고(→재연결로 새 client 생성) 폐기된 구 client의 stompError가
      // 뒤늦게 도착하는 경우. 신원 비교 가드가 없으면 살아있는 새 연결을 끊고
      // 재연결을 이중 예약한다.
      const socket = createChatSocket({ maxReconnectAttempts: 3, reconnectInterval: 1000 });
      const statuses: string[] = [];
      socket.on("status", (status: string) => statuses.push(status));

      socket.connect("42", "token-abc");
      mockInstances[0].simulateConnect();

      // 구 client(A) 소켓이 먼저 닫힘 → A 폐기 + 재연결 예약(1회)
      mockInstances[0].simulateWebSocketClose();
      jest.advanceTimersByTime(1000); // 타이머 → 재연결로 새 client(B) 생성
      mockInstances[1].simulateConnect(); // B 연결됨

      // 폐기된 A가 뒤늦게 쏜 stompError
      mockInstances[0].simulateStompError("Late error from discarded client");

      // B는 살아있어야 하고, 재연결은 close로 인한 1회뿐이어야 한다
      expect(socket.status).toBe("connected");
      expect(mockInstances[1].deactivate).not.toHaveBeenCalled();
      expect(statuses.filter((status) => status === "reconnecting")).toHaveLength(1);
    });
  });

  describe("disconnect", () => {
    it("disconnect 호출 시 status가 idle로 변경되고 client가 deactivate되어야 합니다", () => {
      const socket = createChatSocket();
      socket.connect("42", "token-abc");
      mockClientInstance!.simulateConnect();

      const deactivateSpy = mockClientInstance!.deactivate;
      socket.disconnect();

      expect(socket.status).toBe("idle");
      expect(deactivateSpy).toHaveBeenCalled();
    });
  });

  describe("on/removeAllListeners", () => {
    it("on은 unsubscribe 함수를 반환하고, 호출 시 리스너가 제거되어야 합니다", () => {
      const socket = createChatSocket();
      const callback = jest.fn();
      const unsubscribe = socket.on("message", callback);

      unsubscribe();

      socket.connect("42", "token-abc");
      mockClientInstance!.simulateConnect();
      mockClientInstance!.simulateMessage("/sub/chat/42", {
        memberId: 1,
        type: "TEXT",
        content: "hi",
        quickActionType: null,
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });
});

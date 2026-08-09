import { SSEClient } from "./client";

interface SharedClientEntry {
  client: SSEClient;
  refCount: number;
}

/**
 * url 단위로 SSEClient를 공유하는 레지스트리.
 *
 * 통합 room 채널처럼 하나의 커넥션에서 여러 이벤트가 내려오는 경우,
 * 이벤트별 훅이 각자 EventSource를 열면 동일 URL로 커넥션이 중복 생성된다.
 * (백엔드는 같은 sessionId+memberId 재구독 시 이전 연결을 끊으므로 서로를 끊어먹는다.)
 * 참조 카운트로 커넥션 수명을 관리해 구독자가 모두 사라졌을 때만 실제로 연결을 끊는다.
 */
const sharedClients = new Map<string, SharedClientEntry>();

export function acquireSSEClient(url: string): SSEClient {
  let entry = sharedClients.get(url);

  if (!entry) {
    entry = { client: new SSEClient(), refCount: 0 };
    sharedClients.set(url, entry);
  }

  entry.refCount += 1;

  // 첫 구독자일 때만 연결한다. 이후 재연결은 SSEClient가 스스로 관리한다.
  // 단 재연결 시도를 모두 소진해 끊긴 상태라면, 새 구독자를 계기로 다시 시도한다.
  const status = entry.client.status;
  if (entry.refCount === 1 || status === "idle" || status === "disconnected") {
    entry.client.connect(url);
  }

  return entry.client;
}

export function releaseSSEClient(url: string): void {
  const entry = sharedClients.get(url);
  if (!entry) return;

  entry.refCount -= 1;
  if (entry.refCount > 0) return;

  sharedClients.delete(url);
  entry.client.disconnect();
  entry.client.removeAllListeners();
}

/** 테스트 전용: 레지스트리에 남은 커넥션을 모두 정리한다. */
export function resetSharedSSEClients(): void {
  sharedClients.forEach((entry) => {
    entry.client.disconnect();
    entry.client.removeAllListeners();
  });
  sharedClients.clear();
}

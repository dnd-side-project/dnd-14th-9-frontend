import { StrictMode, useRef } from "react";

import { render } from "@testing-library/react";

import { useLeaveOnUnmount } from "@/features/lobby/hooks/useLeaveOnUnmount";

function Harness({ enabled }: { enabled: boolean }) {
  const isLeavingRef = useRef(false);
  useLeaveOnUnmount({ sessionId: "900", enabled, isLeavingRef, isKicked: false });
  return null;
}

describe("useLeaveOnUnmount - StrictMode 이중 호출 안전성", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.resolve({ ok: true })) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it("StrictMode에서 enabled=true로 마운트해도 모의 언마운트로 leave가 호출되면 안 된다", async () => {
    // warm cache 시나리오: 마운트 시점에 이미 참여자(enabled=true)
    render(
      <StrictMode>
        <Harness enabled />
      </StrictMode>
    );

    // StrictMode는 mount → cleanup → mount 순으로 effect를 이중 호출한다.
    // 실제 언마운트가 아니므로 leave(fetch DELETE)가 발사되면 안 된다.
    await new Promise((resolve) => setTimeout(resolve, 10));

    const leaveCalls = (global.fetch as jest.Mock).mock.calls.filter(([url]) =>
      String(url).includes("/leave")
    );
    expect(leaveCalls).toHaveLength(0);
  });

  it("실제 언마운트 시에는 leave가 호출되어야 한다", async () => {
    const { unmount } = render(<Harness enabled />);
    unmount();

    await new Promise((resolve) => setTimeout(resolve, 10));

    const leaveCalls = (global.fetch as jest.Mock).mock.calls.filter(([url]) =>
      String(url).includes("/leave")
    );
    expect(leaveCalls.length).toBeGreaterThanOrEqual(1);
  });
});

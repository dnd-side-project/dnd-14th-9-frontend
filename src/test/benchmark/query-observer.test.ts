import { QueryClient } from "@tanstack/react-query";

import { ensureQueryObserver } from "@/lib/benchmark/query-observer";

describe("ensureQueryObserver", () => {
  const originalPublicMode = process.env.NEXT_PUBLIC_BENCHMARK_MODE;

  afterEach(() => {
    process.env.NEXT_PUBLIC_BENCHMARK_MODE = originalPublicMode;
    const runtime = window as Window & {
      __GAK_BENCHMARK_EVENTS__?: unknown;
      __GAK_BENCHMARK_CONTEXT__?: unknown;
    };
    delete runtime.__GAK_BENCHMARK_EVENTS__;
    delete runtime.__GAK_BENCHMARK_CONTEXT__;
  });

  it("플래그가 꺼져 있으면 QueryClient 동작을 바꾸지 않는다", async () => {
    process.env.NEXT_PUBLIC_BENCHMARK_MODE = "false";
    const queryClient = new QueryClient();
    const originalInvalidate = queryClient.invalidateQueries;
    ensureQueryObserver(queryClient);
    expect(queryClient.invalidateQueries).toBe(originalInvalidate);
  });

  it("invalidateQueries와 setQueryData를 관찰만 하고 결과는 그대로 둔다", async () => {
    process.env.NEXT_PUBLIC_BENCHMARK_MODE = "true";
    const queryClient = new QueryClient();
    ensureQueryObserver(queryClient);

    queryClient.setQueryData(["member", "data"], { nickname: "before" });
    await queryClient.invalidateQueries({ queryKey: ["member"] });
    const data = queryClient.getQueryData(["member", "data"]);

    expect(data).toEqual({ nickname: "before" });
    const events = (window as Window & { __GAK_BENCHMARK_EVENTS__?: Array<{ kind: string }> })
      .__GAK_BENCHMARK_EVENTS__;
    expect(events?.some((event) => event.kind === "setQueryData")).toBe(true);
    expect(events?.some((event) => event.kind === "invalidateQueries")).toBe(true);
  });

  it("records the current client step on TanStack events", async () => {
    process.env.NEXT_PUBLIC_BENCHMARK_MODE = "true";
    (
      window as Window & {
        __GAK_BENCHMARK_CONTEXT__?: { scenario: string; run: number; phase: string; step: string };
      }
    ).__GAK_BENCHMARK_CONTEXT__ = {
      scenario: "session-detail-warm",
      run: 1,
      phase: "recorded",
      step: "detail-revisit",
    };
    const queryClient = new QueryClient();
    ensureQueryObserver(queryClient);
    queryClient.setQueryData(["session", "detail", "1"], { id: "1" });

    const events = (
      window as Window & {
        __GAK_BENCHMARK_EVENTS__?: Array<{ kind: string; step?: string; scenario?: string }>;
      }
    ).__GAK_BENCHMARK_EVENTS__;
    const recorded = events?.find((event) => event.kind === "setQueryData");
    expect(recorded?.step).toBe("detail-revisit");
    expect(recorded?.scenario).toBe("session-detail-warm");
  });
});

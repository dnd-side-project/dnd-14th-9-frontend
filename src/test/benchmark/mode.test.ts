import { isBenchmarkClientMode, isBenchmarkMode } from "@/lib/benchmark/mode";

describe("benchmark mode flags", () => {
  const originalBenchmarkMode = process.env.BENCHMARK_MODE;
  const originalPublicMode = process.env.NEXT_PUBLIC_BENCHMARK_MODE;

  afterEach(() => {
    process.env.BENCHMARK_MODE = originalBenchmarkMode;
    process.env.NEXT_PUBLIC_BENCHMARK_MODE = originalPublicMode;
  });

  it("기본값에서는 비활성화된다", () => {
    delete process.env.BENCHMARK_MODE;
    delete process.env.NEXT_PUBLIC_BENCHMARK_MODE;

    expect(isBenchmarkMode()).toBe(false);
    expect(isBenchmarkClientMode()).toBe(false);
  });

  it("true 문자열일 때만 활성화된다", () => {
    process.env.BENCHMARK_MODE = "true";
    process.env.NEXT_PUBLIC_BENCHMARK_MODE = "true";

    expect(isBenchmarkMode()).toBe(true);
    expect(isBenchmarkClientMode()).toBe(true);
  });
});

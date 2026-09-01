export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.BENCHMARK_MODE === "true") {
    const { installBenchmarkFetchHook } = await import("./lib/benchmark/install-fetch-hook");
    installBenchmarkFetchHook();
  }

  const { ensureMockServer } = await import("./mocks/server-control");

  await ensureMockServer();
}

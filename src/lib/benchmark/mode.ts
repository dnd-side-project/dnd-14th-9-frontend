export function isBenchmarkMode(): boolean {
  return process.env.BENCHMARK_MODE === "true";
}

export function isBenchmarkClientMode(): boolean {
  return process.env.NEXT_PUBLIC_BENCHMARK_MODE === "true";
}

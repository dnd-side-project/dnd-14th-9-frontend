import { existsSync, readFileSync } from "node:fs";

export interface BenchmarkRunContext {
  scenario: string;
  run: number;
  phase: "warmup" | "recorded" | "idle";
}

const DEFAULT_CONTEXT: BenchmarkRunContext = {
  scenario: "unassigned",
  run: 0,
  phase: "idle",
};

let memoryContext: BenchmarkRunContext = DEFAULT_CONTEXT;

export function setBenchmarkRunContext(context: BenchmarkRunContext): void {
  memoryContext = context;
}

export function getBenchmarkContextFilePath(): string {
  return (
    process.env.BENCHMARK_CONTEXT_FILE ??
    `${process.cwd()}/benchmarks/network-baseline/.run-context.json`
  );
}

export function getBenchmarkRunContext(): BenchmarkRunContext {
  const filePath = getBenchmarkContextFilePath();
  if (!existsSync(filePath)) {
    return memoryContext;
  }

  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as Partial<BenchmarkRunContext>;
    if (
      typeof parsed.scenario === "string" &&
      typeof parsed.run === "number" &&
      (parsed.phase === "warmup" || parsed.phase === "recorded" || parsed.phase === "idle")
    ) {
      memoryContext = {
        scenario: parsed.scenario,
        run: parsed.run,
        phase: parsed.phase,
      };
    }
  } catch {
    // keep last known context
  }

  return memoryContext;
}

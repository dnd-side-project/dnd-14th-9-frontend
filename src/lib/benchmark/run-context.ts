import { existsSync, readFileSync } from "node:fs";

export type BenchmarkPhase = "warmup" | "recorded" | "idle";

export interface BenchmarkRunContext {
  scenario: string;
  run: number;
  phase: BenchmarkPhase;
  step: string;
}

export const DEFAULT_BENCHMARK_CONTEXT: BenchmarkRunContext = {
  scenario: "unassigned",
  run: 0,
  phase: "idle",
  step: "unassigned",
};

export const INITIAL_BENCHMARK_CONTEXT: BenchmarkRunContext = {
  scenario: "setup",
  run: 0,
  phase: "idle",
  step: "fixture-discovery",
};

let memoryContext: BenchmarkRunContext = { ...DEFAULT_BENCHMARK_CONTEXT };

function isBenchmarkPhase(value: unknown): value is BenchmarkPhase {
  return value === "warmup" || value === "recorded" || value === "idle";
}

export function setBenchmarkRunContext(context: BenchmarkRunContext): void {
  memoryContext = { ...context };
}

export function resetBenchmarkRunContext(
  context: BenchmarkRunContext = DEFAULT_BENCHMARK_CONTEXT
): void {
  memoryContext = { ...context };
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
      isBenchmarkPhase(parsed.phase)
    ) {
      memoryContext = {
        scenario: parsed.scenario,
        run: parsed.run,
        phase: parsed.phase,
        step:
          typeof parsed.step === "string" && parsed.step.length > 0 ? parsed.step : "unassigned",
      };
    }
  } catch {
    // keep last known context
  }

  return memoryContext;
}

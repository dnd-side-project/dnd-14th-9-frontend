/**
 * @jest-environment node
 */

import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  getBenchmarkRunContext,
  INITIAL_BENCHMARK_CONTEXT,
  resetBenchmarkRunContext,
  setBenchmarkRunContext,
} from "@/lib/benchmark/run-context";

describe("benchmark run context", () => {
  const originalContextFile = process.env.BENCHMARK_CONTEXT_FILE;

  afterEach(() => {
    process.env.BENCHMARK_CONTEXT_FILE = originalContextFile;
    resetBenchmarkRunContext();
  });

  it("reads scenario, run, phase, and step from the context file", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "gak-benchmark-context-"));
    const filePath = join(outputDir, "run-context.json");
    process.env.BENCHMARK_CONTEXT_FILE = filePath;
    await writeFile(
      filePath,
      JSON.stringify({
        scenario: "session-detail-warm",
        run: 3,
        phase: "recorded",
        step: "detail-revisit",
      }),
      "utf8"
    );

    expect(getBenchmarkRunContext()).toEqual({
      scenario: "session-detail-warm",
      run: 3,
      phase: "recorded",
      step: "detail-revisit",
    });
  });

  it("defaults missing step to unassigned instead of reusing a previous recorded step", async () => {
    resetBenchmarkRunContext({
      scenario: "session-detail-warm",
      run: 1,
      phase: "recorded",
      step: "detail-first",
    });
    const outputDir = await mkdtemp(join(tmpdir(), "gak-benchmark-context-"));
    const filePath = join(outputDir, "run-context.json");
    process.env.BENCHMARK_CONTEXT_FILE = filePath;
    await writeFile(
      filePath,
      JSON.stringify({
        scenario: "setup",
        run: 0,
        phase: "idle",
      }),
      "utf8"
    );

    expect(getBenchmarkRunContext()).toEqual({
      scenario: "setup",
      run: 0,
      phase: "idle",
      step: "unassigned",
    });
  });

  it("reset restores the default idle context in memory", () => {
    setBenchmarkRunContext({
      scenario: "home-cold",
      run: 4,
      phase: "recorded",
      step: "home-initial",
    });
    resetBenchmarkRunContext();
    process.env.BENCHMARK_CONTEXT_FILE = join(tmpdir(), "missing-run-context.json");
    expect(getBenchmarkRunContext()).toMatchObject({
      scenario: "unassigned",
      run: 0,
      phase: "idle",
      step: "unassigned",
    });
  });

  it("initial fixture-discovery context is idle so it cannot enter recorded stats", () => {
    expect(INITIAL_BENCHMARK_CONTEXT).toEqual({
      scenario: "setup",
      run: 0,
      phase: "idle",
      step: "fixture-discovery",
    });
  });
});

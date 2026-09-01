/**
 * @jest-environment node
 */

import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  flushBenchmarkBackendLogs,
  installBenchmarkFetchHook,
  isBenchmarkFetchHookInstalled,
  uninstallBenchmarkFetchHook,
} from "@/lib/benchmark/install-fetch-hook";
import { resetBenchmarkRunContext } from "@/lib/benchmark/run-context";

describe("installBenchmarkFetchHook", () => {
  const originalFetch = global.fetch;
  const originalBenchmarkMode = process.env.BENCHMARK_MODE;
  const originalOutputDir = process.env.BENCHMARK_OUTPUT_DIR;
  const originalBackend = process.env.BACKEND_API_BASE;
  const originalFrontend = process.env.FRONTEND_ORIGIN;
  const originalContextFile = process.env.BENCHMARK_CONTEXT_FILE;

  afterEach(() => {
    uninstallBenchmarkFetchHook();
    global.fetch = originalFetch;
    process.env.BENCHMARK_MODE = originalBenchmarkMode;
    process.env.BENCHMARK_OUTPUT_DIR = originalOutputDir;
    process.env.BACKEND_API_BASE = originalBackend;
    process.env.FRONTEND_ORIGIN = originalFrontend;
    process.env.BENCHMARK_CONTEXT_FILE = originalContextFile;
    resetBenchmarkRunContext();
  });

  async function writeContext(outputDir: string, context: object) {
    const filePath = join(outputDir, "run-context.json");
    process.env.BENCHMARK_CONTEXT_FILE = filePath;
    await writeFile(filePath, JSON.stringify(context), "utf8");
  }

  it("BENCHMARK_MODE가 아니면 fetch를 감싸지 않는다", () => {
    process.env.BENCHMARK_MODE = "false";
    installBenchmarkFetchHook();
    expect(isBenchmarkFetchHookInstalled()).toBe(false);
    expect(global.fetch).toBe(originalFetch);
  });

  it("한 번의 fetch를 한 줄로 기록하고 response body를 소비하지 않는다", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "gak-benchmark-"));
    process.env.BENCHMARK_MODE = "true";
    process.env.BENCHMARK_OUTPUT_DIR = outputDir;
    process.env.BACKEND_API_BASE = "https://api.example.test/api/v1";
    process.env.FRONTEND_ORIGIN = "http://localhost:3000";
    await writeContext(outputDir, {
      scenario: "home-cold",
      run: 1,
      phase: "recorded",
      step: "home-initial",
    });

    const body = JSON.stringify({ isSuccess: true, result: { ok: true } });
    const fetchMock = jest.fn(async () => new Response(body, { status: 200 }));
    global.fetch = fetchMock as unknown as typeof fetch;

    installBenchmarkFetchHook();
    expect(isBenchmarkFetchHookInstalled()).toBe(true);

    const response = await fetch("https://api.example.test/api/v1/sessions/1");
    const clonedText = await response.text();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(clonedText).toBe(body);

    await flushBenchmarkBackendLogs();
    const lines = (await readFile(join(outputDir, "raw/backend-requests.jsonl"), "utf8"))
      .trim()
      .split("\n");
    expect(lines).toHaveLength(1);

    const event = JSON.parse(lines[0]) as {
      scenario: string;
      path: string;
      source: string;
      target: string;
      status: number;
      step: string;
      phase: string;
      run: number;
    };
    expect(event.scenario).toBe("home-cold");
    expect(event.run).toBe(1);
    expect(event.phase).toBe("recorded");
    expect(event.step).toBe("home-initial");
    expect(event.path).toBe("/sessions/1");
    expect(event.target).toBe("backend");
    expect(event.source).toBe("route-handler");
    expect(event.status).toBe(200);
  });

  it("프론트 /api self-call을 server-component로 분류한다", async () => {
    const outputDir = await mkdtemp(join(tmpdir(), "gak-benchmark-"));
    process.env.BENCHMARK_MODE = "true";
    process.env.BENCHMARK_OUTPUT_DIR = outputDir;
    process.env.BACKEND_API_BASE = "https://api.example.test/api/v1";
    process.env.FRONTEND_ORIGIN = "http://localhost:3000";
    await writeContext(outputDir, {
      scenario: "session-detail-cold",
      run: 2,
      phase: "recorded",
      step: "detail-first",
    });

    global.fetch = jest.fn(
      async () => new Response("{}", { status: 200 })
    ) as unknown as typeof fetch;
    installBenchmarkFetchHook();

    await fetch("http://localhost:3000/api/sessions/42");
    await flushBenchmarkBackendLogs();

    const event = JSON.parse(
      (await readFile(join(outputDir, "raw/backend-requests.jsonl"), "utf8")).trim()
    ) as { path: string; source: string; target: string; step: string };
    expect(event.path).toBe("/api/sessions/42");
    expect(event.target).toBe("self-api");
    expect(event.source).toBe("server-component");
    expect(event.step).toBe("detail-first");
  });
});

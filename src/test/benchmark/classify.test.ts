/**
 * @jest-environment node
 */

import path from "node:path";
import { pathToFileURL } from "node:url";

const classifyUrl = pathToFileURL(
  path.join(process.cwd(), "benchmarks/network-baseline/scripts/lib/classify.mjs")
).href;
const contextUrl = pathToFileURL(
  path.join(process.cwd(), "benchmarks/network-baseline/scripts/lib/context.mjs")
).href;
const aggregateUrl = pathToFileURL(
  path.join(process.cwd(), "benchmarks/network-baseline/scripts/lib/aggregate.mjs")
).href;
const environmentUrl = pathToFileURL(
  path.join(process.cwd(), "benchmarks/network-baseline/scripts/lib/environment.mjs")
).href;

describe("classifyRepeatedRequests", () => {
  it("does not treat the same path in detail-first and detail-revisit as a duplicate", async () => {
    const { classifyRepeatedRequests } = await import(classifyUrl);
    const classified = classifyRepeatedRequests([
      {
        scenario: "session-detail-warm",
        run: 1,
        phase: "recorded",
        step: "detail-first",
        method: "GET",
        path: "/api/sessions/1",
        startedAt: 1000,
      },
      {
        scenario: "session-detail-warm",
        run: 1,
        phase: "recorded",
        step: "detail-revisit",
        method: "GET",
        path: "/api/sessions/1",
        startedAt: 5000,
      },
    ]);

    expect(classified.duplicateCandidates).toEqual([]);
    expect(classified.retryCandidates).toEqual([]);
    expect(classified.expectedRepeated).toEqual([
      expect.objectContaining({
        key: "GET /api/sessions/1",
        steps: ["detail-first", "detail-revisit"],
        count: 2,
        runs: 1,
      }),
    ]);
  });

  it("marks the same path twice in the same step as a duplicate candidate", async () => {
    const { classifyRepeatedRequests } = await import(classifyUrl);
    const classified = classifyRepeatedRequests([
      {
        scenario: "session-detail-warm",
        run: 1,
        phase: "recorded",
        step: "detail-first",
        method: "GET",
        path: "/api/sessions/1",
        startedAt: 1000,
      },
      {
        scenario: "session-detail-warm",
        run: 1,
        phase: "recorded",
        step: "detail-first",
        method: "GET",
        path: "/api/sessions/1",
        startedAt: 1300,
      },
    ]);

    expect(classified.expectedRepeated).toEqual([]);
    expect(classified.duplicateCandidates).toEqual([
      expect.objectContaining({
        key: "GET /api/sessions/1",
        step: "detail-first",
        count: 2,
        runs: 1,
      }),
    ]);
    expect(classified.retryCandidates).toEqual([
      expect.objectContaining({
        key: "GET /api/sessions/1",
        step: "detail-first",
        gapMs: 300,
      }),
    ]);
  });

  it("does not mark same-step repeats outside the retry window as retry candidates", async () => {
    const { classifyRepeatedRequests } = await import(classifyUrl);
    const classified = classifyRepeatedRequests([
      {
        scenario: "home-cold",
        run: 1,
        phase: "recorded",
        step: "home-initial",
        method: "GET",
        path: "/api/sessions",
        startedAt: 1000,
      },
      {
        scenario: "home-cold",
        run: 1,
        phase: "recorded",
        step: "home-initial",
        method: "GET",
        path: "/api/sessions",
        startedAt: 4000,
      },
    ]);

    expect(classified.duplicateCandidates).toHaveLength(1);
    expect(classified.retryCandidates).toEqual([]);
  });
});

describe("pairSelfHopEvents", () => {
  it("pairs nested self-api and backend fetches and computes overhead", async () => {
    const { pairSelfHopEvents, summarizeSelfHop } = await import(classifyUrl);
    const pairing = pairSelfHopEvents(
      [
        {
          scenario: "session-detail-cold",
          run: 1,
          step: "detail-first",
          method: "GET",
          path: "/api/sessions/678",
          startedAt: 1000,
          durationMs: 32.01,
        },
      ],
      [
        {
          scenario: "session-detail-cold",
          run: 1,
          step: "detail-first",
          method: "GET",
          path: "/sessions/678",
          startedAt: 1005,
          durationMs: 25.87,
        },
      ]
    );

    expect(pairing.pairingStatus).toBe("paired");
    expect(pairing.pairs[0]).toMatchObject({
      selfPath: "/api/sessions/678",
      backendPath: "/sessions/678",
      selfHopOverheadMs: 6.14,
    });
    expect(summarizeSelfHop(pairing).overheadMs.median).toBe(6.14);
  });

  it("does not invent a pair when matching is ambiguous", async () => {
    const { pairSelfHopEvents, summarizeSelfHop } = await import(classifyUrl);
    const pairing = pairSelfHopEvents(
      [
        {
          scenario: "session-detail-cold",
          run: 1,
          step: "detail-first",
          method: "GET",
          path: "/api/sessions/678",
          startedAt: 1000,
          durationMs: 40,
        },
      ],
      [
        {
          scenario: "session-detail-cold",
          run: 1,
          step: "detail-first",
          method: "GET",
          path: "/sessions/678",
          startedAt: 1002,
          durationMs: 10,
        },
        {
          scenario: "session-detail-cold",
          run: 1,
          step: "detail-first",
          method: "GET",
          path: "/sessions/678",
          startedAt: 1008,
          durationMs: 11,
        },
      ]
    );

    expect(pairing.pairs).toEqual([]);
    expect(summarizeSelfHop(pairing).pairingStatus).toBe("Unable to pair reliably");
  });
});

describe("resetRunContextFile", () => {
  it("replaces a stale recorded context with idle fixture-discovery", async () => {
    const { mkdtemp, readFile, writeFile } = await import("node:fs/promises");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const { resetRunContextFile, INITIAL_RUN_CONTEXT } = await import(contextUrl);

    const dir = await mkdtemp(join(tmpdir(), "gak-context-reset-"));
    const filePath = join(dir, ".run-context.json");
    await writeFile(
      filePath,
      JSON.stringify({
        scenario: "session-detail-warm",
        run: 1,
        phase: "recorded",
        step: "detail-first",
      }),
      "utf8"
    );

    const reset = resetRunContextFile(filePath);
    expect(reset).toEqual(INITIAL_RUN_CONTEXT);
    expect(JSON.parse(await readFile(filePath, "utf8"))).toEqual({
      scenario: "setup",
      run: 0,
      phase: "idle",
      step: "fixture-discovery",
    });
  });
});

describe("aggregation units", () => {
  it("reports query fetches per run instead of a recorded-run total in the median field", async () => {
    const { summarizeScenario } = await import(aggregateUrl);
    const result = summarizeScenario({
      scenario: "home-cold",
      browserEvents: [
        {
          scenario: "home-cold",
          run: 1,
          phase: "recorded",
          step: "home-initial",
          isApi: true,
          method: "GET",
          path: "/api/sessions",
          resourceType: "fetch",
          ttfbMs: 10,
        },
        {
          scenario: "home-cold",
          run: 2,
          phase: "recorded",
          step: "home-initial",
          isApi: true,
          method: "GET",
          path: "/api/sessions",
          resourceType: "fetch",
          ttfbMs: 12,
        },
      ],
      backendEvents: [
        {
          scenario: "home-cold",
          run: 1,
          phase: "recorded",
          step: "home-initial",
          target: "backend",
          method: "GET",
          path: "/sessions",
          durationMs: 20,
          source: "route-handler",
        },
        {
          scenario: "home-cold",
          run: 2,
          phase: "recorded",
          step: "home-initial",
          target: "backend",
          method: "GET",
          path: "/sessions",
          durationMs: 30,
          source: "route-handler",
        },
      ],
      tanstackEvents: [
        {
          scenario: "home-cold",
          run: 1,
          phase: "recorded",
          step: "home-initial",
          kind: "query-fetch",
        },
        {
          scenario: "home-cold",
          run: 1,
          phase: "recorded",
          step: "home-initial",
          kind: "query-fetch",
        },
        {
          scenario: "home-cold",
          run: 2,
          phase: "recorded",
          step: "home-initial",
          kind: "query-fetch",
        },
      ],
    });

    expect(result.tanstack.queryFetchTotal).toBe(3);
    expect(result.tanstack.queryFetchPerRun.median).toBe(1.5);
    expect(result.tanstack.queryFetchPerRun.max).toBe(2);
    expect(result.backendDurationMs.median).toBe(25);
    expect(result.backendDurationMs.count).toBe(2);
  });

  it("excludes idle fixture-discovery events from recorded stats", async () => {
    const { summarizeScenario } = await import(aggregateUrl);
    const result = summarizeScenario({
      scenario: "session-detail-warm",
      browserEvents: [],
      backendEvents: [
        {
          scenario: "setup",
          run: 0,
          phase: "idle",
          step: "fixture-discovery",
          target: "backend",
          method: "GET",
          path: "/sessions?page=1&size=20",
          durationMs: 80,
          source: "route-handler",
        },
        {
          scenario: "session-detail-warm",
          run: 1,
          phase: "recorded",
          step: "home-initial",
          target: "backend",
          method: "GET",
          path: "/sessions?sort=POPULAR&page=1&size=8",
          durationMs: 20,
          source: "route-handler",
        },
      ],
      tanstackEvents: [],
    });

    expect(result.backendRequestCount.median).toBe(1);
    expect(result.backendRequestCount.count).toBe(1);
  });

  it("keeps session-result unmeasured when it has no recorded events", async () => {
    const { summarizeScenario } = await import(aggregateUrl);
    const result = summarizeScenario({
      scenario: "session-result",
      browserEvents: [
        {
          scenario: "ssr-public-session-detail-fallback",
          run: 1,
          phase: "recorded",
          step: "ssr-document",
          isApi: false,
          method: "GET",
          path: "/session/678",
          resourceType: "document",
          ttfbMs: 9,
        },
      ],
      backendEvents: [
        {
          scenario: "ssr-public-session-detail-fallback",
          run: 1,
          phase: "recorded",
          step: "ssr-document",
          target: "self-api",
          method: "GET",
          path: "/api/sessions/678",
          durationMs: 30,
          source: "server-component",
        },
      ],
      tanstackEvents: [],
    });

    expect(result.measured).toBe(false);
    expect(result.browserApiRequestCount.count).toBe(0);
  });
});

describe("environment provenance and sanitization", () => {
  const originalToken = process.env.BENCHMARK_ACCESS_TOKEN;
  const originalRefresh = process.env.BENCHMARK_REFRESH_TOKEN;
  const originalLabel = process.env.BENCHMARK_BACKEND_LABEL;

  afterEach(() => {
    if (originalToken === undefined) delete process.env.BENCHMARK_ACCESS_TOKEN;
    else process.env.BENCHMARK_ACCESS_TOKEN = originalToken;
    if (originalRefresh === undefined) delete process.env.BENCHMARK_REFRESH_TOKEN;
    else process.env.BENCHMARK_REFRESH_TOKEN = originalRefresh;
    if (originalLabel === undefined) delete process.env.BENCHMARK_BACKEND_LABEL;
    else process.env.BENCHMARK_BACKEND_LABEL = originalLabel;
  });

  it("records provenance fields and never stores token values", async () => {
    const sentinel = "SECRETVALUE_DO_NOT_LEAK_9f3a";
    process.env.BENCHMARK_ACCESS_TOKEN = sentinel;
    process.env.BENCHMARK_REFRESH_TOKEN = `${sentinel}-refresh`;
    process.env.BENCHMARK_BACKEND_LABEL = "staging";
    const { collectEnvironment } = await import(environmentUrl);

    const environment = collectEnvironment({
      origin: "http://localhost:3010",
      browserVersion: "test",
      recordedRuns: 20,
      warmupRuns: 2,
      startedAt: "2026-09-01T00:00:00.000Z",
      git: {
        appBaseSha: "aaa",
        benchmarkHarnessSha: "bbb",
        resultCommitSha: null,
        branch: "benchmark/network-baseline-20260901",
        workingTreeDirtyAtRunStart: false,
      },
      backendEnvironmentLabel: "staging",
    });

    expect(environment.git).toEqual({
      appBaseSha: "aaa",
      benchmarkHarnessSha: "bbb",
      resultCommitSha: null,
      branch: "benchmark/network-baseline-20260901",
      workingTreeDirtyAtRunStart: false,
    });
    expect(environment.backendEnvironmentLabel).toBe("staging");
    expect(environment.envVarNames).toEqual(expect.arrayContaining(["BENCHMARK_ACCESS_TOKEN"]));
    const serialized = JSON.stringify(environment);
    expect(serialized).not.toContain(sentinel);
    expect(serialized).not.toContain("Authorization: Bearer");
    expect(serialized).not.toContain("accessToken=");
  });

  it("uses unknown when BENCHMARK_BACKEND_LABEL is absent", async () => {
    delete process.env.BENCHMARK_BACKEND_LABEL;
    const { backendEnvironmentLabelFromEnv } = await import(environmentUrl);
    expect(backendEnvironmentLabelFromEnv()).toBe("unknown");
  });
});

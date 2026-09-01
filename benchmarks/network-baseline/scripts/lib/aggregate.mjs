import path from "node:path";

import {
  classifyRepeatedRequests,
  durationStats,
  pairSelfHopEvents,
  summarizeSelfHop,
} from "./classify.mjs";
import { readJsonl, toCsvRow, writeJson, writeText } from "./io.mjs";
import { countBy, summarizeNumbers } from "./stats.mjs";

const THIRD_PARTY_HOST_MARKERS = [
  "googletagmanager.com",
  "google-analytics.com",
  "googletagmanager",
  "doubleclick.net",
  "google.com/ccm",
];

export const SCENARIO_IDS = [
  "home-cold",
  "session-detail-cold",
  "session-detail-warm",
  "session-result",
  "ssr-public-session-detail-fallback",
  "profile",
  "simple-mutation",
  "interactive-mutation",
];

export const WARM_STEPS = [
  "home-initial",
  "detail-first",
  "terms",
  "home-return",
  "detail-revisit",
];

export function isApiPath(pathname) {
  return typeof pathname === "string" && pathname.startsWith("/api/");
}

export function isSessionListPath(pathname) {
  if (!pathname) return false;
  return /^\/api\/sessions(?:\?|$)/.test(pathname);
}

export function isSessionDetailApiPath(pathname, sessionId) {
  if (!pathname || !sessionId) return false;
  return new RegExp(`^/api/sessions/${sessionId}(?:\\?|$)`).test(pathname);
}

export function isBackendSessionListPath(pathname) {
  return typeof pathname === "string" && /^\/sessions(?:\?|$)/.test(pathname);
}

export function isBackendSessionDetailPath(pathname, sessionId) {
  if (!pathname || !sessionId) return false;
  return new RegExp(`^/sessions/${sessionId}(?:\\?|$)`).test(pathname);
}

export function isThirdPartyPath(pathname, extra = "") {
  const haystack = `${pathname} ${extra}`.toLowerCase();
  return THIRD_PARTY_HOST_MARKERS.some((marker) => haystack.includes(marker));
}

function groupByRun(events) {
  const grouped = new Map();
  for (const event of events) {
    if (event.phase !== "recorded") continue;
    const key = `${event.scenario}::${event.run}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(event);
  }
  return grouped;
}

export function recordedEvents(events, scenario) {
  return events.filter((event) => event.scenario === scenario && event.phase === "recorded");
}

function recordedRunsFor(events, scenario) {
  return [
    ...new Set(
      recordedEvents(events, scenario)
        .map((event) => event.run)
        .filter((run) => typeof run === "number")
    ),
  ].sort((a, b) => a - b);
}

function runValues(events, scenario, metricFn, runs = null) {
  const grouped = groupByRun(recordedEvents(events, scenario));
  const runIds = runs ?? [...grouped.keys()].map((key) => Number(key.split("::")[1]));
  const uniqueRuns = [...new Set(runIds)].sort((a, b) => a - b);
  const byRun = uniqueRuns.map((run) => {
    const runEvents = grouped.get(`${scenario}::${run}`) ?? [];
    return { run, value: metricFn(runEvents) };
  });
  const values = byRun.map((item) => item.value);
  return { values, byRun, distribution: countBy(values) };
}

function documentTtfb(runEvents) {
  const documentRequest = runEvents.find(
    (event) => event.resourceType === "document" && event.method === "GET"
  );
  return typeof documentRequest?.ttfbMs === "number" ? documentRequest.ttfbMs : null;
}

function tanstackKind(event, kind) {
  if (kind === "query-fetch") return event.kind === "query-fetch";
  if (kind === "invalidate") {
    return event.kind === "invalidateQueries" || event.kind === "query-invalidate";
  }
  if (kind === "setQueryData") return event.kind === "setQueryData";
  if (kind === "mutation")
    return typeof event.kind === "string" && event.kind.startsWith("mutation-");
  return false;
}

function summarizeStep(events, scenario, step, metricFn, runs) {
  const filtered = recordedEvents(events, scenario).filter((event) => event.step === step);
  const grouped = groupByRun(filtered);
  const runIds =
    runs ?? [...grouped.keys()].map((key) => Number(key.split("::")[1])).sort((a, b) => a - b);
  const values = runIds.map((run) => {
    const runEvents = grouped.get(`${scenario}::${run}`) ?? [];
    return metricFn(runEvents);
  });
  return {
    ...summarizeNumbers(values),
    paths: countBy(filtered.map((event) => `${event.method} ${event.path}`)),
  };
}

export function summarizeWarmSteps({
  browserEvents,
  backendEvents,
  tanstackEvents,
  sessionId,
} = {}) {
  const analysis = {};
  const runs = recordedRunsFor(browserEvents, "session-detail-warm");
  for (const step of WARM_STEPS) {
    const browserApi = recordedEvents(browserEvents, "session-detail-warm").filter(
      (event) => event.step === step && event.isApi
    );
    const backend = recordedEvents(backendEvents, "session-detail-warm").filter(
      (event) => event.step === step && event.target === "backend"
    );
    const selfApi = recordedEvents(backendEvents, "session-detail-warm").filter(
      (event) => event.step === step && event.target === "self-api"
    );
    const queryFetches = recordedEvents(tanstackEvents, "session-detail-warm").filter(
      (event) => event.step === step && event.kind === "query-fetch"
    );

    analysis[step] = {
      browserApiRequestCount: summarizeStep(
        browserEvents,
        "session-detail-warm",
        step,
        (events) => events.filter((event) => event.isApi).length,
        runs
      ),
      backendRequestCount: summarizeStep(
        backendEvents,
        "session-detail-warm",
        step,
        (events) => events.filter((event) => event.target === "backend").length,
        runs
      ),
      selfApiRequestCount: summarizeStep(
        backendEvents,
        "session-detail-warm",
        step,
        (events) => events.filter((event) => event.target === "self-api").length,
        runs
      ),
      queryFetchPerRun: summarizeStep(
        tanstackEvents,
        "session-detail-warm",
        step,
        (events) => events.filter((event) => event.kind === "query-fetch").length,
        runs
      ),
      sessionListBrowserApi: browserApi.filter((event) => isSessionListPath(event.path)).length,
      sessionDetailBrowserApi: browserApi.filter((event) =>
        isSessionDetailApiPath(event.path, sessionId)
      ).length,
      sessionListBackend: backend.filter((event) => isBackendSessionListPath(event.path)).length,
      sessionDetailBackend: backend.filter((event) =>
        isBackendSessionDetailPath(event.path, sessionId)
      ).length,
      selfApiCount: selfApi.length,
      queryFetchTotal: queryFetches.length,
      browserApiPaths: countBy(browserApi.map((event) => `${event.method} ${event.path}`)),
      backendPaths: countBy(backend.map((event) => `${event.method} ${event.path}`)),
      queryHashes: [...new Set(queryFetches.map((event) => event.queryHash).filter(Boolean))],
    };
  }

  const homeReturn = analysis["home-return"];
  const detailRevisit = analysis["detail-revisit"];
  analysis.answers = {
    homeReturnSessionListRefetch:
      (homeReturn?.sessionListBrowserApi ?? 0) > 0 || (homeReturn?.sessionListBackend ?? 0) > 0,
    detailRevisitDetailRefetch:
      (detailRevisit?.sessionDetailBrowserApi ?? 0) > 0 ||
      (detailRevisit?.sessionDetailBackend ?? 0) > 0,
    detailRevisitClassification:
      (detailRevisit?.sessionDetailBrowserApi ?? 0) > 0 ||
      (detailRevisit?.sessionDetailBackend ?? 0) > 0
        ? "expected repeated request across steps, not a same-step duplicate"
        : "no detail refetch observed on revisit",
  };
  return analysis;
}

export function summarizeScenario({
  scenario,
  browserEvents,
  backendEvents,
  tanstackEvents,
  extra = {},
}) {
  const browser = recordedEvents(browserEvents, scenario);
  const backend = recordedEvents(backendEvents, scenario);
  const tanstack = recordedEvents(tanstackEvents, scenario);
  const apiBrowser = browser.filter((event) => event.isApi);
  const backendOnly = backend.filter((event) => event.target === "backend");
  const selfApi = backend.filter((event) => event.target === "self-api");
  const measured = browser.length > 0 || backend.length > 0 || tanstack.length > 0;
  const runs = [
    ...new Set([
      ...recordedRunsFor(browserEvents, scenario),
      ...recordedRunsFor(backendEvents, scenario),
      ...recordedRunsFor(tanstackEvents, scenario),
    ]),
  ].sort((a, b) => a - b);

  const browserApiCounts = runValues(
    browserEvents,
    scenario,
    (events) => events.filter((event) => event.isApi).length,
    runs
  );
  const backendCounts = runValues(
    backendEvents,
    scenario,
    (events) => events.filter((event) => event.target === "backend").length,
    runs
  );
  const selfApiCounts = runValues(
    backendEvents,
    scenario,
    (events) => events.filter((event) => event.target === "self-api").length,
    runs
  );
  const ttfbs = runValues(browserEvents, scenario, documentTtfb, runs);

  const queryFetchPerRun = runValues(
    tanstackEvents,
    scenario,
    (events) => events.filter((event) => tanstackKind(event, "query-fetch")).length,
    runs
  );
  const invalidatePerRun = runValues(
    tanstackEvents,
    scenario,
    (events) => events.filter((event) => tanstackKind(event, "invalidate")).length,
    runs
  );
  const setQueryDataPerRun = runValues(
    tanstackEvents,
    scenario,
    (events) => events.filter((event) => tanstackKind(event, "setQueryData")).length,
    runs
  );
  const mutationPerRun = runValues(
    tanstackEvents,
    scenario,
    (events) => events.filter((event) => tanstackKind(event, "mutation")).length,
    runs
  );

  const queryFetches = tanstack.filter((event) => tanstackKind(event, "query-fetch"));
  const invalidates = tanstack.filter((event) => tanstackKind(event, "invalidate"));
  const setQueryData = tanstack.filter((event) => tanstackKind(event, "setQueryData"));
  const mutations = tanstack.filter((event) => tanstackKind(event, "mutation"));

  const repeatedBrowser = classifyRepeatedRequests(apiBrowser);
  const repeatedBackend = classifyRepeatedRequests(backendOnly);
  const pairing = pairSelfHopEvents(selfApi, backendOnly);
  const selfHop = summarizeSelfHop(pairing);

  return {
    scenario,
    measured,
    runs,
    documentTtfbMs: summarizeNumbers(ttfbs.values.filter((value) => value !== null)),
    documentTtfbByRun: ttfbs.byRun,
    browserRequestCount: summarizeNumbers(
      runValues(browserEvents, scenario, (events) => events.length, runs).values
    ),
    browserApiRequestCount: summarizeNumbers(browserApiCounts.values),
    browserApiRequestCountByRun: browserApiCounts.byRun,
    browserApiRequestDistribution: browserApiCounts.distribution,
    backendRequestCount: summarizeNumbers(backendCounts.values),
    backendRequestCountByRun: backendCounts.byRun,
    backendRequestDistribution: backendCounts.distribution,
    selfApiRequestCount: summarizeNumbers(selfApiCounts.values),
    selfApiRequestCountByRun: selfApiCounts.byRun,
    backendDurationMs: durationStats(backendOnly),
    selfApiDurationMs: durationStats(selfApi),
    backendSources: countBy(backendOnly.map((event) => event.source)),
    selfApiSources: countBy(selfApi.map((event) => event.source)),
    sourceClassification: "heuristic",
    expectedRepeatedBrowserApi: repeatedBrowser.expectedRepeated,
    expectedRepeatedBackend: repeatedBackend.expectedRepeated,
    duplicateBrowserApi: repeatedBrowser.duplicateCandidates,
    duplicateBackend: repeatedBackend.duplicateCandidates,
    retryCandidateBrowserApi: repeatedBrowser.retryCandidates,
    retryCandidateBackend: repeatedBackend.retryCandidates,
    tanstack: {
      queryFetchPerRun: summarizeNumbers(queryFetchPerRun.values),
      queryFetchTotal: queryFetches.length,
      invalidatePerRun: summarizeNumbers(invalidatePerRun.values),
      invalidateTotal: invalidates.length,
      setQueryDataPerRun: summarizeNumbers(setQueryDataPerRun.values),
      setQueryDataTotal: setQueryData.length,
      mutationEventPerRun: summarizeNumbers(mutationPerRun.values),
      mutationEventTotal: mutations.length,
      queryFetchCount: queryFetches.length,
      invalidateCount: invalidates.length,
      setQueryDataCount: setQueryData.length,
      mutationEventCount: mutations.length,
      queryKeysFetched: [...new Set(queryFetches.map((event) => event.queryHash).filter(Boolean))],
      invalidateQueryKeys: [
        ...new Set(
          invalidates
            .map((event) => JSON.stringify(event.queryKey ?? event.queryHash ?? null))
            .filter((value) => value && value !== "null")
        ),
      ],
    },
    selfHop,
    extra,
  };
}

export function loadRaw(outputDir) {
  return {
    browserEvents: readJsonl(path.join(outputDir, "raw/browser-requests.jsonl")),
    backendEvents: readJsonl(path.join(outputDir, "raw/backend-requests.jsonl")),
    tanstackEvents: readJsonl(path.join(outputDir, "raw/tanstack-events.jsonl")),
  };
}

export function buildSummary({ outputDir, fixtures, blockers, environment }) {
  const { browserEvents, backendEvents, tanstackEvents } = loadRaw(outputDir);
  const results = {};
  for (const scenario of SCENARIO_IDS) {
    results[scenario] = summarizeScenario({
      scenario,
      browserEvents,
      backendEvents,
      tanstackEvents,
      extra: {
        fixture: fixtures?.[scenario] ?? null,
        blocker: blockers.find((item) => item.scenario === scenario) ?? null,
      },
    });
  }

  results["session-detail-warm"].warmSteps = summarizeWarmSteps({
    browserEvents,
    backendEvents,
    tanstackEvents,
    sessionId: fixtures?.sessionId,
  });

  const summary = {
    generatedAt: new Date().toISOString(),
    git: environment?.git ?? null,
    gitSha: environment?.git?.benchmarkHarnessSha ?? environment?.git?.sha ?? null,
    backendEnvironmentLabel: environment?.backendEnvironmentLabel ?? "unknown",
    fixtures: fixtures ?? {},
    blockers,
    scenarios: results,
  };

  const csvLines = [
    toCsvRow([
      "scenario",
      "metric",
      "count",
      "min",
      "median",
      "p75",
      "p95",
      "max",
      "mean",
      "distribution",
    ]),
  ];

  for (const [scenario, result] of Object.entries(results)) {
    const rows = [
      ["documentTtfbMs", result.documentTtfbMs, ""],
      [
        "browserApiRequestCount",
        result.browserApiRequestCount,
        JSON.stringify(result.browserApiRequestDistribution),
      ],
      [
        "backendRequestCount",
        result.backendRequestCount,
        JSON.stringify(result.backendRequestDistribution),
      ],
      ["selfApiRequestCount", result.selfApiRequestCount, ""],
      ["backendDurationMs", result.backendDurationMs, ""],
      ["selfApiDurationMs", result.selfApiDurationMs, ""],
      [
        "queryFetchPerRun",
        result.tanstack.queryFetchPerRun,
        JSON.stringify(result.tanstack.queryFetchPerRun),
      ],
    ];
    for (const [metric, stats, distribution] of rows) {
      csvLines.push(
        toCsvRow([
          scenario,
          metric,
          stats.count,
          stats.min,
          stats.median,
          stats.p75,
          stats.p95,
          stats.max,
          stats.mean,
          distribution,
        ])
      );
    }
  }

  return { summary, results, csv: `${csvLines.join("\n")}\n` };
}

export function writeAggregates({ outputDir, fixtures, blockers, environment }) {
  const { summary, results, csv } = buildSummary({ outputDir, fixtures, blockers, environment });
  writeJson(path.join(outputDir, "summary.json"), summary);
  writeText(path.join(outputDir, "summary.csv"), csv);
  for (const [scenario, result] of Object.entries(results)) {
    writeJson(path.join(outputDir, "results", `${scenario}.json`), result);
  }
  return summary;
}

import path from "node:path";

import { readJsonl, toCsvRow, writeJson, writeText } from "./io.mjs";
import { countBy, summarizeNumbers } from "./stats.mjs";

const THIRD_PARTY_HOST_MARKERS = [
  "googletagmanager.com",
  "google-analytics.com",
  "googletagmanager",
  "doubleclick.net",
  "google.com/ccm",
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

function duplicateKeys(events, keyFn) {
  const counts = {};
  for (const event of events) {
    const key = keyFn(event);
    if (!key) continue;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([key, count]) => ({ key, count }));
}

function summarizeDuplicateRuns(items) {
  const grouped = new Map();
  for (const item of items) {
    const current = grouped.get(item.key) ?? { key: item.key, countPerRun: item.count, runs: 0 };
    current.runs += 1;
    grouped.set(item.key, current);
  }
  return [...grouped.values()];
}

function recordedEvents(events, scenario) {
  return events.filter((event) => event.scenario === scenario && event.phase === "recorded");
}

function runValues(events, scenario, metricFn) {
  const grouped = groupByRun(recordedEvents(events, scenario));
  const values = [];
  const byRun = [];
  for (const [key, runEvents] of grouped) {
    const run = Number(key.split("::")[1]);
    const value = metricFn(runEvents);
    values.push(value);
    byRun.push({ run, value });
  }
  byRun.sort((a, b) => a.run - b.run);
  return { values, byRun, distribution: countBy(values) };
}

function documentTtfb(runEvents) {
  const documentRequest = runEvents.find(
    (event) => event.resourceType === "document" && event.method === "GET"
  );
  return typeof documentRequest?.ttfbMs === "number" ? documentRequest.ttfbMs : null;
}

function summarizeScenario({ scenario, browserEvents, backendEvents, tanstackEvents, extra = {} }) {
  const browser = recordedEvents(browserEvents, scenario);
  const backend = recordedEvents(backendEvents, scenario);
  const tanstack = recordedEvents(tanstackEvents, scenario);
  const apiBrowser = browser.filter((event) => event.isApi);
  const backendOnly = backend.filter((event) => event.target === "backend");
  const selfApi = backend.filter((event) => event.target === "self-api");

  const browserApiCounts = runValues(
    browserEvents,
    scenario,
    (events) => events.filter((event) => event.isApi).length
  );
  const backendCounts = runValues(
    backendEvents,
    scenario,
    (events) => events.filter((event) => event.target === "backend").length
  );
  const selfApiCounts = runValues(
    backendEvents,
    scenario,
    (events) => events.filter((event) => event.target === "self-api").length
  );
  const ttfbs = runValues(browserEvents, scenario, documentTtfb);

  const queryFetches = tanstack.filter((event) => event.kind === "query-fetch");
  const invalidates = tanstack.filter(
    (event) => event.kind === "invalidateQueries" || event.kind === "query-invalidate"
  );
  const setQueryData = tanstack.filter((event) => event.kind === "setQueryData");
  const mutations = tanstack.filter((event) => event.kind.startsWith("mutation-"));

  return {
    scenario,
    runs: browserApiCounts.byRun.map((item) => item.run),
    documentTtfbMs: summarizeNumbers(ttfbs.values.filter((value) => value !== null)),
    documentTtfbByRun: ttfbs.byRun,
    browserRequestCount: summarizeNumbers(
      runValues(browserEvents, scenario, (events) => events.length).values
    ),
    browserApiRequestCount: summarizeNumbers(browserApiCounts.values),
    browserApiRequestCountByRun: browserApiCounts.byRun,
    browserApiRequestDistribution: browserApiCounts.distribution,
    backendRequestCount: summarizeNumbers(backendCounts.values),
    backendRequestCountByRun: backendCounts.byRun,
    backendRequestDistribution: backendCounts.distribution,
    selfApiRequestCount: summarizeNumbers(selfApiCounts.values),
    selfApiRequestCountByRun: selfApiCounts.byRun,
    backendSources: countBy(backendOnly.map((event) => event.source)),
    selfApiSources: countBy(selfApi.map((event) => event.source)),
    duplicateBrowserApi: summarizeDuplicateRuns(
      [...groupByRun(apiBrowser).values()].flatMap((runEvents) =>
        duplicateKeys(runEvents, (event) => `${event.method} ${event.path}`)
      )
    ),
    duplicateBackend: summarizeDuplicateRuns(
      [...groupByRun(backendOnly).values()].flatMap((runEvents) =>
        duplicateKeys(runEvents, (event) => `${event.method} ${event.path}`)
      )
    ),
    tanstack: {
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
    retryLikeBackend: backend.filter((event, index, all) => {
      if (event.target !== "backend") return false;
      return all.some(
        (other, otherIndex) =>
          otherIndex !== index &&
          other.target === "backend" &&
          other.method === event.method &&
          other.path === event.path &&
          other.run === event.run &&
          Math.abs(other.startedAt - event.startedAt) < 1500
      );
    }).length,
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
  const scenarioIds = [
    "home-cold",
    "session-detail-cold",
    "session-detail-warm",
    "session-result",
    "profile",
    "simple-mutation",
    "interactive-mutation",
  ];

  const results = {};
  for (const scenario of scenarioIds) {
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

  const summary = {
    generatedAt: new Date().toISOString(),
    gitSha: environment?.git?.sha ?? null,
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

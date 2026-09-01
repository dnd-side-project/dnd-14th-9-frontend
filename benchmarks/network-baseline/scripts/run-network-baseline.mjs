#!/usr/bin/env node
/**
 * Production-build network/cache baseline runner.
 *
 * Usage:
 *   BENCHMARK_MODE=true NEXT_PUBLIC_BENCHMARK_MODE=true pnpm benchmark:network-baseline
 *
 * Options:
 *   --skip-build          Use the existing .next production build
 *   --runs <n>            Recorded run count (default 10)
 *   --warmup <n>          Warmup run count (default 2)
 *   --port <n>            Listen port (default 3010)
 *   --har                 Write unsanitized HAR files under private/ (gitignored)
 *   --allow-dirty         Allow a dirty working tree (final baseline must be clean)
 */

import { spawn } from "node:child_process";
import { existsSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";

import { chromium } from "playwright";

import { writeAggregates } from "./lib/aggregate.mjs";
import { INITIAL_RUN_CONTEXT, resetRunContextFile } from "./lib/context.mjs";
import {
  backendEnvironmentLabelFromEnv,
  collectEnvironment,
  collectGitProvenance,
  isWorkingTreeDirty,
} from "./lib/environment.mjs";
import { appendJsonl, ensureDir, writeAtomicJson, writeJson, writeText } from "./lib/io.mjs";
import { writeReport } from "./lib/report.mjs";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "benchmarks/network-baseline");
const PRIVATE_DIR = path.join(OUTPUT_DIR, "private");
const CONTEXT_FILE = path.join(OUTPUT_DIR, ".run-context.json");
const AUTH_UNAVAILABLE = "Not measured due to unavailable safe authenticated benchmark fixture";

const argv = process.argv.slice(2).filter((value) => value !== "--");
const args = new Set(argv);
function argValue(name, fallback) {
  const index = argv.indexOf(name);
  if (index === -1) return fallback;
  return argv[index + 1] ?? fallback;
}

const SKIP_BUILD = args.has("--skip-build");
const WRITE_HAR = args.has("--har");
const ALLOW_DIRTY = args.has("--allow-dirty");
const WARMUP_RUNS = Number(argValue("--warmup", process.env.BENCHMARK_WARMUP_RUNS ?? 2));
const RECORDED_RUNS = Number(argValue("--runs", process.env.BENCHMARK_RECORDED_RUNS ?? 10));
const PORT = Number(argValue("--port", process.env.BENCHMARK_PORT ?? 3010));
const HOST = "127.0.0.1";
const ORIGIN = `http://localhost:${PORT}`;

const blockers = [];
const notes = [];
const fixtures = {};

class BenchmarkFatalError extends Error {
  constructor(message) {
    super(message);
    this.name = "BenchmarkFatalError";
    this.fatal = true;
  }
}

function hasEnv(name) {
  const value = process.env[name];
  return typeof value === "string" && value.length > 0;
}

function runCommand(command, commandArgs, env = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: ROOT,
      env: { ...process.env, ...env },
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${commandArgs.join(" ")} exited ${code}`));
    });
  });
}

function waitForHttp(url, timeoutMs = 120_000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode < 500) {
          resolve();
          return;
        }
        retry();
      });
      request.on("error", retry);
      request.setTimeout(3000, () => {
        request.destroy();
        retry();
      });
    };
    const retry = () => {
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }
      setTimeout(attempt, 500);
    };
    attempt();
  });
}

function sanitizeBrowserPath(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const params = new URLSearchParams(url.search);
    for (const key of [...params.keys()]) {
      if (/token|secret|email|auth|cookie|code|state/i.test(key)) {
        params.set(key, "[redacted]");
      }
    }
    const search = params.toString();
    return search ? `${url.pathname}?${search}` : url.pathname;
  } catch {
    return "/unknown";
  }
}

function isApiUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.pathname.startsWith("/api/");
  } catch {
    return false;
  }
}

function isOwnOrigin(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.origin === ORIGIN || url.hostname === "localhost" || url.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

function attachNetworkCollector(page, meta) {
  const events = [];
  const stepByRequest = new WeakMap();

  page.on("request", (request) => {
    stepByRequest.set(request, meta.step);
  });

  const onFinished = async (request) => {
    try {
      const rawUrl = request.url();
      if (rawUrl.startsWith("data:") || rawUrl.startsWith("blob:")) return;
      const timing = request.timing();
      const response = await request.response();
      let encodedDataLength = null;
      try {
        const sizes = await request.sizes();
        encodedDataLength = sizes?.responseBodySize ?? null;
      } catch {
        encodedDataLength = null;
      }
      const ttfbMs =
        timing.responseStart >= 0 && timing.requestStart >= 0
          ? Math.round((timing.responseStart - timing.requestStart) * 100) / 100
          : timing.responseStart >= 0
            ? Math.round(timing.responseStart * 100) / 100
            : null;
      const durationMs =
        timing.responseEnd >= 0 ? Math.round(timing.responseEnd * 100) / 100 : null;
      events.push({
        scenario: meta.scenario,
        run: meta.run,
        phase: meta.phase,
        step: stepByRequest.get(request) ?? meta.step,
        method: request.method(),
        path: sanitizeBrowserPath(rawUrl),
        resourceType: request.resourceType(),
        status: response ? response.status() : null,
        requestStart: timing.requestStart,
        responseStart: timing.responseStart,
        responseEnd: timing.responseEnd,
        ttfbMs,
        durationMs,
        encodedDataLength,
        isApi: isApiUrl(rawUrl),
        thirdParty: !isOwnOrigin(rawUrl),
        startedAt: Date.now(),
      });
    } catch {
      // A failed/aborted request must not crash the runner.
    }
  };

  page.on("requestfinished", (request) => {
    void onFinished(request);
  });
  page.on("requestfailed", (request) => {
    void onFinished(request);
  });

  return events;
}

function writeContext(context) {
  writeAtomicJson(CONTEXT_FILE, context);
}

function authCookies() {
  const access = process.env.BENCHMARK_ACCESS_TOKEN;
  const refresh = process.env.BENCHMARK_REFRESH_TOKEN;
  if (!access && !refresh) return null;
  const cookies = [];
  if (access) {
    cookies.push({
      name: "accessToken",
      value: access,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });
  }
  if (refresh) {
    cookies.push({
      name: "refreshToken",
      value: refresh,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });
  }
  return cookies;
}

async function jsonGet(url) {
  const response = await fetch(url);
  const payload = await response.json().catch(() => null);
  return { status: response.status, payload };
}

async function discoverSessionId() {
  if (hasEnv("BENCHMARK_SESSION_ID")) {
    return {
      sessionId: String(process.env.BENCHMARK_SESSION_ID),
      status: "env",
      source: "BENCHMARK_SESSION_ID",
    };
  }
  const { status, payload } = await jsonGet(`${ORIGIN}/api/sessions?page=1&size=20`);
  const sessions = payload?.result?.sessions ?? [];
  const inProgress = sessions.find((session) => session.status === "IN_PROGRESS");
  const waiting = sessions.find((session) => session.status === "WAITING");
  const completed = sessions.find((session) => session.status === "COMPLETED");
  const picked = inProgress ?? waiting ?? sessions[0];
  if (!picked) {
    throw new Error(`No session fixture available (HTTP ${status})`);
  }
  return {
    sessionId: String(picked.sessionId),
    status: picked.status,
    source: "GET /api/sessions",
    completedSessionId: completed ? String(completed.sessionId) : null,
  };
}

async function waitForSelectorOrTimeout(page, selector, timeoutMs) {
  try {
    await page.waitForSelector(selector, { timeout: timeoutMs });
    return true;
  } catch {
    return false;
  }
}

async function gotoSettle(page, url, { waitSelector, waitMs = 1000 } = {}) {
  const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  if (waitSelector) {
    await waitForSelectorOrTimeout(page, waitSelector, 20_000);
  }
  await delay(waitMs);
  return {
    status: response?.status() ?? null,
    finalUrl: page.url(),
  };
}

async function collectTanstack(page) {
  try {
    return await page.evaluate(() => window.__GAK_BENCHMARK_EVENTS__ ?? []);
  } catch {
    return [];
  }
}

function persistRunArtifacts({ browserEvents, tanstackEvents }) {
  for (const event of browserEvents)
    appendJsonl(path.join(OUTPUT_DIR, "raw/browser-requests.jsonl"), event);
  for (const event of tanstackEvents) {
    appendJsonl(path.join(OUTPUT_DIR, "raw/tanstack-events.jsonl"), {
      ...event,
      queryKey: event.queryKey ?? undefined,
    });
  }
}

async function setPageStep(page, meta, step) {
  meta.step = step;
  const ctx = {
    scenario: meta.scenario,
    run: meta.run,
    phase: meta.phase,
    step,
  };
  writeContext(ctx);
  try {
    // Full document loads reset window state. Init scripts re-apply the current
    // step before page JS (including TanStack) runs.
    await page.addInitScript((nextCtx) => {
      window.__GAK_BENCHMARK_CONTEXT__ = nextCtx;
    }, ctx);
  } catch {
    // page might not accept init scripts yet
  }
  try {
    await page.evaluate((nextCtx) => {
      window.__GAK_BENCHMARK_CONTEXT__ = nextCtx;
    }, ctx);
  } catch {
    // about:blank or a detached page must not fail the scenario.
  }
}

async function withPage({ browser, scenario, run, phase, useAuth, initialStep }, fn) {
  const meta = {
    scenario,
    run,
    phase,
    step: initialStep ?? "start",
  };
  writeContext(meta);
  const contextOptions = {
    viewport: { width: 1280, height: 800 },
    locale: "ko-KR",
  };
  if (WRITE_HAR) {
    ensureDir(PRIVATE_DIR);
    contextOptions.recordHar = {
      path: path.join(PRIVATE_DIR, `${scenario}-run${run}-${phase}.har`),
      mode: "minimal",
    };
  }
  const context = await browser.newContext(contextOptions);
  const cookies = useAuth ? authCookies() : null;
  if (cookies) await context.addCookies(cookies);
  const page = await context.newPage();
  const browserEvents = attachNetworkCollector(page, meta);
  await setPageStep(page, meta, meta.step);
  const persist = async (result = {}) => {
    await delay(300);
    const tanstackEvents = (result?.tanstackEvents ?? (await collectTanstack(page))).map(
      (event) => ({
        scenario,
        run,
        phase,
        step: event.step ?? meta.step,
        ...event,
        scenario,
        run,
        phase,
      })
    );
    persistRunArtifacts({ browserEvents, tanstackEvents });
  };
  try {
    const result = await fn(page, {
      setStep: (step) => setPageStep(page, meta, step),
      meta,
    });
    await persist(result);
    return { ...result, finalUrl: page.url() };
  } catch (error) {
    await persist();
    throw error;
  } finally {
    await context.close();
    await delay(150);
  }
}

function alternateNickname(current) {
  const value = current || "측정";
  if (value.length >= 10) {
    const last = value.at(-1);
    return `${value.slice(0, -1)}${last === "z" ? "y" : "z"}`;
  }
  if (value.length < 2) return "측정자";
  return `${value}z`;
}

async function runHomeCold(page, { setStep }) {
  await setStep("home-initial");
  return gotoSettle(page, `${ORIGIN}/`, { waitSelector: 'a[href^="/session/"]', waitMs: 1200 });
}

async function runSessionDetailCold(page, sessionId, { setStep }) {
  await setStep("detail-first");
  return gotoSettle(page, `${ORIGIN}/session/${sessionId}`, {
    waitSelector: "main",
    waitMs: 1500,
  });
}

async function clickSessionFromHome(page, sessionId) {
  const card = page.locator(`a[href="/session/${sessionId}"]`).first();
  if ((await card.count()) > 0) {
    await card.click();
  } else {
    await page.goto(`${ORIGIN}/session/${sessionId}`, { waitUntil: "domcontentloaded" });
  }
  await delay(1200);
}

async function closeSessionDialogIfOpen(page) {
  const dialog = page.locator("dialog[open]");
  if ((await dialog.count()) === 0) return;
  const closeButton = page.locator('dialog[open] button[aria-label="닫기"]').first();
  if ((await closeButton.count()) > 0) {
    await closeButton.click();
    await delay(400);
    return;
  }
  await page.keyboard.press("Escape");
  await delay(400);
}

async function runSessionDetailWarm(page, sessionId, { setStep }) {
  await setStep("home-initial");
  await gotoSettle(page, `${ORIGIN}/`, { waitSelector: 'a[href^="/session/"]', waitMs: 800 });
  await setStep("detail-first");
  await clickSessionFromHome(page, sessionId);
  await closeSessionDialogIfOpen(page);

  await setStep("terms");
  const terms = page.locator('a[href="/terms"]').first();
  if ((await terms.count()) > 0) {
    await terms.click({ force: true });
    await delay(800);
  } else {
    await page.goto(`${ORIGIN}/terms`, { waitUntil: "domcontentloaded" });
    await delay(500);
  }

  await setStep("home-return");
  const home = page.locator('a[aria-label="홈으로 이동"]').first();
  if ((await home.count()) > 0) {
    await home.click();
    await delay(900);
  } else {
    await page.goto(`${ORIGIN}/`, { waitUntil: "domcontentloaded" });
    await delay(800);
  }

  await setStep("detail-revisit");
  await clickSessionFromHome(page, sessionId);
  await delay(400);
  return { finalUrl: page.url() };
}

async function runSsrHeavy(page, targetPath, { setStep }, stepName) {
  await setStep(stepName);
  return gotoSettle(page, `${ORIGIN}${targetPath}`, { waitSelector: "main", waitMs: 1500 });
}

async function runProfile(page, { setStep }) {
  await setStep("profile-settings");
  return gotoSettle(page, `${ORIGIN}/profile/settings`, {
    waitSelector: "form, main",
    waitMs: 1500,
  });
}

async function restoreNickname(page, nicknameInput, original) {
  await nicknameInput.fill(original);
  await page.getByRole("button", { name: "저장하기" }).click();
  await page.getByText("프로필 정보가 저장되었습니다.").waitFor({ timeout: 20_000 });
  const restoredValue = await nicknameInput.inputValue();
  return restoredValue === original;
}

async function runSimpleMutation(page, { setStep }) {
  await setStep("profile-read");
  await gotoSettle(page, `${ORIGIN}/profile/settings`, {
    waitSelector: 'input, [name="nickname"], main',
    waitMs: 1500,
  });
  const nicknameInput = page.getByLabel("닉네임");
  if ((await nicknameInput.count()) === 0) {
    throw new Error("Nickname input not found");
  }
  const original = await nicknameInput.inputValue();
  const nextValue = alternateNickname(original);
  await setStep("nickname-mutate");
  await nicknameInput.fill(nextValue);
  const started = Date.now();
  await page.getByRole("button", { name: "저장하기" }).click();
  await page.getByText("프로필 정보가 저장되었습니다.").waitFor({ timeout: 20_000 });
  const uiApplyMs = Date.now() - started;
  await delay(800);
  await setStep("nickname-restore");
  let restored = false;
  try {
    restored = await restoreNickname(page, nicknameInput, original);
    if (!restored) {
      restored = await restoreNickname(page, nicknameInput, original);
    }
  } catch (error) {
    throw new BenchmarkFatalError(
      `Profile nickname restore failed (${error instanceof Error ? error.message : String(error)}). Benchmark aborted.`
    );
  }
  if (!restored) {
    throw new BenchmarkFatalError(
      "Profile nickname restore failed. Benchmark aborted because restored is not true."
    );
  }
  await delay(500);
  return { uiApplyMs, restored: true };
}

async function runInteractiveMutation(page, sessionId, subtaskId, { setStep }) {
  await setStep("session-open");
  await gotoSettle(page, `${ORIGIN}/session/${sessionId}`, { waitSelector: "main", waitMs: 1500 });
  const checkbox = page.locator(`[data-subtask-id="${subtaskId}"], input[type="checkbox"]`).first();
  if ((await checkbox.count()) === 0) {
    throw new Error("Interactive subtask control not found");
  }
  await setStep("todo-toggle");
  await checkbox.click();
  await delay(2000);
  await setStep("todo-restore");
  await checkbox.click();
  await delay(1500);
  return { toggled: true, restored: true };
}

async function runScenarioSeries({ browser, scenario, useAuth, initialStep, fn }) {
  try {
    for (let run = 1; run <= WARMUP_RUNS; run += 1) {
      await withPage({ browser, scenario, run, phase: "warmup", useAuth, initialStep }, fn);
    }
    let lastResult = null;
    for (let run = 1; run <= RECORDED_RUNS; run += 1) {
      lastResult = await withPage(
        { browser, scenario, run, phase: "recorded", useAuth, initialStep },
        fn
      );
      process.stdout.write(`[benchmark] ${scenario} recorded ${run}/${RECORDED_RUNS}\n`);
    }
    return lastResult;
  } catch (error) {
    if (error instanceof BenchmarkFatalError || error?.fatal) {
      throw error;
    }
    blockers.push({
      scenario,
      reason: `Scenario aborted: ${error instanceof Error ? error.message : String(error)}`,
    });
    notes.push(`${scenario} failed mid-run. Completed runs remain in raw evidence.`);
    process.stderr.write(
      `[benchmark] ${scenario} failed: ${error instanceof Error ? error.message : error}\n`
    );
    return null;
  }
}

function resetOutputArtifacts() {
  const files = [
    "raw/browser-requests.jsonl",
    "raw/backend-requests.jsonl",
    "raw/tanstack-events.jsonl",
    "summary.json",
    "summary.csv",
    "REPORT.md",
    "blockers.json",
    "notes.json",
    "fixtures.json",
    "environment.json",
  ];
  for (const file of files) {
    rmSync(path.join(OUTPUT_DIR, file), { force: true });
  }
  const resultsDir = path.join(OUTPUT_DIR, "results");
  if (existsSync(resultsDir)) {
    for (const name of readdirSync(resultsDir)) {
      if (name.endsWith(".json")) rmSync(path.join(resultsDir, name), { force: true });
    }
  }
  ensureDir(path.join(OUTPUT_DIR, "raw"));
  ensureDir(path.join(OUTPUT_DIR, "results"));
  writeFileSync(path.join(OUTPUT_DIR, "raw/browser-requests.jsonl"), "");
  writeFileSync(path.join(OUTPUT_DIR, "raw/backend-requests.jsonl"), "");
  writeFileSync(path.join(OUTPUT_DIR, "raw/tanstack-events.jsonl"), "");
}

async function main() {
  const dirty = isWorkingTreeDirty();
  if (dirty && !ALLOW_DIRTY) {
    throw new Error(
      "Working tree is dirty. Final baseline must run from a clean harness commit. Use --allow-dirty only for harness development."
    );
  }
  if (dirty) {
    notes.push("Working tree was dirty at run start. This run is not a final baseline.");
  }

  resetOutputArtifacts();
  resetRunContextFile(CONTEXT_FILE);

  const startedAt = new Date().toISOString();
  const git = collectGitProvenance({
    workingTreeDirtyAtRunStart: dirty,
  });
  const backendEnvironmentLabel = backendEnvironmentLabelFromEnv();

  const buildEnv = {
    BENCHMARK_MODE: "true",
    NEXT_PUBLIC_BENCHMARK_MODE: "true",
    NEXT_PUBLIC_USE_MOCK: "false",
  };
  if (!SKIP_BUILD) {
    process.stdout.write("[benchmark] building production bundle with BENCHMARK_MODE\n");
    await runCommand("pnpm", ["build"], buildEnv);
  } else {
    notes.push("Used --skip-build; existing .next output was reused.");
  }

  const serverEnv = {
    ...buildEnv,
    PORT: String(PORT),
    HOSTNAME: HOST,
    FRONTEND_ORIGIN: ORIGIN,
    BENCHMARK_OUTPUT_DIR: OUTPUT_DIR,
    BENCHMARK_CONTEXT_FILE: CONTEXT_FILE,
  };

  process.stdout.write(`[benchmark] starting production server at ${ORIGIN}\n`);
  const server = spawn("pnpm", ["exec", "next", "start", "-H", HOST, "-p", String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, ...serverEnv },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverLog = "";
  let serverExited = null;
  server.stdout.on("data", (chunk) => {
    serverLog += chunk.toString();
  });
  server.stderr.on("data", (chunk) => {
    serverLog += chunk.toString();
  });
  server.on("exit", (code, signal) => {
    serverExited = { code, signal };
  });

  try {
    const ready = waitForHttp(`${ORIGIN}/`);
    const died = new Promise((_, reject) => {
      const timer = setInterval(() => {
        if (serverExited) {
          clearInterval(timer);
          reject(
            new Error(
              `next start exited before ready (code=${serverExited.code}, signal=${serverExited.signal})\n${serverLog}`
            )
          );
        }
      }, 200);
    });
    await Promise.race([ready, died]);
    writeContext(INITIAL_RUN_CONTEXT);
    const sessionFixture = await discoverSessionId();
    fixtures.sessionId = sessionFixture.sessionId;
    fixtures.sessionStatus = sessionFixture.status;
    fixtures.sessionSource = sessionFixture.source;
    fixtures.completedSessionId = sessionFixture.completedSessionId ?? null;
    writeJson(path.join(OUTPUT_DIR, "fixtures.json"), {
      sessionId: sessionFixture.sessionId,
      sessionStatus: sessionFixture.status,
      sessionSource: sessionFixture.source,
      completedSessionId: fixtures.completedSessionId,
    });

    const hasAuth = hasEnv("BENCHMARK_ACCESS_TOKEN") || hasEnv("BENCHMARK_REFRESH_TOKEN");
    const allowProfileMutation =
      hasAuth && process.env.BENCHMARK_ALLOW_PROFILE_MUTATION !== "false";
    const interactiveSessionId = hasEnv("BENCHMARK_INTERACTIVE_SESSION_ID")
      ? process.env.BENCHMARK_INTERACTIVE_SESSION_ID
      : null;
    const interactiveSubtaskId = hasEnv("BENCHMARK_INTERACTIVE_SUBTASK_ID")
      ? process.env.BENCHMARK_INTERACTIVE_SUBTASK_ID
      : null;

    if (sessionFixture.status === "WAITING") {
      notes.push(
        `Session fixture ${sessionFixture.sessionId} status is WAITING. Direct /session/:id access may redirect to /waiting then login for guests.`
      );
    }
    if (backendEnvironmentLabel === "unknown") {
      notes.push(
        "BENCHMARK_BACKEND_LABEL was not set. backendEnvironmentLabel is unknown. Compare later runs only when the label matches."
      );
    }

    const browser = await chromium.launch({ headless: true });
    const environment = collectEnvironment({
      origin: ORIGIN,
      browserVersion: browser.version(),
      recordedRuns: RECORDED_RUNS,
      warmupRuns: WARMUP_RUNS,
      startedAt,
      git,
      backendEnvironmentLabel,
    });
    writeJson(path.join(OUTPUT_DIR, "environment.json"), environment);

    try {
      await runScenarioSeries({
        browser,
        scenario: "home-cold",
        useAuth: false,
        initialStep: "home-initial",
        fn: (page, helpers) => runHomeCold(page, helpers),
      });

      await runScenarioSeries({
        browser,
        scenario: "session-detail-cold",
        useAuth: false,
        initialStep: "detail-first",
        fn: (page, helpers) => runSessionDetailCold(page, sessionFixture.sessionId, helpers),
      });

      await runScenarioSeries({
        browser,
        scenario: "session-detail-warm",
        useAuth: false,
        initialStep: "home-initial",
        fn: (page, helpers) => runSessionDetailWarm(page, sessionFixture.sessionId, helpers),
      });

      let measuredSessionResult = false;
      if (hasAuth && sessionFixture.completedSessionId) {
        const result = await runScenarioSeries({
          browser,
          scenario: "session-result",
          useAuth: true,
          initialStep: "result-page",
          fn: (page, helpers) =>
            runSsrHeavy(
              page,
              `/session/${sessionFixture.completedSessionId}/result`,
              helpers,
              "result-page"
            ),
        });
        const landedOnResult =
          typeof result?.finalUrl === "string" && result.finalUrl.includes("/result");
        if (landedOnResult) {
          measuredSessionResult = true;
          fixtures.sessionResultPage = `/session/${sessionFixture.completedSessionId}/result`;
        } else {
          blockers.push({
            scenario: "session-result",
            reason: AUTH_UNAVAILABLE,
          });
          notes.push(
            "session-result did not stay on /session/:id/result. This scenario is not used as a baseline."
          );
        }
      } else {
        blockers.push({
          scenario: "session-result",
          reason: AUTH_UNAVAILABLE,
        });
        notes.push(
          "session-result was not measured. Public session detail is recorded separately as ssr-public-session-detail-fallback."
        );
      }

      if (!measuredSessionResult) {
        fixtures.ssrPublicSessionDetailPath = `/session/${sessionFixture.sessionId}`;
        await runScenarioSeries({
          browser,
          scenario: "ssr-public-session-detail-fallback",
          useAuth: false,
          initialStep: "ssr-document",
          fn: (page, helpers) =>
            runSsrHeavy(page, `/session/${sessionFixture.sessionId}`, helpers, "ssr-document"),
        });
      }

      if (!hasAuth) {
        blockers.push({
          scenario: "profile",
          reason: `${AUTH_UNAVAILABLE} Missing BENCHMARK_ACCESS_TOKEN / BENCHMARK_REFRESH_TOKEN.`,
        });
        notes.push("profile skipped: authenticated profile page requires cookie fixture.");
      } else {
        await runScenarioSeries({
          browser,
          scenario: "profile",
          useAuth: true,
          initialStep: "profile-settings",
          fn: (page, helpers) => runProfile(page, helpers),
        });
      }

      if (!allowProfileMutation) {
        blockers.push({
          scenario: "simple-mutation",
          reason: hasAuth
            ? "Profile mutation skipped because BENCHMARK_ALLOW_PROFILE_MUTATION=false."
            : `${AUTH_UNAVAILABLE} Mutation was not forced against real user data.`,
        });
      } else {
        const mutationResult = await runScenarioSeries({
          browser,
          scenario: "simple-mutation",
          useAuth: true,
          initialStep: "profile-read",
          fn: (page, helpers) => runSimpleMutation(page, helpers),
        });
        fixtures.simpleMutation = {
          restored: mutationResult?.restored === true,
          uiApplyMs: mutationResult?.uiApplyMs ?? null,
        };
        if (mutationResult?.restored !== true) {
          throw new BenchmarkFatalError(
            "simple-mutation completed without restored: true. Benchmark aborted."
          );
        }
      }

      if (!hasAuth || !interactiveSessionId || !interactiveSubtaskId) {
        blockers.push({
          scenario: "interactive-mutation",
          reason: `${AUTH_UNAVAILABLE} Requires BENCHMARK_INTERACTIVE_SESSION_ID and BENCHMARK_INTERACTIVE_SUBTASK_ID.`,
        });
      } else {
        await runScenarioSeries({
          browser,
          scenario: "interactive-mutation",
          useAuth: true,
          initialStep: "session-open",
          fn: (page, helpers) =>
            runInteractiveMutation(page, interactiveSessionId, interactiveSubtaskId, helpers),
        });
      }
    } finally {
      await browser.close();
    }

    writeContext({ scenario: "idle", run: 0, phase: "idle", step: "idle" });
    await delay(300);
    writeJson(path.join(OUTPUT_DIR, "blockers.json"), blockers);
    writeJson(path.join(OUTPUT_DIR, "notes.json"), notes);
    writeJson(path.join(OUTPUT_DIR, "fixtures.json"), fixtures);

    const summary = writeAggregates({
      outputDir: OUTPUT_DIR,
      fixtures,
      blockers,
      environment,
    });
    writeReport({
      outputDir: OUTPUT_DIR,
      summary,
      environment,
      fixtures,
      blockers,
      notes,
    });
    process.stdout.write("[benchmark] wrote REPORT.md, summary.json, summary.csv, raw jsonl\n");
  } finally {
    if (!server.killed) {
      server.kill("SIGTERM");
      await delay(500);
      if (!server.killed) server.kill("SIGKILL");
    }
    writeText(path.join(PRIVATE_DIR, "server.log"), serverLog);
  }
}

main().catch((error) => {
  console.error("[benchmark] failed", error);
  process.exitCode = 1;
});

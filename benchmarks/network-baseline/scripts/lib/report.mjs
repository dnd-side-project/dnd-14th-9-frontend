import path from "node:path";

import { writeText } from "./io.mjs";

function fmt(value) {
  if (value === null || value === undefined) return "Not measured";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(value);
  return String(value);
}

function medianCell(result, stats, field = "median") {
  if (!result?.measured) return "Not measured";
  if (!stats) return "Not measured";
  if (stats[field] === null || stats[field] === undefined) {
    return stats.count === 0 ? "0" : "Not measured";
  }
  return fmt(stats[field]);
}

function durationCell(result, stats, field = "median") {
  if (!result?.measured) return "Not measured";
  if (!stats || stats.count === 0) return "Not measured";
  return fmt(stats[field]);
}

function distributionText(distribution) {
  if (!distribution || Object.keys(distribution).length === 0) return "Not measured";
  return Object.entries(distribution)
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([value, count]) => `${value}×${count}`)
    .join(", ");
}

function byRunText(byRun) {
  if (!byRun?.length) return "Not measured";
  return byRun.map((item) => item.value).join(", ");
}

function jsonOrNone(value) {
  if (!value || (Array.isArray(value) && value.length === 0)) return "none";
  return JSON.stringify(value);
}

function gitSha(environment, field) {
  return environment?.git?.[field] ?? "unknown";
}

export function renderReport({ summary, environment, fixtures, blockers, notes }) {
  const scenarios = summary.scenarios;
  const lines = [];
  const push = (value = "") => lines.push(value);
  const label = environment.backendEnvironmentLabel ?? "unknown";

  push("# Network / Cache Baseline Report");
  push();
  push("이 보고서는 raw evidence와 집계 스크립트에서 재현 가능한 숫자만 포함한다.");
  push("측정하지 못한 값은 `Not measured` 또는 blocker 이유로 적는다.");
  push();
  push("## Environment");
  push();
  push(`- App base SHA: \`${gitSha(environment, "appBaseSha")}\``);
  push(`- Benchmark harness SHA: \`${gitSha(environment, "benchmarkHarnessSha")}\``);
  push(`- Result commit SHA: \`${environment.git?.resultCommitSha ?? "null"}\``);
  push(`- Branch: \`${environment.git?.branch ?? "unknown"}\``);
  push(`- Working tree dirty at run start: \`${environment.git?.workingTreeDirtyAtRunStart}\``);
  push(`- Node.js: ${environment.runtime.node}`);
  push(`- pnpm: ${environment.runtime.pnpm}`);
  push(`- Next.js: ${environment.runtime.next}`);
  push(`- React: ${environment.runtime.react}`);
  push(`- Playwright: ${environment.runtime.playwright}`);
  push(`- Chromium: ${environment.runtime.chromium}`);
  push(`- OS: ${environment.machine.os} (${environment.machine.arch})`);
  push(`- CPU: ${environment.machine.cpu}`);
  push(`- Memory bytes: ${environment.machine.memoryBytes}`);
  push(`- Started at: ${environment.execution.startedAt}`);
  push(`- Frontend mode: ${environment.execution.frontendMode}`);
  push(`- Origin: ${environment.execution.origin}`);
  push(`- Warmup runs: ${environment.execution.warmupRuns}`);
  push(`- Recorded runs: ${environment.execution.recordedRuns}`);
  push(`- Backend environment label: \`${label}\``);
  push(`- Env var names: ${environment.envVarNames.join(", ")}`);
  push();
  push("## Methodology");
  push();
  push(
    "- `pnpm build` 후 `pnpm start` production server에서 측정했다. `next dev`는 사용하지 않았다."
  );
  push("- `BENCHMARK_MODE=true` / `NEXT_PUBLIC_BENCHMARK_MODE=true` 빌드에서만 계측이 활성화된다.");
  push("- Browser → Next 요청은 Playwright request timing으로 수집했다.");
  push(
    "- Next → Backend / Next self `/api/*` 요청은 서버 `fetch` hook이 JSONL로 기록했다. response body는 읽지 않는다."
  );
  push(
    "- TanStack Query 이벤트는 QueryClient cache subscribe와 `invalidateQueries`/`setQueryData` wrapper로 window 버퍼에 남기고, Playwright가 페이지에서 꺼냈다. 이 경로는 추가 HTTP 요청을 만들지 않는다."
  );
  push(
    "- 성능 시나리오는 warmup 후 recorded run만 통계에 넣는다. 통계는 count/min/median/p75/p95/max/mean이다."
  );
  push("- 요청 횟수처럼 deterministic해야 하는 값은 run별 분포도 적는다.");
  push("- 기본 비교 표의 Query Fetch는 recorded run 합계가 아니라 **per-run median**이다.");
  push(
    "- Cookie, Authorization, token, email, request/response body는 저장하지 않았다. URL은 path 위주다."
  );
  push("- HAR 원본이 있다면 `private/`에만 두고 GitHub에는 커밋하지 않는다.");
  push(
    "- `source is a heuristic classification, not a call-stack trace`. `target=backend → source=route-handler`는 URL/target/Accept 기반 추정이며, 실제 Route Handler 호출을 의미하지 않을 수 있다."
  );
  push(
    "- `target=self-api`는 서버가 frontend origin의 `/api/*`를 호출했다는 비교적 강한 evidence다."
  );
  push(
    "- Document TTFB는 문서 첫 바이트 시각이다. Next.js streaming 때문에 backend/self-api fetch 완료보다 작을 수 있다. `Document TTFB = complete page data ready time`으로 해석하지 않는다."
  );
  push();
  push("## Scenarios");
  push();
  push("### 1. home-cold");
  push("새 BrowserContext에서 `/`에 최초 접근한다. viewport는 1280×800이다. step: `home-initial`.");
  push();
  push("### 2. session-detail-cold");
  push(
    `새 BrowserContext에서 \`/session/${fixtures.sessionId ?? "<fixture>"}\`에 직접 접근한다. fixture source: ${fixtures.sessionSource ?? "unknown"}. step: \`detail-first\`.`
  );
  push();
  push("### 3. session-detail-warm");
  push(
    "같은 BrowserContext에서 홈 → 세션 카드 클릭 → `/terms` → 홈 → 같은 세션 카드 재클릭한다. steps: `home-initial`, `detail-first`, `terms`, `home-return`, `detail-revisit`."
  );
  push();
  push("### 4. session-result");
  push(
    scenarios["session-result"]?.measured
      ? `\`/session/${fixtures.sessionId ?? ":id"}/result\`를 측정했다.`
      : "`/session/:id/result`는 측정하지 못했다. 대체 페이지 숫자를 이 시나리오 값으로 쓰지 않는다."
  );
  push();
  push("### 4b. ssr-public-session-detail-fallback");
  push(
    scenarios["ssr-public-session-detail-fallback"]?.measured
      ? `공개 세션 상세 \`${fixtures.ssrPublicSessionDetailPath ?? `/session/${fixtures.sessionId ?? ":id"}`}\`를 별도 시나리오로 측정했다. 이 값은 session-result baseline이 아니다.`
      : "측정하지 않았다."
  );
  push();
  push("### 5. profile");
  push(
    "인증된 상태에서 `/profile/settings` 또는 `/profile/report`에 진입한다. 안전한 인증 fixture가 없으면 수행하지 않는다."
  );
  push();
  push("### 6. simple-mutation");
  push(
    "프로필 닉네임/저장 mutation을 수행한 뒤 원래 값으로 복구한다. 안전한 인증 fixture가 없으면 수행하지 않는다. 복구 실패 시 벤치마크 전체를 실패로 처리한다."
  );
  push();
  push("### 7. interactive-mutation");
  push(
    "Todo 완료 토글처럼 SSE와 결합된 mutation은 `BENCHMARK_INTERACTIVE_SESSION_ID`와 `BENCHMARK_INTERACTIVE_SUBTASK_ID`가 있을 때만 수행한다."
  );
  push();
  push("## Results");
  push();
  push(
    "| Scenario | Browser API / run | Backend / run | Self API / run | Query Fetch / run | Document TTFB | Backend Duration | Self API Duration |"
  );
  push("|---|---:|---:|---:|---:|---:|---:|---:|");
  for (const [id, result] of Object.entries(scenarios)) {
    push(
      `| ${id} | ${medianCell(result, result.browserApiRequestCount)} | ${medianCell(result, result.backendRequestCount)} | ${medianCell(result, result.selfApiRequestCount)} | ${medianCell(result, result.tanstack.queryFetchPerRun)} | ${durationCell(result, result.documentTtfbMs)} | ${durationCell(result, result.backendDurationMs)} | ${durationCell(result, result.selfApiDurationMs)} |`
    );
  }
  push();
  push("값은 recorded run의 median이다. Query Fetch는 전체 합계가 아니라 per-run median이다.");
  push();
  push("### p95");
  push();
  push(
    "| Scenario | Browser API / run p95 | Backend / run p95 | Query Fetch / run p95 | Document TTFB p95 | Backend Duration p95 | Self API Duration p95 |"
  );
  push("|---|---:|---:|---:|---:|---:|---:|");
  for (const [id, result] of Object.entries(scenarios)) {
    push(
      `| ${id} | ${medianCell(result, result.browserApiRequestCount, "p95")} | ${medianCell(result, result.backendRequestCount, "p95")} | ${medianCell(result, result.tanstack.queryFetchPerRun, "p95")} | ${durationCell(result, result.documentTtfbMs, "p95")} | ${durationCell(result, result.backendDurationMs, "p95")} | ${durationCell(result, result.selfApiDurationMs, "p95")} |`
    );
  }
  push();
  push("### Request count distributions");
  push();
  for (const [id, result] of Object.entries(scenarios)) {
    if (!result.measured) {
      push(`- **${id}**: Not measured`);
      continue;
    }
    push(
      `- **${id}** backend counts: \`${byRunText(result.backendRequestCountByRun)}\` (distribution ${distributionText(result.backendRequestDistribution)})`
    );
    push(
      `- **${id}** browser API counts: \`${byRunText(result.browserApiRequestCountByRun)}\` (distribution ${distributionText(result.browserApiRequestDistribution)})`
    );
  }
  push();
  push("## Self-hop Analysis");
  push();
  push(
    "self-hop overhead는 `selfApiDurationMs - backendDurationMs`이다. 브라우저 Document TTFB와 다른 값이며 혼동하지 않는다."
  );
  push(
    "pair는 같은 scenario/run/step/method와 path 대응(`/api/X` → `/X`), 시간 중첩이 한 건일 때만 계산한다."
  );
  push();
  for (const [id, result] of Object.entries(scenarios)) {
    if (!result.measured) {
      push(`### ${id}`);
      push("- Not measured");
      push();
      continue;
    }
    const hop = result.selfHop;
    push(`### ${id}`);
    push(`- pairing status: ${hop?.pairingStatus ?? "Unable to pair reliably"}`);
    if (!hop || hop.pairingStatus === "no-self-api") {
      push("- self-api 요청이 없어 self-hop overhead를 계산하지 않았다.");
    } else if (hop.pairingStatus === "Unable to pair reliably") {
      push("- Unable to pair reliably");
    } else {
      push(`- pair count: ${hop.count}`);
      push(`- self-hop overhead median: ${fmt(hop.overheadMs?.median)} ms`);
      push(`- self-hop overhead p95: ${fmt(hop.overheadMs?.p95)} ms`);
      push(
        `- self-hop overhead min/max: ${fmt(hop.overheadMs?.min)} / ${fmt(hop.overheadMs?.max)} ms`
      );
      push(`- unmatched self-api: ${hop.unmatchedSelfCount ?? 0}`);
    }
    push();
  }
  push("## Warm Cache Analysis");
  push();
  const warm = scenarios["session-detail-warm"];
  if (!warm?.measured || !warm.warmSteps) {
    push("session-detail-warm was not measured.");
  } else {
    push(
      "| Step | Browser API / run | Backend / run | Query Fetch / run | Session list requests | Session detail requests |"
    );
    push("|---|---:|---:|---:|---:|---:|");
    for (const step of ["home-initial", "detail-first", "terms", "home-return", "detail-revisit"]) {
      const row = warm.warmSteps[step];
      if (!row) {
        push(
          `| ${step} | Not measured | Not measured | Not measured | Not measured | Not measured |`
        );
        continue;
      }
      push(
        `| ${step} | ${fmt(row.browserApiRequestCount?.median ?? 0)} | ${fmt(row.backendRequestCount?.median ?? 0)} | ${fmt(row.queryFetchPerRun?.median ?? 0)} | ${row.sessionListBrowserApi + row.sessionListBackend} | ${row.sessionDetailBrowserApi + row.sessionDetailBackend} |`
      );
    }
    push();
    const answers = warm.warmSteps.answers ?? {};
    push(
      `- home return에서 session list refetch가 발생했는가? **${answers.homeReturnSessionListRefetch ? "yes" : "no"}**`
    );
    push(
      `- detail revisit에서 detail refetch가 발생했는가? **${answers.detailRevisitDetailRefetch ? "yes" : "no"}**`
    );
    push(`- 분류: ${answers.detailRevisitClassification ?? "n/a"}`);
    push();
    push(
      "같은 run에서 `detail-first`와 `detail-revisit`의 `GET /api/sessions/:id` 반복은 expected repeated request다. 같은 step 안에서만 duplicate candidate로 본다."
    );
  }
  push();
  push("## Mutation Cache Analysis");
  push();
  const simple = scenarios["simple-mutation"];
  const interactive = scenarios["interactive-mutation"];
  if (!simple?.measured && !interactive?.measured) {
    push("Not measured due to unavailable safe authenticated benchmark fixture");
  } else {
    for (const [id, result] of [
      ["simple-mutation", simple],
      ["interactive-mutation", interactive],
    ]) {
      push(`### ${id}`);
      if (!result?.measured) {
        push("- Not measured due to unavailable safe authenticated benchmark fixture");
        push();
        continue;
      }
      push(
        `- mutation events / run median: ${medianCell(result, result.tanstack.mutationEventPerRun)}`
      );
      push(`- backend requests / run median: ${medianCell(result, result.backendRequestCount)}`);
      push(`- invalidate / run median: ${medianCell(result, result.tanstack.invalidatePerRun)}`);
      push(
        `- setQueryData / run median: ${medianCell(result, result.tanstack.setQueryDataPerRun)}`
      );
      push(`- query fetch / run median: ${medianCell(result, result.tanstack.queryFetchPerRun)}`);
      push(`- invalidate query keys: ${result.tanstack.invalidateQueryKeys.join(", ") || "none"}`);
      push(`- restored: ${fixtures.simpleMutation?.restored ?? fixtures[id]?.restored ?? "n/a"}`);
      push();
    }
  }
  push("## Network Flow Findings");
  push();
  push("아래는 raw JSONL에서 확인된 source/target 분류다. 코드 추정으로 요청 수를 바꾸지 않았다.");
  push("`source is a heuristic classification, not a call-stack trace`.");
  push();
  for (const [id, result] of Object.entries(scenarios)) {
    push(`### ${id}`);
    if (!result.measured) {
      push("- Not measured");
      if (result.extra?.blocker) push(`- Blocker: ${result.extra.blocker.reason}`);
      push();
      continue;
    }
    push(`- Backend sources: ${JSON.stringify(result.backendSources)}`);
    push(`- Self-API sources: ${JSON.stringify(result.selfApiSources)}`);
    push(`- Self-API median count: ${medianCell(result, result.selfApiRequestCount)}`);
    if (result.extra?.blocker) {
      push(`- Blocker: ${result.extra.blocker.reason}`);
    }
    push();
  }
  push(
    "Server Component self-call 판정: `target=self-api` 이면서 path가 `/api/*`인 서버 fetch를 사용했다."
  );
  push(
    "`target=backend` 이면서 같은 step에 `/sessions/:id`가 있으면 `Browser/SC → Next /api → Backend` 흐름 후보로 본다. source=route-handler는 heuristic이다."
  );
  push();
  push("## TanStack Cache Findings");
  push();
  for (const [id, result] of Object.entries(scenarios)) {
    push(`### ${id}`);
    if (!result.measured) {
      push("- Not measured");
      push();
      continue;
    }
    push(`- query-fetch / run median: ${medianCell(result, result.tanstack.queryFetchPerRun)}`);
    push(`- query-fetch total: ${result.tanstack.queryFetchTotal}`);
    push(`- invalidate / run median: ${medianCell(result, result.tanstack.invalidatePerRun)}`);
    push(`- setQueryData / run median: ${medianCell(result, result.tanstack.setQueryDataPerRun)}`);
    push(
      `- mutation events / run median: ${medianCell(result, result.tanstack.mutationEventPerRun)}`
    );
    push(`- fetched query hashes: ${result.tanstack.queryKeysFetched.join(", ") || "none"}`);
    push(`- invalidate query keys: ${result.tanstack.invalidateQueryKeys.join(", ") || "none"}`);
    push();
  }
  push("## Duplicate Requests");
  push();
  push(
    "duplicate candidate는 같은 scenario/run/step/method/path 반복이다. 다른 step의 같은 path는 expected repeated request다. 후보일 뿐 retry/bug로 확정하지 않는다."
  );
  push();
  for (const [id, result] of Object.entries(scenarios)) {
    push(`### ${id}`);
    if (!result.measured) {
      push("- Not measured");
      push();
      continue;
    }
    push(`- Expected repeated browser API: ${jsonOrNone(result.expectedRepeatedBrowserApi)}`);
    push(`- Expected repeated backend: ${jsonOrNone(result.expectedRepeatedBackend)}`);
    push(`- Duplicate candidate browser API: ${jsonOrNone(result.duplicateBrowserApi)}`);
    push(`- Duplicate candidate backend: ${jsonOrNone(result.duplicateBackend)}`);
    push();
  }
  push("## Retry Observations");
  push();
  push(
    "코드상 `executeFetch` 기본 retry는 최대 3회, Query 기본 retry는 1회다. 이 섹션은 같은 run·같은 step·같은 method/path가 1500ms 이내에 반복된 기록만 retry candidate로 적는다. 확정된 retry가 아니다."
  );
  push();
  for (const [id, result] of Object.entries(scenarios)) {
    if (!result.measured) {
      push(`- **${id}**: Not measured`);
      continue;
    }
    push(
      `- **${id}**: retry candidate backend = ${jsonOrNone(result.retryCandidateBackend)}; browser API = ${jsonOrNone(result.retryCandidateBrowserApi)}`
    );
  }
  push();
  push("## Timing interpretation");
  push();
  push("- document TTFB: 문서 응답 첫 바이트. 페이지 데이터 준비 완료 시간이 아니다.");
  push("- backend fetch duration: 서버에서 backend origin fetch가 headers를 받기까지.");
  push("- self API fetch duration: 서버에서 frontend origin `/api/*` fetch가 headers를 받기까지.");
  push(
    "- UI/data ready time: 이번 baseline에서는 신뢰 가능한 공통 마커가 없어 기본 표에 넣지 않았다."
  );
  push();
  push("## Limitations");
  push();
  for (const note of notes ?? []) {
    push(`- ${note}`);
  }
  if (blockers.length === 0) {
    push("- 이번 실행에서 scenario blocker는 없었다.");
  } else {
    for (const blocker of blockers) {
      push(`- ${blocker.scenario}: ${blocker.reason}`);
    }
  }
  if (label === "unknown") {
    push(
      "- `BENCHMARK_BACKEND_LABEL`이 없어 backend environment label이 `unknown`이다. 이후 Before/After 비교는 같은 label끼리만 해야 한다."
    );
  }
  push(
    "- 서버 fetch hook의 `durationMs`는 response headers 수신까지다. SSE 스트림 전체 수명은 포함하지 않는다."
  );
  push(
    "- source 분류는 URL/Accept 기반 heuristic이다. sitemap 등 route handler가 아닌 서버 fetch도 `route-handler`로 붙을 수 있다."
  );
  push(
    "- Playwright `page.goto`는 full document load다. warm 시나리오만 가능한 범위에서 client navigation(Link click)을 사용했다."
  );
  push(
    "- Google Analytics가 빌드 환경에 있으면 third-party 요청이 섞일 수 있다. API 집계는 `/api/*`만 사용한다."
  );
  push();
  push("## Baseline Conclusions");
  push();
  push("현재 구조에 대한 관찰만 적는다. 리팩터링은 이 작업에서 수행하지 않았다.");
  push();
  const home = scenarios["home-cold"];
  const detail = scenarios["session-detail-cold"];
  const warmResult = scenarios["session-detail-warm"];
  const resultPage = scenarios["session-result"];
  push(`- Home cold median document TTFB: ${durationCell(home, home.documentTtfbMs)} ms`);
  push(
    `- Home cold median browser API requests / run: ${medianCell(home, home.browserApiRequestCount)}`
  );
  push(`- Home cold median backend requests / run: ${medianCell(home, home.backendRequestCount)}`);
  push(
    `- Session detail cold median backend requests / run: ${medianCell(detail, detail.backendRequestCount)}`
  );
  push(
    `- Session detail cold median self-API requests / run: ${medianCell(detail, detail.selfApiRequestCount)}`
  );
  push(
    `- Session detail warm median browser API requests / run: ${medianCell(warmResult, warmResult.browserApiRequestCount)}`
  );
  push(
    `- session-result: ${resultPage?.measured ? medianCell(resultPage, resultPage.backendRequestCount) : "Not measured"}`
  );
  push(
    "- 이후 mutation retry, self-call 제거, Server Action, Next Cache, TanStack 전략 변경은 이 숫자를 Before로 비교한다. 같은 backend environment label끼리만 비교한다."
  );
  push();
  return `${lines.join("\n")}\n`;
}

export function writeReport(args) {
  const markdown = renderReport(args);
  writeText(path.join(args.outputDir, "REPORT.md"), markdown);
  return markdown;
}

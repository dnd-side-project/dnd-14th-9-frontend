import path from "node:path";

import { writeText } from "./io.mjs";

function fmt(value) {
  if (value === null || value === undefined) return "Not measured";
  if (typeof value === "number") return Number.isInteger(value) ? String(value) : String(value);
  return String(value);
}

function statsCell(stats, field) {
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

export function renderReport({ summary, environment, fixtures, blockers, notes }) {
  const scenarios = summary.scenarios;
  const lines = [];
  const push = (value = "") => lines.push(value);

  push("# Network / Cache Baseline Report");
  push();
  push("이 보고서는 raw evidence와 집계 스크립트에서 재현 가능한 숫자만 포함한다.");
  push("측정하지 못한 값은 `Not measured` 또는 blocker 이유로 적는다.");
  push();
  push("## Environment");
  push();
  push(`- Git SHA: \`${environment.git.sha}\``);
  push(`- Branch: \`${environment.git.branch}\``);
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
  push(`- Backend environment: ${environment.execution.backendEnvironment}`);
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
  push(
    "- Cookie, Authorization, token, email, request/response body는 저장하지 않았다. URL은 path 위주다."
  );
  push("- HAR 원본이 있다면 `private/`에만 두고 GitHub에는 커밋하지 않는다.");
  push();
  push("## Scenarios");
  push();
  push("### 1. home-cold");
  push("새 BrowserContext에서 `/`에 최초 접근한다. viewport는 1280×800이다.");
  push();
  push("### 2. session-detail-cold");
  push(
    `새 BrowserContext에서 \`/session/${fixtures.sessionId ?? "<fixture>"}\`에 직접 접근한다. fixture source: ${fixtures.sessionSource ?? "unknown"}.`
  );
  push();
  push("### 3. session-detail-warm");
  push("같은 BrowserContext에서 홈 → 세션 카드 클릭 → `/terms` → 홈 → 같은 세션 카드 재클릭한다.");
  push();
  push("### 4. session-result");
  push(
    fixtures.sessionResultPage
      ? `SSR-heavy 페이지 \`${fixtures.sessionResultPage}\`를 사용했다.`
      : "인증 fixture가 없어 공개 세션 상세 페이지로 대체했거나 측정하지 못했다. Limitations를 본다."
  );
  push();
  push("### 5. profile");
  push(
    "인증된 상태에서 `/profile/settings` 또는 `/profile/report`에 진입한다. 인증 fixture가 없으면 수행하지 않는다."
  );
  push();
  push("### 6. simple-mutation");
  push(
    "프로필 닉네임/저장 mutation을 수행한 뒤 원래 값으로 복구한다. 안전한 인증 fixture가 없으면 수행하지 않는다."
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
    "| Scenario | Browser API Requests (median) | Backend Requests (median) | Median TTFB (ms) | p95 TTFB (ms) | Query fetches |"
  );
  push("|---|---:|---:|---:|---:|---:|");
  for (const [id, result] of Object.entries(scenarios)) {
    push(
      `| ${id} | ${statsCell(result.browserApiRequestCount, "median")} | ${statsCell(result.backendRequestCount, "median")} | ${statsCell(result.documentTtfbMs, "median")} | ${statsCell(result.documentTtfbMs, "p95")} | ${result.tanstack.queryFetchCount} |`
    );
  }
  push();
  push("### Request count distributions");
  push();
  for (const [id, result] of Object.entries(scenarios)) {
    push(
      `- **${id}** backend counts: \`${byRunText(result.backendRequestCountByRun)}\` (distribution ${distributionText(result.backendRequestDistribution)})`
    );
    push(
      `- **${id}** browser API counts: \`${byRunText(result.browserApiRequestCountByRun)}\` (distribution ${distributionText(result.browserApiRequestDistribution)})`
    );
  }
  push();
  push("## Network Flow Findings");
  push();
  push("아래는 raw JSONL에서 확인된 source/target 분류다. 코드 추정으로 요청 수를 바꾸지 않았다.");
  push();
  for (const [id, result] of Object.entries(scenarios)) {
    push(`### ${id}`);
    push(`- Backend sources: ${JSON.stringify(result.backendSources)}`);
    push(`- Self-API sources: ${JSON.stringify(result.selfApiSources)}`);
    push(`- Self-API median count: ${statsCell(result.selfApiRequestCount, "median")}`);
    if (result.extra?.blocker) {
      push(`- Blocker: ${result.extra.blocker.reason}`);
    }
    push();
  }
  push(
    "Server Component self-call 판정: `target=self-api` 이면서 path가 `/api/*`인 서버 fetch를 사용했다."
  );
  push(
    "`target=backend` 이면서 같은 시각대에 `/sessions/:id`가 있으면 `Browser/SC → Next Route Handler → Backend` 흐름으로 본다."
  );
  push();
  push("## TanStack Cache Findings");
  push();
  for (const [id, result] of Object.entries(scenarios)) {
    push(`### ${id}`);
    push(`- query-fetch events: ${result.tanstack.queryFetchCount}`);
    push(`- invalidate events: ${result.tanstack.invalidateCount}`);
    push(`- setQueryData events: ${result.tanstack.setQueryDataCount}`);
    push(`- mutation events: ${result.tanstack.mutationEventCount}`);
    push(`- fetched query hashes: ${result.tanstack.queryKeysFetched.join(", ") || "none"}`);
    push(`- invalidate query keys: ${result.tanstack.invalidateQueryKeys.join(", ") || "none"}`);
    push();
  }
  push("## Duplicate Requests");
  push();
  for (const [id, result] of Object.entries(scenarios)) {
    push(`### ${id}`);
    push(
      `- Browser API duplicates: ${result.duplicateBrowserApi.length ? JSON.stringify(result.duplicateBrowserApi) : "none in aggregated recorded events"}`
    );
    push(
      `- Backend duplicates: ${result.duplicateBackend.length ? JSON.stringify(result.duplicateBackend) : "none in aggregated recorded events"}`
    );
    push();
  }
  push("## Retry Observations");
  push();
  push(
    "코드상 `executeFetch` 기본 retry는 최대 3회, Query 기본 retry는 1회다. 이 섹션은 그 가능성이 아니라 이번 측정에서 같은 run·같은 method·path가 짧게 반복된 backend 기록만 적는다."
  );
  push();
  for (const [id, result] of Object.entries(scenarios)) {
    push(`- **${id}**: retry-like backend pairs = ${result.retryLikeBackend}`);
  }
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
  push(
    "- 서버 fetch hook의 `durationMs`는 response headers 수신까지다. SSE 스트림 전체 수명은 포함하지 않는다."
  );
  push(
    "- source 분류는 URL/Accept 기반이다. sitemap 등 route handler가 아닌 서버 fetch는 `route-handler`로 잘못 붙을 수 있다."
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
  const warm = scenarios["session-detail-warm"];
  push(`- Home cold median document TTFB: ${statsCell(home.documentTtfbMs, "median")} ms`);
  push(
    `- Home cold median browser API requests: ${statsCell(home.browserApiRequestCount, "median")}`
  );
  push(`- Home cold median backend requests: ${statsCell(home.backendRequestCount, "median")}`);
  push(
    `- Session detail cold median backend requests: ${statsCell(detail.backendRequestCount, "median")}`
  );
  push(
    `- Session detail cold median self-API requests: ${statsCell(detail.selfApiRequestCount, "median")}`
  );
  push(
    `- Session detail warm median browser API requests: ${statsCell(warm.browserApiRequestCount, "median")}`
  );
  push(
    "- 이후 mutation retry, self-call 제거, Server Action, Next Cache, TanStack 전략 변경은 이 숫자를 Before로 비교한다."
  );
  push();
  return `${lines.join("\n")}\n`;
}

export function writeReport(args) {
  const markdown = renderReport(args);
  writeText(path.join(args.outputDir, "REPORT.md"), markdown);
  return markdown;
}

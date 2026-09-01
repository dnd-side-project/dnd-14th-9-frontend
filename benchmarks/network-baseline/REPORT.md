# Network / Cache Baseline Report

이 보고서는 raw evidence와 집계 스크립트에서 재현 가능한 숫자만 포함한다.
측정하지 못한 값은 `Not measured` 또는 blocker 이유로 적는다.

## Environment

- Git SHA: `6c4daca3c0cd99928526a0774de8fa646875d6f1`
- Branch: `benchmark/network-baseline-20260901`
- Node.js: v22.21.1
- pnpm: 10.27.0
- Next.js: 16.1.4
- React: 19.2.3
- Playwright: 1.58.2
- Chromium: 145.0.7632.6
- OS: darwin 27.0.0 (arm64)
- CPU: Apple M2
- Memory bytes: 17179869184
- Started at: 2026-09-01T13:25:38.914Z
- Frontend mode: production (next start)
- Origin: http://localhost:3010
- Warmup runs: 2
- Recorded runs: 10
- Backend environment: configured BACKEND_API_BASE origin (value not stored)
- Env var names: BACKEND_API_BASE, BACKEND_ORIGIN, FRONTEND_ORIGIN, NEXT_PUBLIC_BACKEND_API_BASE, NEXT_PUBLIC_BACKEND_ORIGIN, NEXT_PUBLIC_FRONTEND_ORIGIN, NEXT_PUBLIC_GOOGLE_ANALYTICS, NEXT_PUBLIC_GOOGLE_VERIFICATION, NEXT_PUBLIC_NAVER_VERIFICATION, NEXT_PUBLIC_WS_URL, BENCHMARK_MODE, NEXT_PUBLIC_BENCHMARK_MODE

## Methodology

- `pnpm build` 후 `pnpm start` production server에서 측정했다. `next dev`는 사용하지 않았다.
- `BENCHMARK_MODE=true` / `NEXT_PUBLIC_BENCHMARK_MODE=true` 빌드에서만 계측이 활성화된다.
- Browser → Next 요청은 Playwright request timing으로 수집했다.
- Next → Backend / Next self `/api/*` 요청은 서버 `fetch` hook이 JSONL로 기록했다. response body는 읽지 않는다.
- TanStack Query 이벤트는 QueryClient cache subscribe와 `invalidateQueries`/`setQueryData` wrapper로 window 버퍼에 남기고, Playwright가 페이지에서 꺼냈다. 이 경로는 추가 HTTP 요청을 만들지 않는다.
- 성능 시나리오는 warmup 후 recorded run만 통계에 넣는다. 통계는 count/min/median/p75/p95/max/mean이다.
- 요청 횟수처럼 deterministic해야 하는 값은 run별 분포도 적는다.
- Cookie, Authorization, token, email, request/response body는 저장하지 않았다. URL은 path 위주다.
- HAR 원본이 있다면 `private/`에만 두고 GitHub에는 커밋하지 않는다.

## Scenarios

### 1. home-cold

새 BrowserContext에서 `/`에 최초 접근한다. viewport는 1280×800이다.

### 2. session-detail-cold

새 BrowserContext에서 `/session/678`에 직접 접근한다. fixture source: GET /api/sessions.

### 3. session-detail-warm

같은 BrowserContext에서 홈 → 세션 카드 클릭 → `/terms` → 홈 → 같은 세션 카드 재클릭한다.

### 4. session-result

SSR-heavy 페이지 `/session/678`를 사용했다.

### 5. profile

인증된 상태에서 `/profile/settings` 또는 `/profile/report`에 진입한다. 인증 fixture가 없으면 수행하지 않는다.

### 6. simple-mutation

프로필 닉네임/저장 mutation을 수행한 뒤 원래 값으로 복구한다. 안전한 인증 fixture가 없으면 수행하지 않는다.

### 7. interactive-mutation

Todo 완료 토글처럼 SSE와 결합된 mutation은 `BENCHMARK_INTERACTIVE_SESSION_ID`와 `BENCHMARK_INTERACTIVE_SUBTASK_ID`가 있을 때만 수행한다.

## Results

| Scenario             | Browser API Requests (median) | Backend Requests (median) | Median TTFB (ms) | p95 TTFB (ms) | Query fetches |
| -------------------- | ----------------------------: | ------------------------: | ---------------: | ------------: | ------------: |
| home-cold            |                             1 |                         1 |             9.56 |         11.03 |            10 |
| session-detail-cold  |                             0 |                         1 |             7.69 |         10.71 |             0 |
| session-detail-warm  |                             3 |                         3 |             8.87 |         10.05 |            30 |
| session-result       |                             0 |                         1 |             9.09 |         13.71 |             0 |
| profile              |                  Not measured |              Not measured |     Not measured |  Not measured |             0 |
| simple-mutation      |                  Not measured |              Not measured |     Not measured |  Not measured |             0 |
| interactive-mutation |                  Not measured |              Not measured |     Not measured |  Not measured |             0 |

### Request count distributions

- **home-cold** backend counts: `1, 1, 1, 1, 1, 1, 1, 1, 1, 1` (distribution 1×10)
- **home-cold** browser API counts: `1, 1, 1, 1, 1, 1, 1, 1, 1, 1` (distribution 1×10)
- **session-detail-cold** backend counts: `1, 1, 1, 1, 1, 1, 1, 1, 1, 1` (distribution 1×10)
- **session-detail-cold** browser API counts: `0, 0, 0, 0, 0, 0, 0, 0, 0, 0` (distribution 0×10)
- **session-detail-warm** backend counts: `3, 3, 3, 3, 3, 3, 3, 3, 3, 3` (distribution 3×10)
- **session-detail-warm** browser API counts: `3, 3, 3, 3, 3, 3, 3, 3, 3, 3` (distribution 3×10)
- **session-result** backend counts: `1, 1, 1, 1, 1, 1, 1, 1, 1, 1` (distribution 1×10)
- **session-result** browser API counts: `0, 0, 0, 0, 0, 0, 0, 0, 0, 0` (distribution 0×10)
- **profile** backend counts: `Not measured` (distribution Not measured)
- **profile** browser API counts: `Not measured` (distribution Not measured)
- **simple-mutation** backend counts: `Not measured` (distribution Not measured)
- **simple-mutation** browser API counts: `Not measured` (distribution Not measured)
- **interactive-mutation** backend counts: `Not measured` (distribution Not measured)
- **interactive-mutation** browser API counts: `Not measured` (distribution Not measured)

## Network Flow Findings

아래는 raw JSONL에서 확인된 source/target 분류다. 코드 추정으로 요청 수를 바꾸지 않았다.

### home-cold

- Backend sources: {"route-handler":10}
- Self-API sources: {}
- Self-API median count: 0

### session-detail-cold

- Backend sources: {"route-handler":10}
- Self-API sources: {"server-component":10}
- Self-API median count: 1

### session-detail-warm

- Backend sources: {"route-handler":30}
- Self-API sources: {}
- Self-API median count: 0

### session-result

- Backend sources: {"route-handler":10}
- Self-API sources: {"server-component":10}
- Self-API median count: 1
- Blocker: No auth fixture. Used public session detail /session/678 as the closest SSR-heavy page instead of /session/:id/result.

### profile

- Backend sources: {}
- Self-API sources: {}
- Self-API median count: Not measured
- Blocker: BENCHMARK_ACCESS_TOKEN / BENCHMARK_REFRESH_TOKEN were not provided.

### simple-mutation

- Backend sources: {}
- Self-API sources: {}
- Self-API median count: Not measured
- Blocker: No authenticated test fixture. Mutation was not forced against real user data.

### interactive-mutation

- Backend sources: {}
- Self-API sources: {}
- Self-API median count: Not measured
- Blocker: Requires auth cookies plus BENCHMARK_INTERACTIVE_SESSION_ID and BENCHMARK_INTERACTIVE_SUBTASK_ID. No safe in-progress fixture was available.

Server Component self-call 판정: `target=self-api` 이면서 path가 `/api/*`인 서버 fetch를 사용했다.
`target=backend` 이면서 같은 시각대에 `/sessions/:id`가 있으면 `Browser/SC → Next Route Handler → Backend` 흐름으로 본다.

## TanStack Cache Findings

### home-cold

- query-fetch events: 10
- invalidate events: 0
- setQueryData events: 0
- mutation events: 0
- fetched query hashes: ["session","list",{"page":1,"size":8,"sort":"POPULAR"}]
- invalidate query keys: none

### session-detail-cold

- query-fetch events: 0
- invalidate events: 0
- setQueryData events: 0
- mutation events: 0
- fetched query hashes: none
- invalidate query keys: none

### session-detail-warm

- query-fetch events: 30
- invalidate events: 0
- setQueryData events: 0
- mutation events: 0
- fetched query hashes: ["session","list",{"page":1,"size":8,"sort":"POPULAR"}], ["session","detail","678"]
- invalidate query keys: none

### session-result

- query-fetch events: 0
- invalidate events: 0
- setQueryData events: 0
- mutation events: 0
- fetched query hashes: none
- invalidate query keys: none

### profile

- query-fetch events: 0
- invalidate events: 0
- setQueryData events: 0
- mutation events: 0
- fetched query hashes: none
- invalidate query keys: none

### simple-mutation

- query-fetch events: 0
- invalidate events: 0
- setQueryData events: 0
- mutation events: 0
- fetched query hashes: none
- invalidate query keys: none

### interactive-mutation

- query-fetch events: 0
- invalidate events: 0
- setQueryData events: 0
- mutation events: 0
- fetched query hashes: none
- invalidate query keys: none

## Duplicate Requests

### home-cold

- Browser API duplicates: none in aggregated recorded events
- Backend duplicates: none in aggregated recorded events

### session-detail-cold

- Browser API duplicates: none in aggregated recorded events
- Backend duplicates: none in aggregated recorded events

### session-detail-warm

- Browser API duplicates: [{"key":"GET /api/sessions/678","countPerRun":2,"runs":10}]
- Backend duplicates: [{"key":"GET /sessions/678","countPerRun":2,"runs":10}]

### session-result

- Browser API duplicates: none in aggregated recorded events
- Backend duplicates: none in aggregated recorded events

### profile

- Browser API duplicates: none in aggregated recorded events
- Backend duplicates: none in aggregated recorded events

### simple-mutation

- Browser API duplicates: none in aggregated recorded events
- Backend duplicates: none in aggregated recorded events

### interactive-mutation

- Browser API duplicates: none in aggregated recorded events
- Backend duplicates: none in aggregated recorded events

## Retry Observations

코드상 `executeFetch` 기본 retry는 최대 3회, Query 기본 retry는 1회다. 이 섹션은 그 가능성이 아니라 이번 측정에서 같은 run·같은 method·path가 짧게 반복된 backend 기록만 적는다.

- **home-cold**: retry-like backend pairs = 0
- **session-detail-cold**: retry-like backend pairs = 0
- **session-detail-warm**: retry-like backend pairs = 0
- **session-result**: retry-like backend pairs = 0
- **profile**: retry-like backend pairs = 0
- **simple-mutation**: retry-like backend pairs = 0
- **interactive-mutation**: retry-like backend pairs = 0

## Limitations

- Measured with production `pnpm build` + `next start` on http://localhost:3010. BENCHMARK_MODE was enabled only for instrumentation.
- Session fixture 678 status is 대기. Direct /session/678 SSR succeeds, then redirects to /session/678/waiting (307) and /login?reason=auth_required for guests.
- Home cold recorded 10/10 runs with exactly 1 browser GET /api/sessions?sort=POPULAR&page=1&size=8 and 1 backend GET /sessions?sort=POPULAR&page=1&size=8.
- Session detail cold recorded 10/10 runs with 1 server self-call GET /api/sessions/678 and 1 backend GET /sessions/678. generateMetadata + page did not produce two backend requests, consistent with React.cache(getSessionDetail).
- Session detail cold had 0 browser /api/sessions/:id requests and 0 TanStack events; the client landed on login after the waiting redirect.
- Session detail warm (same BrowserContext, home card modal → close → /terms → home → same card) recorded 1 session list fetch and 2 session detail fetches per run. List cache was reused on return home; detail was fetched again on revisit.
- Scenario 4 used the same public session detail path because /session/:id/result is auth-gated.
- Scenarios 5–7 were not executed. No test-account cookies or interactive subtask fixture were provided.
- One extra backend GET /sessions?page=1&size=20 from fixture discovery was attributed to an earlier context file leftover; it is visible in raw JSONL.
- Google Analytics is present in the local env contract, so third-party browser requests exist. API counts use /api/\* only.
- Fetch-hook overhead is one JSONL append plus a small JSON context file read per instrumented server fetch. Response bodies are not consumed. SSE duration is time-to-headers only.
- session-result: No auth fixture. Used public session detail /session/678 as the closest SSR-heavy page instead of /session/:id/result.
- profile: BENCHMARK_ACCESS_TOKEN / BENCHMARK_REFRESH_TOKEN were not provided.
- simple-mutation: No authenticated test fixture. Mutation was not forced against real user data.
- interactive-mutation: Requires auth cookies plus BENCHMARK_INTERACTIVE_SESSION_ID and BENCHMARK_INTERACTIVE_SUBTASK_ID. No safe in-progress fixture was available.
- 서버 fetch hook의 `durationMs`는 response headers 수신까지다. SSE 스트림 전체 수명은 포함하지 않는다.
- source 분류는 URL/Accept 기반이다. sitemap 등 route handler가 아닌 서버 fetch는 `route-handler`로 잘못 붙을 수 있다.
- Playwright `page.goto`는 full document load다. warm 시나리오만 가능한 범위에서 client navigation(Link click)을 사용했다.
- Google Analytics가 빌드 환경에 있으면 third-party 요청이 섞일 수 있다. API 집계는 `/api/*`만 사용한다.

## Baseline Conclusions

현재 구조에 대한 관찰만 적는다. 리팩터링은 이 작업에서 수행하지 않았다.

- Home cold median document TTFB: 9.56 ms
- Home cold median browser API requests: 1
- Home cold median backend requests: 1
- Session detail cold median backend requests: 1
- Session detail cold median self-API requests: 1
- Session detail warm median browser API requests: 3
- 이후 mutation retry, self-call 제거, Server Action, Next Cache, TanStack 전략 변경은 이 숫자를 Before로 비교한다.

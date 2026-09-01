# Network / Cache Baseline Report

이 보고서는 raw evidence와 집계 스크립트에서 재현 가능한 숫자만 포함한다.
측정하지 못한 값은 `Not measured` 또는 blocker 이유로 적는다.

## Environment

- App base SHA: `6c4daca3c0cd99928526a0774de8fa646875d6f1`
- Benchmark harness SHA: `b65e3b14de0d16eb194e8a08f377ae562e512dd1`
- Result commit SHA: `null`
- Branch: `benchmark/network-baseline-20260901`
- Working tree dirty at run start: `false`
- Node.js: v22.21.1
- pnpm: 10.27.0
- Next.js: 16.1.4
- React: 19.2.3
- Playwright: 1.58.2
- Chromium: 145.0.7632.6
- OS: darwin 27.0.0 (arm64)
- CPU: Apple M2
- Memory bytes: 17179869184
- Started at: 2026-09-01T14:50:13.291Z
- Frontend mode: production (next start)
- Origin: http://localhost:3010
- Warmup runs: 2
- Recorded runs: 20
- Backend environment label: `development`
- Env var names: BACKEND_API_BASE, BACKEND_ORIGIN, BENCHMARK_BACKEND_LABEL, FRONTEND_ORIGIN, NEXT_PUBLIC_BACKEND_API_BASE, NEXT_PUBLIC_BACKEND_ORIGIN, NEXT_PUBLIC_FRONTEND_ORIGIN, NEXT_PUBLIC_GOOGLE_ANALYTICS, NEXT_PUBLIC_GOOGLE_VERIFICATION, NEXT_PUBLIC_NAVER_VERIFICATION, NEXT_PUBLIC_WS_URL

## Methodology

- `pnpm build` 후 `pnpm start` production server에서 측정했다. `next dev`는 사용하지 않았다.
- `BENCHMARK_MODE=true` / `NEXT_PUBLIC_BENCHMARK_MODE=true` 빌드에서만 계측이 활성화된다.
- Browser → Next 요청은 Playwright request timing으로 수집했다.
- Next → Backend / Next self `/api/*` 요청은 서버 `fetch` hook이 JSONL로 기록했다. response body는 읽지 않는다.
- TanStack Query 이벤트는 QueryClient cache subscribe와 `invalidateQueries`/`setQueryData` wrapper로 window 버퍼에 남기고, Playwright가 페이지에서 꺼냈다. 이 경로는 추가 HTTP 요청을 만들지 않는다.
- 성능 시나리오는 warmup 후 recorded run만 통계에 넣는다. 통계는 count/min/median/p75/p95/max/mean이다.
- 요청 횟수처럼 deterministic해야 하는 값은 run별 분포도 적는다.
- 기본 비교 표의 Query Fetch는 recorded run 합계가 아니라 **per-run median**이다.
- Cookie, Authorization, token, email, request/response body는 저장하지 않았다. URL은 path 위주다.
- HAR 원본이 있다면 `private/`에만 두고 GitHub에는 커밋하지 않는다.
- `source is a heuristic classification, not a call-stack trace`. `target=backend → source=route-handler`는 URL/target/Accept 기반 추정이며, 실제 Route Handler 호출을 의미하지 않을 수 있다.
- `target=self-api`는 서버가 frontend origin의 `/api/*`를 호출했다는 비교적 강한 evidence다.
- Document TTFB는 문서 첫 바이트 시각이다. Next.js streaming 때문에 backend/self-api fetch 완료보다 작을 수 있다. `Document TTFB = complete page data ready time`으로 해석하지 않는다.

## Scenarios

### 1. home-cold

새 BrowserContext에서 `/`에 최초 접근한다. viewport는 1280×800이다. step: `home-initial`.

### 2. session-detail-cold

새 BrowserContext에서 `/session/678`에 직접 접근한다. fixture source: GET /api/sessions. step: `detail-first`.

### 3. session-detail-warm

같은 BrowserContext에서 홈 → 세션 카드 클릭 → `/terms` → 홈 → 같은 세션 카드 재클릭한다. steps: `home-initial`, `detail-first`, `terms`, `home-return`, `detail-revisit`.

### 4. session-result

`/session/:id/result`는 측정하지 못했다. 대체 페이지 숫자를 이 시나리오 값으로 쓰지 않는다.

### 4b. ssr-public-session-detail-fallback

공개 세션 상세 `/session/678`를 별도 시나리오로 측정했다. 이 값은 session-result baseline이 아니다.

### 5. profile

인증된 상태에서 `/profile/settings` 또는 `/profile/report`에 진입한다. 안전한 인증 fixture가 없으면 수행하지 않는다.

### 6. simple-mutation

프로필 닉네임/저장 mutation을 수행한 뒤 원래 값으로 복구한다. 안전한 인증 fixture가 없으면 수행하지 않는다. 복구 실패 시 벤치마크 전체를 실패로 처리한다.

### 7. interactive-mutation

Todo 완료 토글처럼 SSE와 결합된 mutation은 `BENCHMARK_INTERACTIVE_SESSION_ID`와 `BENCHMARK_INTERACTIVE_SUBTASK_ID`가 있을 때만 수행한다.

## Results

| Scenario                           | Browser API / run | Backend / run | Self API / run | Query Fetch / run | Document TTFB | Backend Duration | Self API Duration |
| ---------------------------------- | ----------------: | ------------: | -------------: | ----------------: | ------------: | ---------------: | ----------------: |
| home-cold                          |                 1 |             1 |              0 |                 1 |          9.76 |             22.1 |      Not measured |
| session-detail-cold                |                 0 |             1 |              1 |                 0 |          9.46 |            21.04 |             26.89 |
| session-detail-warm                |                 3 |             3 |              0 |                 3 |          7.36 |            19.98 |      Not measured |
| session-result                     |      Not measured |  Not measured |   Not measured |      Not measured |  Not measured |     Not measured |      Not measured |
| ssr-public-session-detail-fallback |                 0 |             1 |              1 |                 0 |          7.73 |             18.2 |             23.46 |
| profile                            |      Not measured |  Not measured |   Not measured |      Not measured |  Not measured |     Not measured |      Not measured |
| simple-mutation                    |      Not measured |  Not measured |   Not measured |      Not measured |  Not measured |     Not measured |      Not measured |
| interactive-mutation               |      Not measured |  Not measured |   Not measured |      Not measured |  Not measured |     Not measured |      Not measured |

값은 recorded run의 median이다. Query Fetch는 전체 합계가 아니라 per-run median이다.

### p95

| Scenario                           | Browser API / run p95 | Backend / run p95 | Query Fetch / run p95 | Document TTFB p95 | Backend Duration p95 | Self API Duration p95 |
| ---------------------------------- | --------------------: | ----------------: | --------------------: | ----------------: | -------------------: | --------------------: |
| home-cold                          |                     1 |                 1 |                     1 |             12.86 |               127.38 |          Not measured |
| session-detail-cold                |                     0 |                 1 |                     0 |             13.08 |               238.24 |                249.51 |
| session-detail-warm                |                     3 |                 3 |                     3 |             11.56 |                44.89 |          Not measured |
| session-result                     |          Not measured |      Not measured |          Not measured |      Not measured |         Not measured |          Not measured |
| ssr-public-session-detail-fallback |                     0 |                 1 |                     0 |              9.35 |                28.82 |                 35.99 |
| profile                            |          Not measured |      Not measured |          Not measured |      Not measured |         Not measured |          Not measured |
| simple-mutation                    |          Not measured |      Not measured |          Not measured |      Not measured |         Not measured |          Not measured |
| interactive-mutation               |          Not measured |      Not measured |          Not measured |      Not measured |         Not measured |          Not measured |

### Request count distributions

- **home-cold** backend counts: `1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1` (distribution 1×20)
- **home-cold** browser API counts: `1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1` (distribution 1×20)
- **session-detail-cold** backend counts: `1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1` (distribution 1×20)
- **session-detail-cold** browser API counts: `0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0` (distribution 0×20)
- **session-detail-warm** backend counts: `3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3` (distribution 3×20)
- **session-detail-warm** browser API counts: `3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3` (distribution 3×20)
- **session-result**: Not measured
- **ssr-public-session-detail-fallback** backend counts: `1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1` (distribution 1×20)
- **ssr-public-session-detail-fallback** browser API counts: `0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0` (distribution 0×20)
- **profile**: Not measured
- **simple-mutation**: Not measured
- **interactive-mutation**: Not measured

## Self-hop Analysis

self-hop overhead는 `selfApiDurationMs - backendDurationMs`이다. 브라우저 Document TTFB와 다른 값이며 혼동하지 않는다.
pair는 같은 scenario/run/step/method와 path 대응(`/api/X` → `/X`), 시간 중첩이 한 건일 때만 계산한다.

### home-cold

- pairing status: no-self-api
- self-api 요청이 없어 self-hop overhead를 계산하지 않았다.

### session-detail-cold

- pairing status: paired
- pair count: 20
- self-hop overhead median: 5.4 ms
- self-hop overhead p95: 10.11 ms
- self-hop overhead min/max: 4.34 / 11.59 ms
- unmatched self-api: 0

### session-detail-warm

- pairing status: no-self-api
- self-api 요청이 없어 self-hop overhead를 계산하지 않았다.

### session-result

- Not measured

### ssr-public-session-detail-fallback

- pairing status: paired
- pair count: 20
- self-hop overhead median: 5.15 ms
- self-hop overhead p95: 8.69 ms
- self-hop overhead min/max: 3.63 / 8.94 ms
- unmatched self-api: 0

### profile

- Not measured

### simple-mutation

- Not measured

### interactive-mutation

- Not measured

## Warm Cache Analysis

| Step           | Browser API / run | Backend / run | Query Fetch / run | Session list requests | Session detail requests |
| -------------- | ----------------: | ------------: | ----------------: | --------------------: | ----------------------: |
| home-initial   |                 1 |             1 |                 1 |                    40 |                       0 |
| detail-first   |                 1 |             1 |                 1 |                     0 |                      40 |
| terms          |                 0 |             0 |                 0 |                     0 |                       0 |
| home-return    |                 0 |             0 |                 0 |                     0 |                       0 |
| detail-revisit |                 1 |             1 |                 1 |                     0 |                      40 |

- home return에서 session list refetch가 발생했는가? **no**
- detail revisit에서 detail refetch가 발생했는가? **yes**
- 분류: expected repeated request across steps, not a same-step duplicate

같은 run에서 `detail-first`와 `detail-revisit`의 `GET /api/sessions/:id` 반복은 expected repeated request다. 같은 step 안에서만 duplicate candidate로 본다.

## Mutation Cache Analysis

Not measured due to unavailable safe authenticated benchmark fixture

## Network Flow Findings

아래는 raw JSONL에서 확인된 source/target 분류다. 코드 추정으로 요청 수를 바꾸지 않았다.
`source is a heuristic classification, not a call-stack trace`.

### home-cold

- Backend sources: {"route-handler":20}
- Self-API sources: {}
- Self-API median count: 0

### session-detail-cold

- Backend sources: {"route-handler":20}
- Self-API sources: {"server-component":20}
- Self-API median count: 1

### session-detail-warm

- Backend sources: {"route-handler":60}
- Self-API sources: {}
- Self-API median count: 0

### session-result

- Not measured
- Blocker: Not measured due to unavailable safe authenticated benchmark fixture

### ssr-public-session-detail-fallback

- Backend sources: {"route-handler":20}
- Self-API sources: {"server-component":20}
- Self-API median count: 1

### profile

- Not measured
- Blocker: Not measured due to unavailable safe authenticated benchmark fixture Missing BENCHMARK_ACCESS_TOKEN / BENCHMARK_REFRESH_TOKEN.

### simple-mutation

- Not measured
- Blocker: Not measured due to unavailable safe authenticated benchmark fixture Mutation was not forced against real user data.

### interactive-mutation

- Not measured
- Blocker: Not measured due to unavailable safe authenticated benchmark fixture Requires BENCHMARK_INTERACTIVE_SESSION_ID and BENCHMARK_INTERACTIVE_SUBTASK_ID.

Server Component self-call 판정: `target=self-api` 이면서 path가 `/api/*`인 서버 fetch를 사용했다.
`target=backend` 이면서 같은 step에 `/sessions/:id`가 있으면 `Browser/SC → Next /api → Backend` 흐름 후보로 본다. source=route-handler는 heuristic이다.

## TanStack Cache Findings

### home-cold

- query-fetch / run median: 1
- query-fetch total: 20
- invalidate / run median: 0
- setQueryData / run median: 0
- mutation events / run median: 0
- fetched query hashes: ["session","list",{"page":1,"size":8,"sort":"POPULAR"}]
- invalidate query keys: none

### session-detail-cold

- query-fetch / run median: 0
- query-fetch total: 0
- invalidate / run median: 0
- setQueryData / run median: 0
- mutation events / run median: 0
- fetched query hashes: none
- invalidate query keys: none

### session-detail-warm

- query-fetch / run median: 3
- query-fetch total: 60
- invalidate / run median: 0
- setQueryData / run median: 0
- mutation events / run median: 0
- fetched query hashes: ["session","list",{"page":1,"size":8,"sort":"POPULAR"}], ["session","detail","678"]
- invalidate query keys: none

### session-result

- Not measured

### ssr-public-session-detail-fallback

- query-fetch / run median: 0
- query-fetch total: 0
- invalidate / run median: 0
- setQueryData / run median: 0
- mutation events / run median: 0
- fetched query hashes: none
- invalidate query keys: none

### profile

- Not measured

### simple-mutation

- Not measured

### interactive-mutation

- Not measured

## Duplicate Requests

duplicate candidate는 같은 scenario/run/step/method/path 반복이다. 다른 step의 같은 path는 expected repeated request다. 후보일 뿐 retry/bug로 확정하지 않는다.

### home-cold

- Expected repeated browser API: none
- Expected repeated backend: none
- Duplicate candidate browser API: none
- Duplicate candidate backend: none

### session-detail-cold

- Expected repeated browser API: none
- Expected repeated backend: none
- Duplicate candidate browser API: none
- Duplicate candidate backend: none

### session-detail-warm

- Expected repeated browser API: [{"key":"GET /api/sessions/678","scenario":"session-detail-warm","steps":["detail-first","detail-revisit"],"count":2,"runs":20}]
- Expected repeated backend: [{"key":"GET /sessions/678","scenario":"session-detail-warm","steps":["detail-first","detail-revisit"],"count":2,"runs":20}]
- Duplicate candidate browser API: none
- Duplicate candidate backend: none

### session-result

- Not measured

### ssr-public-session-detail-fallback

- Expected repeated browser API: none
- Expected repeated backend: none
- Duplicate candidate browser API: none
- Duplicate candidate backend: none

### profile

- Not measured

### simple-mutation

- Not measured

### interactive-mutation

- Not measured

## Retry Observations

코드상 `executeFetch` 기본 retry는 최대 3회, Query 기본 retry는 1회다. 이 섹션은 같은 run·같은 step·같은 method/path가 1500ms 이내에 반복된 기록만 retry candidate로 적는다. 확정된 retry가 아니다.

- **home-cold**: retry candidate backend = none; browser API = none
- **session-detail-cold**: retry candidate backend = none; browser API = none
- **session-detail-warm**: retry candidate backend = none; browser API = none
- **session-result**: Not measured
- **ssr-public-session-detail-fallback**: retry candidate backend = none; browser API = none
- **profile**: Not measured
- **simple-mutation**: Not measured
- **interactive-mutation**: Not measured

## Timing interpretation

- document TTFB: 문서 응답 첫 바이트. 페이지 데이터 준비 완료 시간이 아니다.
- backend fetch duration: 서버에서 backend origin fetch가 headers를 받기까지.
- self API fetch duration: 서버에서 frontend origin `/api/*` fetch가 headers를 받기까지.
- UI/data ready time: 이번 baseline에서는 신뢰 가능한 공통 마커가 없어 기본 표에 넣지 않았다.

## Limitations

- session-result was not measured. Public session detail is recorded separately as ssr-public-session-detail-fallback.
- profile skipped: authenticated profile page requires cookie fixture.
- session-result: Not measured due to unavailable safe authenticated benchmark fixture
- profile: Not measured due to unavailable safe authenticated benchmark fixture Missing BENCHMARK_ACCESS_TOKEN / BENCHMARK_REFRESH_TOKEN.
- simple-mutation: Not measured due to unavailable safe authenticated benchmark fixture Mutation was not forced against real user data.
- interactive-mutation: Not measured due to unavailable safe authenticated benchmark fixture Requires BENCHMARK_INTERACTIVE_SESSION_ID and BENCHMARK_INTERACTIVE_SUBTASK_ID.
- 서버 fetch hook의 `durationMs`는 response headers 수신까지다. SSE 스트림 전체 수명은 포함하지 않는다.
- source 분류는 URL/Accept 기반 heuristic이다. sitemap 등 route handler가 아닌 서버 fetch도 `route-handler`로 붙을 수 있다.
- Playwright `page.goto`는 full document load다. warm 시나리오만 가능한 범위에서 client navigation(Link click)을 사용했다.
- Google Analytics가 빌드 환경에 있으면 third-party 요청이 섞일 수 있다. API 집계는 `/api/*`만 사용한다.

## Baseline Conclusions

현재 구조에 대한 관찰만 적는다. 리팩터링은 이 작업에서 수행하지 않았다.

- Home cold median document TTFB: 9.76 ms
- Home cold median browser API requests / run: 1
- Home cold median backend requests / run: 1
- Session detail cold median backend requests / run: 1
- Session detail cold median self-API requests / run: 1
- Session detail warm median browser API requests / run: 3
- session-result: Not measured
- 이후 mutation retry, self-call 제거, Server Action, Next Cache, TanStack 전략 변경은 이 숫자를 Before로 비교한다. 같은 backend environment label끼리만 비교한다.

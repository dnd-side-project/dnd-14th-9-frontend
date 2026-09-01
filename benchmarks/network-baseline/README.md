# Network / Cache Baseline

현재 production 네트워크·캐시 동작을 Before 기준으로 남기기 위한 측정 하니스다.

이 디렉터리의 코드는 계측과 보고서 생성만 담당한다. mutation retry, Server Action, Next Cache, query 전략 변경 같은 서비스 개선은 포함하지 않는다.

## 실행

production build로만 측정한다.

```bash
pnpm benchmark:network-baseline
```

기본값:

- warmup 2회
- recorded 10회
- `next start` on `http://localhost:3010`
- `BENCHMARK_MODE=true` / `NEXT_PUBLIC_BENCHMARK_MODE=true`

최종 Baseline v1 권장 실행:

```bash
BENCHMARK_BACKEND_LABEL=<environment> \
pnpm benchmark:network-baseline -- --warmup 2 --runs 20
```

옵션:

```bash
pnpm benchmark:network-baseline -- --runs 20 --warmup 2 --port 3010
pnpm benchmark:network-baseline -- --skip-build
pnpm benchmark:network-baseline -- --har
```

`--har` 는 gitignored `private/` 아래에 unsanitized HAR를 만든다. GitHub에 커밋하지 않는다.

## 인증이 필요한 시나리오

환경 변수 이름만 사용하고 값은 커밋하지 않는다.

| 변수                               | 용도                                  |
| ---------------------------------- | ------------------------------------- |
| `BENCHMARK_ACCESS_TOKEN`           | Playwright가 주입할 accessToken 쿠키  |
| `BENCHMARK_REFRESH_TOKEN`          | Playwright가 주입할 refreshToken 쿠키 |
| `BENCHMARK_SESSION_ID`             | 세션 상세 fixture 고정                |
| `BENCHMARK_ALLOW_PROFILE_MUTATION` | `false`면 닉네임 mutation 생략        |
| `BENCHMARK_INTERACTIVE_SESSION_ID` | 인터랙티브 mutation용 세션            |
| `BENCHMARK_INTERACTIVE_SUBTASK_ID` | 인터랙티브 mutation용 subtask         |
| `BENCHMARK_BACKEND_LABEL`          | backend 환경 라벨 (`staging` 등)      |

값이 없으면 profile / simple-mutation / interactive-mutation은 억지로 실행하지 않고 REPORT에 blocker로 남긴다.

토큰 값, cookie 값, request/response body는 파일·로그·REPORT에 쓰지 않는다. 환경 변수 이름만 기록한다.

## Backend 환경 비교

`environment.json`의 `backendEnvironmentLabel`이 Before / After 비교 키다.

- 값이 없으면 `unknown`으로 기록한다.
- 이후 최적화 전후 benchmark는 **반드시 같은 backend label끼리만** 비교한다.
- backend origin 전체 값이나 secret은 저장하지 않는다.

## 산출물

- `environment.json` — 측정 환경. `appBaseSha` / `benchmarkHarnessSha` / `backendEnvironmentLabel`을 분리해 기록한다. secret 값 없음
- `raw/*.jsonl` — sanitized raw evidence
- `results/*.json` — 시나리오별 집계
- `summary.json` / `summary.csv`
- `REPORT.md`

원본 HAR, cookie, token, request/response body는 커밋하지 않는다.

## 계측 범위

`BENCHMARK_MODE`가 꺼진 production 빌드에서는 fetch hook과 Query observer가 설치되지 않는다.
켜진 경우에도 response body를 읽지 않고, 추가 API 요청을 만들지 않으며, retry/cache 옵션을 바꾸지 않는다.

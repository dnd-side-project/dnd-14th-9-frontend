# GAK (모여서 각자 작업)

![MVP](https://img.shields.io/badge/MVP-v1-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![React](https://img.shields.io/badge/React-19.2.3-149eca)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![License](https://img.shields.io/badge/license-MIT-green)

> 링크 하나로 빠르게 모여서, 제한된 시간 동안 각자 작업에 몰입하는 협업 플랫폼

## MVP 상태

- 2026년 3월 기준 1차 MVP 개발 완료
- 단일 README에서 서비스 가치, 구현 범위, 재현 방법, 품질 검증 근거를 함께 제공
- 1순위 독자: 채용/포트폴리오 리뷰어 및 신규 기여자

## 핵심 사용자 흐름 (현재 구현 기준)

1. **로그인**
   - Google / Kakao OAuth 로그인
2. **세션 탐색 및 생성**
   - 홈에서 세션 검색/필터/추천 목록 조회
   - 세션 생성 폼으로 카테고리, 시작 시간, 진행 시간, 목표 기준 설정
3. **세션 참여 및 대기방**
   - 목표/할 일 설정 후 입장
   - 대기 인원 상태를 SSE로 실시간 반영
4. **세션 진행**
   - 동기화된 타이머 기반 집중 진행
   - 참여자 상태(집중/자리 비움), 할 일 진행률, 리액션 이벤트 반영
5. **세션 종료 및 결과**
   - 집중 시간/참여 시간 제출
   - 세션 결과 화면과 참여자 리포트 확인
6. **프로필/마이페이지**
   - 프로필 정보 수정, 관심 카테고리 관리
   - 개인 리포트(세션 히스토리/통계) 확인

## 현재 범위 외 (후속 계획)

- 세션 내 실시간 채팅: 실험용 UI 컴포넌트만 존재, 현재 프로덕션 플로우에서는 비활성
- BGM(노동요): 아직 미구현

## 기술 스택

| 분류            | 기술                                 |
| --------------- | ------------------------------------ |
| Framework       | Next.js 16 (App Router)              |
| UI              | React 19, Tailwind CSS v4, Storybook |
| Language        | TypeScript                           |
| Data/State      | TanStack Query, Zustand              |
| Validation/Form | Zod, React Hook Form                 |
| Realtime        | SSE (Server-Sent Events)             |
| Test            | Jest, Vitest, Testing Library        |
| CI/CD           | GitHub Actions, Chromatic, Docker    |

## 아키텍처 요약

1. **App Router 기반 렌더링**
   - 페이지/레이아웃은 `src/app`에서 구성하고, 서버/클라이언트 컴포넌트를 역할에 따라 분리
2. **BFF 레이어**
   - `src/app/api/**/route.ts`에서 프런트 전용 API 경계를 제공
   - `src/lib/api/api-route-forwarder.ts`를 통해 인증 쿠키 전달, 에러 응답 형식, 백엔드 요청 처리를 일관되게 관리
3. **프록시 기반 인증 처리**
   - `src/proxy.ts`에서 공개/보호 경로 분기, 토큰 만료 임박 시 리프레시 자동 시도
4. **SSE 실시간 이벤트**
   - 대기방/진행상태/리액션 이벤트를 `src/app/api/sse/**` + 클라이언트 훅으로 구독
5. **데이터 계층**
   - React Query 기반으로 도메인별 query key 규칙과 공통 훅 패턴을 사용해 조회/캐시 무효화 로직을 표준화

### 구조적 포인트

> 이 프로젝트는 기능 구현뿐 아니라, 프런트엔드에서 반복적으로 발생하는 API 호출/캐시 관리 문제를 일관된 규칙으로 다루는 데 초점을 맞췄습니다.

- **API Layer**
  - Route Handler와 공통 forwarder를 통해 인증 쿠키 전달, 백엔드 포워딩, 에러 응답 형식을 프런트 전용 API 경계에서 일관되게 관리합니다.
- **Factory 기반 아키텍처**
  - 반복되는 CRUD/Singleton Query 훅 패턴은 공통 factory 형태로 추상화해 도메인별 훅 구현에서 중복을 줄이고 동일한 사용 방식을 유지하도록 구성했습니다.
- **Query Key 자동 생성 로직**
  - 도메인별 query key는 계층 구조로 생성해 목록, 상세, 단일 리소스 캐시를 예측 가능한 규칙으로 무효화할 수 있도록 정리했습니다.

## 시작하기

### Prerequisites

- Node.js `22.21.1` (`.nvmrc`)
- Corepack (Node.js 내장)
- pnpm `10.27.0` (`packageManager`)

### 설치 및 로컬 실행

```bash
# 1) 저장소 클론
git clone https://github.com/dnd-side-project/dnd-14th-9-frontend.git
cd dnd-14th-9-frontend

# 2) pnpm 활성화
corepack enable

# 3) 의존성 설치
pnpm install

# 4) Git hooks 설정 (최초 1회)
pnpm prepare

# 5) 개발 서버 실행 (토큰 빌드 watch + Next dev 동시 실행)
pnpm dev
```

### 주요 스크립트

| 명령어                 | 설명                                   |
| ---------------------- | -------------------------------------- |
| `pnpm dev`             | 토큰 watch + Next 개발 서버 실행       |
| `pnpm build`           | 디자인 토큰 생성 후 프로덕션 빌드      |
| `pnpm start`           | 프로덕션 서버 실행                     |
| `pnpm storybook`       | Storybook 로컬 실행 (`:6006`)          |
| `pnpm build-storybook` | Storybook 정적 빌드                    |
| `pnpm test`            | Jest 테스트 실행                       |
| `pnpm test:coverage`   | 커버리지 포함 테스트                   |
| `pnpm lint`            | ESLint 검사                            |
| `pnpm typecheck`       | TypeScript 타입 검사                   |
| `pnpm codegen`         | Orval 기반 API 클라이언트 코드 생성    |
| `pnpm tokens`          | Style Dictionary 기반 디자인 토큰 생성 |

## 환경 변수 계약 (`.env.local`)

이 프로젝트는 `.env.example` 대신 실제 사용 키를 기준으로 환경을 구성합니다.  
아래 키를 `.env.local`에 설정하세요.

> 보안 원칙
>
> - 실제 토큰/시크릿 값은 절대 저장소에 커밋하지 않습니다.
> - `NEXT_PUBLIC_*` 변수는 브라우저에 노출되므로 비밀값을 넣지 않습니다.
> - `.env*`는 기본적으로 `.gitignore`에 포함되어 있습니다.

| 키                                | 필수 | 예시                           | 용도                                               |
| --------------------------------- | ---- | ------------------------------ | -------------------------------------------------- |
| `BACKEND_API_BASE`                | 필수 | `https://<backend-api-origin>` | 서버 측 API 호출 기본 URL, 프록시 토큰 재발급 호출 |
| `BACKEND_ORIGIN`                  | 필수 | `https://<backend-origin>`     | OAuth 인가 URL 생성 기준 origin                    |
| `FRONTEND_ORIGIN`                 | 필수 | `http://localhost:3000`        | 서버 측 프런트 오리진 참조                         |
| `NEXT_PUBLIC_BACKEND_API_BASE`    | 필수 | `https://<backend-api-origin>` | 클라이언트/API 호출 및 sitemap 데이터 소스         |
| `NEXT_PUBLIC_BACKEND_ORIGIN`      | 필수 | `https://<backend-origin>`     | 백엔드 origin 공개값 (OAuth fallback)              |
| `NEXT_PUBLIC_FRONTEND_ORIGIN`     | 필수 | `https://<frontend-origin>`    | SEO canonical, metadata base URL                   |
| `NEXT_PUBLIC_ENABLE_DEVTOOLS`     | 선택 | `true`                         | 개발 환경 React Query Devtools 노출 제어           |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS`    | 선택 | `G-XXXXXXXXXX`                 | Google Analytics 스크립트 주입                     |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | 선택 | `<google-verification-token>`  | Google Search Console 검증                         |
| `NEXT_PUBLIC_NAVER_VERIFICATION`  | 선택 | `<naver-verification-token>`   | 네이버 웹마스터 검증                               |
| `NEXT_PUBLIC_WS_URL`              | 선택 | `ws://localhost:8080`          | 웹소켓 클라이언트 기본 주소                        |
| `BACKEND_URL`                     | 선택 | `https://<backend-origin>`     | `BACKEND_ORIGIN` 미지정 시 fallback                |
| `NEXT_PUBLIC_BACKEND_URL`         | 선택 | `https://<backend-origin>`     | `NEXT_PUBLIC_BACKEND_ORIGIN` 미지정 시 fallback    |
| `NEXT_PUBLIC_API_URL`             | 선택 | `https://<backend-api-origin>` | API URL 호환용 fallback                            |
| `NEXT_PUBLIC_APP_URL`             | 선택 | `http://localhost:3000`        | URL 유틸 함수 fallback                             |

## 품질 보증 현황 (2026-03-06 기준)

- **CI 파이프라인** (`.github/workflows/ci.yml`)
  - `main` push 시 `lint` -> `test --ci --coverage` -> `build` -> `docker build` 실행
- **UI 변경 검증** (`.github/workflows/chromatic.yml`)
  - 스토리/디자인 토큰/스토리북 설정 변경 시 Chromatic 자동 실행
- **테스트 및 스토리 자산 규모**
  - 테스트 파일: `27`개 (`src/test/**`)
  - 스토리 파일: `24`개 (`src/stories/**/*.stories.tsx|ts`)
- **배포 빌드**
  - Next.js standalone output + 멀티스테이지 Docker 빌드 구성

## 관련 링크

- 서비스: [https://gak.today](https://gak.today)
- API 문서: [https://api.gak.today/swagger-ui/index.html#/](https://api.gak.today/swagger-ui/index.html#/)
- Figma: [https://www.figma.com/design/GoML3n63duEnEfUIE07xD7/GAK?node-id=385-4980&p=f&t=OpqQI31vIcVR6cop-0](https://www.figma.com/design/GoML3n63duEnEfUIE07xD7/GAK?node-id=385-4980&p=f&t=OpqQI31vIcVR6cop-0)

## 팀원 (Contributors)

| 역할   | 이름   | GitHub                                              |
| ------ | ------ | --------------------------------------------------- |
| FE     | 장근호 | [Rootjang92](https://github.com/Rootjang92)         |
| FE     | 이경환 | [tnemnorivnelee](https://github.com/tnemnorivnelee) |
| BE     | 이소정 | [Sojeong0430](https://github.com/Sojeong0430)       |
| BE     | 박용현 | [yonghyeonpark](https://github.com/yonghyeonpark)   |
| Design | 김시라 | -                                                   |
| Design | 임세원 | -                                                   |

## 라이선스

MIT License. 자세한 내용은 [LICENSE](LICENSE)를 참고하세요.

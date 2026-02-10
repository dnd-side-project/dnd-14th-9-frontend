---
name: Refactor Template
about: 리팩토링을 이슈에 등록한다.
title: "refactor: [auth] 로그인 플로우 RSC 중심 구조로 재구성"
labels: refactor
assignees: ""
---

## 리팩토링 내용

> 로그인 진입/시작 흐름의 클라이언트 의존을 줄이고, 서버 중심(RSC + Route Handler)으로 재구성합니다.

- 로그인 시작을 `window.location.href` 대신 `/api/auth/start` Route Handler redirect로 전환
- `redirectAfterLogin` 쿠키 읽기/쓰기 책임을 클라이언트 유틸에서 서버로 이동
- `LoginCard`, `LoginPage`, `OAuthLoginButtons`를 RSC로 전환 가능하도록 이벤트/함수 props 구조 개선
- 모달 닫기 동작은 필요한 최소 범위만 Client Island로 분리

## 리팩토링 이유

> 현재 로그인 흐름은 클라이언트 이벤트/브라우저 API 의존도가 높아 RSC 이점을 충분히 활용하지 못합니다.

- 라우팅 진입은 서버에서 시작되는데, 실제 로그인 시작/쿠키 처리는 클라이언트에 분산됨
- 인증 도메인에서 책임 경계(서버 vs 클라이언트)를 명확히 분리하면 유지보수/테스트가 쉬워짐
- 초기 단계에서 구조를 정리해두면 이후 UX 개선/정책 변경 시 리스크가 줄어듦

## 참고 사항

> 코드 리뷰 시 참고할 만한 사항이나 주의할 점을 작성해주세요.

- 인터셉트 라우트 특성상 modal/page fallback 동작이 모두 유지되어야 함
- 로그인 성공 후 복귀 경로(open redirect 방지 규칙) 기존 정책 유지
- 변경 범위가 넓어 PR을 단계적으로 분리해 리뷰

## 상세 작업 내용

- [ ] `/api/auth/start` Route Handler 추가(provider 검증, redirectAfterLogin 쿠키 세팅, OAuth redirect)
- [ ] `LoginRouteClient` 축소 또는 제거
- [ ] `app/(auth)/login/page.tsx`, `app/@modal/(.)login/page.tsx`에서 서버 데이터 파생으로 렌더링
- [ ] 로그인 관련 컴포넌트의 client boundary 재정의(RSC 우선, 최소 client island)
- [ ] 회귀 테스트/수동 시나리오 점검(내부 이동 모달, 직접 진입 페이지, proxy redirect)

## 연관 이슈

> parent #35

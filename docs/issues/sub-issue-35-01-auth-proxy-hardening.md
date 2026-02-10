---
name: Bug Template
about: 버그를 이슈에 등록한다.
title: "bug: [auth] proxy 토큰 만료 판별/재발급 응답 검증 하드닝"
labels: bug
assignees: ""
---

## 버그 내용

> `proxy.ts`의 토큰 만료 판별 및 재발급 응답 검증에서 런타임 실패 가능성이 있습니다.

- JWT payload(`parts[1]`)를 `atob`로 직접 디코딩할 때 base64url 토큰에서 예외가 발생할 수 있습니다.
- 예외 발생 시 토큰이 항상 "만료 임박"으로 판단되어 불필요한 refresh 호출이 증가할 수 있습니다.
- refresh 응답 검증이 키 존재 중심이라 `accessToken`/`refreshToken`의 타입(string) 보장이 약합니다.

## 버그 재현 방법

1. base64url 형식 JWT를 `accessToken`으로 넣고 보호된 라우트 접근
2. `isTokenExpiringSoon`에서 디코딩 예외 발생 확인
3. 토큰이 유효해도 refresh 호출이 반복되는지 확인
4. refresh 응답을 비정상 타입(`accessToken: 123`)으로 mock하여 쿠키 세팅 경로 진입 여부 확인

## 기대 동작

- base64url 토큰도 정상 디코딩되어 실제 `exp` 기준으로 만료 임박 여부를 판별해야 합니다.
- refresh 응답은 타입 가드로 엄격히 검증하고, 실패 시 안전하게 로그인 라우트로 유도해야 합니다.

## 상세 작업 내용

- [ ] JWT base64url 디코딩 유틸 추가(`-`, `_`, padding 처리)
- [ ] `isTokenExpiringSoon`에서 디코딩/파싱 실패 처리 명확화
- [ ] refresh 응답 전용 타입 가드 함수 분리 및 string 타입 검증 추가
- [ ] 비정상 응답(`invalid_response`) 분기 테스트 추가
- [ ] base64url 토큰 케이스 테스트 추가

## 연관 이슈

> parent #35

---
name: Chore Template
about: 개발 도구, 빌드, 설정 등 개선 작업을 이슈에 등록한다.
title: "chore: [auth] OAuth 로그인 버튼 type 명시로 의도치 않은 submit 방지"
labels: chore
assignees: ""
---

## 작업 내용

> OAuth 로그인 버튼에 `type`을 명시해 폼 컨텍스트에서의 기본 submit 동작을 방지합니다.

- `OAuthLoginButtons`의 각 버튼에 `type="button"` 지정
- 관련 테스트/스토리가 있다면 DOM 속성 검증 추가

## 작업 이유

> 현재는 단독 렌더링으로 문제 없지만, 추후 `<form>` 내부에서 재사용될 때 기본값(`submit`)으로 인해 의도치 않은 내비게이션이 발생할 수 있습니다.

- 작은 변경으로 잠재적 UX 회귀를 예방 가능
- 코딩 컨벤션 측면에서도 명시적 버튼 타입이 안전함

## 참고 사항

> 코드 리뷰 시 참고할 만한 사항이나 주의할 점을 작성해주세요.

- `type="button"`은 현재 동작을 깨지 않고 안전성만 높이는 변경
- 리팩터링 이슈와 별도 머지 가능

## 연관 이슈

> parent #35

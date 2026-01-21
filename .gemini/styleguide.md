# GAK 프로젝트 코드 스타일 가이드

이 문서는 Gemini Code Assist가 코드 리뷰 시 참고하는 팀 컨벤션입니다.
**모든 리뷰 코멘트는 한국어로 작성해주세요.**

---

## 일반 원칙

- **가독성**: 모든 팀원이 쉽게 이해할 수 있는 코드를 작성합니다.
- **일관성**: 프로젝트 전체에서 동일한 스타일을 유지합니다.
- **단순성**: 복잡한 해결책보다 단순한 해결책을 선호합니다.

---

## TypeScript / JavaScript

### 네이밍 컨벤션

- **변수/함수**: camelCase (예: `userName`, `fetchUserData`)
- **상수**: UPPER_SNAKE_CASE (예: `MAX_RETRY_COUNT`, `API_BASE_URL`)
- **컴포넌트/클래스**: PascalCase (예: `UserProfile`, `PaymentProcessor`)
- **타입/인터페이스**: PascalCase (예: `UserResponse`, `ApiError`)

### 코드 스타일

- `any` 타입 사용을 지양합니다. 구체적인 타입을 명시하세요.
- 중첩 깊이는 최대 2-3 단계로 유지합니다.
- Early Return 패턴을 사용하여 `else`를 최소화합니다.
- `console.log`는 커밋하지 않습니다.

```typescript
// ✅ Good - Early Return
function processUser(user: User | null) {
  if (!user) return null;
  if (!user.isActive) return null;
  return user.name;
}

// ❌ Bad - Deep Nesting
function processUser(user: User | null) {
  if (user) {
    if (user.isActive) {
      return user.name;
    }
  }
  return null;
}
```

---

## React / Next.js

### 컴포넌트 규칙

- 컴포넌트는 함수형으로만 작성합니다.
- 서버 컴포넌트와 클라이언트 컴포넌트를 명확히 분리합니다.
- 클라이언트 컴포넌트는 파일 최상단에 `"use client"` 지시어를 추가합니다.
- 한 컴포넌트는 한 가지 역할만 수행합니다. (SRP)

### 데이터 페칭

- 클라이언트에서 API 호출은 React Query를 통해 수행합니다.
- 서버 컴포넌트에서는 직접 `fetch`를 사용합니다.

### Hooks

- 커스텀 훅은 `use` 접두사를 사용합니다. (예: `useAuth`, `useFetchUser`)
- 훅에서 복잡한 로직을 추출하여 컴포넌트를 깔끔하게 유지합니다.

---

## 에러 처리

- 구체적인 에러 타입을 사용합니다. (`Error`보다 `ApiError`, `ValidationError`)
- 사용자에게 친화적인 에러 메시지를 제공합니다.
- `try...catch` 블록으로 에러를 적절히 처리합니다.

---

## 주석

- 주석은 한국어로 작성합니다.
- "왜(why)" 그렇게 했는지 설명합니다. "무엇(what)"은 코드가 설명합니다.
- TODO 주석에는 담당자와 이유를 명시합니다.

```typescript
// TODO(kyungwhan): 백엔드 API 완성 후 실제 엔드포인트로 변경
const API_URL = "/api/mock/users";
```

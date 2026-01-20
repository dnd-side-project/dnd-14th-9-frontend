# GAK (모여서 각자 작업)

![Project Status](https://img.shields.io/badge/status-active-success)
![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38b2ac)
![License](https://img.shields.io/badge/license-MIT-green)

> **"혼자 하면 흐트러지기 쉬운 작업 시간, 누구나 빠르게 모각작 모임을 생성하고 함께할 사람들을 모을 수 있는 웹 기반 플랫폼"**

## 📝 개요

**GAK**은 시간 제한, 개인 목표 설정, 상호 결과 검증을 통해 제한된 상호작용 속에서도 높은 집중도를 유지하며 짧고 밀도 있는 작업 세션을 제공하는 서비스입니다.

복잡한 절차 없이 **링크 공유** 하나만으로 즉시 모여서 작업에 몰입할 수 있는 환경을 만듭니다.

---

## 🚩 배경 및 기획 의도

### 배경

1. 개인 작업자들은 혼자 작업할 때 집중이 쉽게 깨집니다.
2. 기존 모각작은 사전 관계 형성(연락처 공유 등)이 필요하여 진입 장벽이 높습니다.
3. 지인 중심의 폐쇄적 모임이 많아 일회성·비정기적 참여가 어렵습니다.

### 해결하고자 하는 문제 (Hypothesis & Solution)

- **집중력 저하** → 작업 전 목표 선언과 공유된 타이머로 강제성 부여
- **높은 진입 장벽** → 연락처 없이 링크만으로 참여 가능한 익명성 보장
- **유연성 부족** → 방 생성과 종료가 명확한 시간 제한형 구조 제공

---

## ✨ 주요 기능

### 1. 링크 기반 모각작 방 생성

- 작업 시간 설정 후 즉시 방 생성
- 초대 링크를 통한 간편한 참여 (로그인/연락처 교환 불필요)

### 2. 개인 목표 설정 및 입장

- 세션 시작 전, 각자의 작업 목표 선언
- 종료 후 상호 검증의 기준으로 활용

### 3. 시간 동기화 공동 작업

- 모든 참여자의 타이머가 동기화되어 진행
- 제한된 시간 동안 몰입 환경 제공

### 4. 최소한의 상호작용

- 작업 방해를 최소화하는 제한된 채팅
- 함께 듣는 노동요(BGM) 기능

### 5. 결과 검증 및 피드백

- 타이머 종료 시 상호 목표 달성 여부 체크

---

## 🛠️ 기술 스택

| 분류          | 기술                                   | 비고                 |
| ------------- | -------------------------------------- | -------------------- |
| **Framework** | Next.js 16 (App Router)                |                      |
| **Language**  | TypeScript                             |                      |
| **Styling**   | Tailwind CSS 4, shadcn/ui              |                      |
| **State Mgt** | React Query (Server), Zustand (Client) |                      |
| **Form**      | React Hook Form + Zod                  |                      |
| **Test**      | Jest, Vitest, Playwright               | Unit/Interaction/E2E |
| **Docs**      | Storybook                              | UI 컴포넌트 문서화   |
| **CI/CD**     | GitHub Actions                         | Docker 빌드 포함     |

---

## 🚀 시작하기

### 필요 조건 (Prerequisites)

- [Node.js 22+](https://nodejs.org/)
- [pnpm 9+](https://pnpm.io/)

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/dnd-side-project/dnd-14th-9-frontend.git

# 2. 의존성 설치
pnpm install

# 3. Husky 설정 (최초 1회)
pnpm prepare

# 4. 개발 서버 실행
pnpm dev
```

### 환경 변수 설정

`.env.example`을 참고하여 `.env.local`을 설정해주세요.
_(추후 필수 환경 변수 목록이 확정되면 업데이트 예정입니다)_

---

## 🤝 팀원 (Contributors)

| 역할   | 이름 | GitHub |
| ------ | ---- | ------ |
| FE     | -    | -      |
| FE     | -    | -      |
| BE     | -    | -      |
| Design | -    | -      |

---

## � 관련 링크

- **배포 URL**: _(준비 중)_
- **API 문서**: _(준비 중)_
- **디자인(Figma)**: _(준비 중)_

---

## 📜 라이선스

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

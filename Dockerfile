# 1. Base Image 설정 (모든 단계에서 공통으로 사용)
# Alpine 리눅스는 매우 가벼운 이미지라 컨테이너 크기를 줄이는 데 유리합니다.
FROM node:22-alpine AS base

# pnpm 패키지 매니저 활성화
# Node.js 16.9.0 이상부터 포함된 Corepack을 사용해 pnpm을 설치합니다.
RUN corepack enable && corepack prepare pnpm@latest --activate

# ---------------------------------------------------------

# 2. Dependencies 단계 (의존성 설치)
# 이 단계에서는 package.json 파일들만 복사해서 의존성을 설치합니다.
# 소스 코드가 바뀌어도 의존성이 안 바뀌면 이 단계는 캐시된 것을 재사용합니다 (빌드 속도 향상).
FROM base AS deps
WORKDIR /app

# 패키지 매니저 파일 복사
COPY package.json pnpm-lock.yaml ./

# 의존성 설치 (CI 환경처럼 strict하게 설치하기 위해 frozen-lockfile 사용)
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------

# 3. Builder 단계 (소스 코드 빌드)
# 실제 Next.js 애플리케이션을 빌드하는 단계입니다.
FROM base AS builder
WORKDIR /app

# deps 단계에서 설치된 node_modules를 가져옵니다.
COPY --from=deps /app/node_modules ./node_modules

# 나머지 모든 소스 코드를 복사합니다.
COPY . .

# Next.js 빌드 실행 (Standalone 모드로 빌드됨)
RUN pnpm build

# ---------------------------------------------------------

# 4. Runner 단계 (실제 실행 이미지)
# 최종적으로 프로덕션에서 실행될 아주 가벼운 이미지입니다.
FROM base AS runner
WORKDIR /app

# 환경 변수를 프로덕션으로 설정
ENV NODE_ENV=production

# 보안을 위해 root 권한이 아닌 별도의 사용자(nextjs)를 생성하고 사용합니다.
# 컨테이너가 해킹당해도 호스트 시스템에 영향을 덜 주게 됩니다.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 빌드 결과물 중 필요한 것만 골라서 복사합니다.
# public 폴더 (이미지, 폰트 등)
COPY --from=builder /app/public ./public

# Next.js Standalone 빌드 결과물 (서버 실행에 필요한 최소한의 파일들)
# --chown 옵션으로 파일 소유권을 nextjs 유저로 변경합니다.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# nextjs 유저로 전환 (이제부터 실행되는 명령어는 root 권한이 아님)
USER nextjs

# 3000번 포트 개방
EXPOSE 3000
ENV PORT=3000

# 서버 실행 명령어
CMD ["node", "server.js"]

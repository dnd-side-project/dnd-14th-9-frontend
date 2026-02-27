import Link from "next/link";

import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "쿠키 정책",
  description: "GAK 서비스 쿠키 정책입니다.",
  pathname: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return (
    <div className="p-3xl flex flex-col">
      <h1 className="text-text-primary text-3xl font-bold">쿠키 정책</h1>
      <p className="text-text-disabled mt-2 text-sm">시행일: 2025년 7월 1일</p>

      <p className="text-text-secondary mt-6 leading-7">
        GAK (DND 9팀, 이하 &quot;운영팀&quot;)은 서비스 제공 및 이용자 편의를 위해 쿠키(Cookie)와
        브라우저 로컬 저장소(localStorage)를 사용합니다. 이 정책은 사용되는 쿠키의 종류, 목적, 관리
        방법을 안내합니다.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        <section>
          <h2 className="text-text-primary text-xl font-bold">쿠키란 무엇인가요?</h2>
          <p className="text-text-secondary mt-3 leading-7">
            쿠키는 웹사이트가 이용자의 브라우저에 저장하는 작은 텍스트 파일입니다. 서비스 이용 시
            로그인 상태 유지, 사용자 설정 기억 등을 위해 사용됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">1. 필수 쿠키</h2>
          <p className="text-text-secondary mt-3 leading-7">
            서비스 이용에 반드시 필요한 쿠키로, 이 쿠키가 없으면 로그인 및 기본 기능을 사용할 수
            없습니다.
          </p>

          <div className="border-border-subtle mt-4 overflow-x-auto rounded-lg border">
            <table className="text-text-secondary w-full text-sm">
              <thead>
                <tr className="border-border-subtle bg-surface-strong border-b">
                  <th className="text-text-primary px-4 py-3 text-left font-semibold">쿠키명</th>
                  <th className="text-text-primary px-4 py-3 text-left font-semibold">목적</th>
                  <th className="text-text-primary px-4 py-3 text-left font-semibold">유효기간</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-border-subtle border-b">
                  <td className="px-4 py-3 font-mono text-xs">accessToken</td>
                  <td className="px-4 py-3">API 인증을 위한 JWT 액세스 토큰</td>
                  <td className="px-4 py-3">1시간</td>
                </tr>
                <tr className="border-border-subtle border-b">
                  <td className="px-4 py-3 font-mono text-xs">refreshToken</td>
                  <td className="px-4 py-3">액세스 토큰 갱신을 위한 리프레시 토큰</td>
                  <td className="px-4 py-3">30일</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">redirectAfterLogin</td>
                  <td className="px-4 py-3">로그인 후 원래 페이지로 돌아가기 위한 경로 저장</td>
                  <td className="px-4 py-3">5분</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-text-muted mt-3 text-sm leading-6">
            인증 쿠키(accessToken, refreshToken)는 보안을 위해 HttpOnly, Secure 속성이 적용되어 있어
            JavaScript로 접근할 수 없습니다.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">2. 로컬 저장소 (localStorage)</h2>
          <p className="text-text-secondary mt-3 leading-7">
            쿠키 외에도 브라우저 로컬 저장소를 사용하여 일부 데이터를 저장합니다.
          </p>

          <div className="border-border-subtle mt-4 overflow-x-auto rounded-lg border">
            <table className="text-text-secondary w-full text-sm">
              <thead>
                <tr className="border-border-subtle bg-surface-strong border-b">
                  <th className="text-text-primary px-4 py-3 text-left font-semibold">항목</th>
                  <th className="text-text-primary px-4 py-3 text-left font-semibold">목적</th>
                  <th className="text-text-primary px-4 py-3 text-left font-semibold">유효기간</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-border-subtle border-b">
                  <td className="px-4 py-3 font-mono text-xs">session-timer</td>
                  <td className="px-4 py-3">
                    세션 타이머 상태 유지 (경과 시간, 집중 시간, 집중률 등)
                  </td>
                  <td className="px-4 py-3">세션 종료 시까지</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs">lastLoginProvider</td>
                  <td className="px-4 py-3">최근 사용한 소셜 로그인 수단 기억</td>
                  <td className="px-4 py-3">삭제 전까지</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">3. 분석 쿠키 (제3자)</h2>
          <p className="text-text-secondary mt-3 leading-7">
            서비스 개선을 위해 Google Analytics 4(GA4)를 사용합니다. GA4는 이용자의 서비스 이용
            패턴을 분석하기 위해 쿠키를 설정할 수 있습니다.
          </p>
          <ul className="text-text-secondary mt-2 list-inside list-disc space-y-1 leading-7">
            <li>수집 항목: 페이지 조회, 방문 시간, 이용 경로 등 (비식별 통계)</li>
            <li>제공처: Google LLC</li>
            <li>
              상세 정보:{" "}
              <a
                href="https://policies.google.com/technologies/cookies"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-brand-default underline"
              >
                Google 쿠키 사용 방식
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">4. 쿠키 관리 방법</h2>
          <p className="text-text-secondary mt-3 leading-7">
            이용자는 브라우저 설정을 통해 쿠키를 관리할 수 있습니다. 다만, 필수 쿠키를 차단하면
            로그인 등 서비스의 일부 기능을 이용할 수 없습니다.
          </p>

          <h3 className="text-text-primary mt-4 font-semibold">브라우저별 쿠키 설정 방법</h3>
          <ul className="text-text-secondary mt-2 list-inside list-disc space-y-1 leading-7">
            <li>Chrome: 설정 &gt; 개인정보 및 보안 &gt; 쿠키 및 기타 사이트 데이터</li>
            <li>Safari: 환경설정 &gt; 개인정보 보호 &gt; 쿠키 및 웹사이트 데이터 관리</li>
            <li>Firefox: 설정 &gt; 개인 정보 및 보안 &gt; 쿠키 및 사이트 데이터</li>
            <li>Edge: 설정 &gt; 쿠키 및 사이트 권한 &gt; 쿠키 및 사이트 데이터 관리 및 삭제</li>
          </ul>

          <h3 className="text-text-primary mt-4 font-semibold">로컬 저장소 삭제 방법</h3>
          <p className="text-text-secondary mt-2 leading-7">
            브라우저 개발자 도구(F12) &gt; Application &gt; Local Storage에서 gak.today 항목을
            삭제할 수 있습니다.
          </p>
        </section>

        <section className="border-border-subtle border-t pt-8">
          <h2 className="text-text-primary text-xl font-bold">문의</h2>
          <p className="text-text-secondary mt-3 leading-7">
            쿠키 정책에 관한 문의는 아래 이메일로 연락해 주세요.
          </p>
          <p className="text-text-secondary mt-2">
            이메일:{" "}
            <a href="mailto:dnd9team@gmail.com" className="text-text-brand-default underline">
              dnd9team@gmail.com
            </a>
          </p>
          <p className="text-text-secondary mt-4 leading-7">
            개인정보 처리에 관한 자세한 내용은{" "}
            <Link href="/privacy" className="text-text-brand-default underline">
              개인정보 처리방침
            </Link>
            을 참고해 주세요.
          </p>
        </section>
      </div>
    </div>
  );
}

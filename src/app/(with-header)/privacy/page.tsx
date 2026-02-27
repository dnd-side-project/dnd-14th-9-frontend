import Link from "next/link";

import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "개인정보 처리방침",
  description: "GAK 서비스 개인정보 처리방침입니다.",
  pathname: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="p-3xl flex flex-col">
      <h1 className="text-text-primary text-3xl font-bold">개인정보 처리방침</h1>
      <p className="text-text-disabled mt-2 text-sm">시행일: 2025년 7월 1일</p>

      <p className="text-text-secondary mt-6 leading-7">
        GAK (DND 9팀, 이하 &quot;운영팀&quot;)은 이용자의 개인정보를 중요시하며, 「개인정보 보호법」
        등 등 관련 법령을 준수합니다. 이 방침은 운영팀이 수집한 개인정보가 어떻게 이용되고
        보호되는지 설명합니다.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        <section>
          <h2 className="text-text-primary text-xl font-bold">제1조 (수집하는 개인정보 항목)</h2>
          <p className="text-text-secondary mt-3 leading-7">
            운영팀은 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.
          </p>

          <h3 className="text-text-primary mt-4 font-semibold">1. 소셜 로그인 시 수집 항목</h3>
          <ul className="text-text-secondary mt-2 list-inside list-disc space-y-1 leading-7">
            <li>Google 로그인: 이름(닉네임), 이메일, 프로필 이미지</li>
            <li>Kakao 로그인: 닉네임, 이메일(선택), 프로필 이미지</li>
          </ul>

          <h3 className="text-text-primary mt-4 font-semibold">2. 서비스 이용 중 생성되는 정보</h3>
          <ul className="text-text-secondary mt-2 list-inside list-disc space-y-1 leading-7">
            <li>프로필 정보: 닉네임, 소개(bio), 관심 카테고리</li>
            <li>세션 활동 데이터: 참여 시간, 집중 시간, 집중률, 목표 달성률</li>
            <li>목표 및 할 일 내용</li>
          </ul>

          <h3 className="text-text-primary mt-4 font-semibold">3. 자동 수집 정보</h3>
          <ul className="text-text-secondary mt-2 list-inside list-disc space-y-1 leading-7">
            <li>접속 로그, 브라우저 정보, IP 주소</li>
            <li>
              Google Analytics 4(GA4)를 통한 서비스 이용 통계 (페이지 조회, 세션 시간, 이용 패턴 등)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">
            제2조 (개인정보의 수집 및 이용 목적)
          </h2>
          <ul className="text-text-secondary mt-3 list-inside list-disc space-y-1 leading-7">
            <li>회원 식별 및 인증 (소셜 로그인)</li>
            <li>서비스 제공: 세션 생성/참여, 목표 관리, 활동 리포트</li>
            <li>서비스 개선 및 통계 분석</li>
            <li>공지사항 및 서비스 관련 안내</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">
            제3조 (개인정보의 보유 및 이용 기간)
          </h2>
          <p className="text-text-secondary mt-3 leading-7">
            이용자의 개인정보는 서비스 이용 기간 동안 보유하며, 탈퇴 시 지체 없이 파기합니다. 다만,
            관련 관련 법령에 의해 보존이 필요한 경우 해당 기간 동안 보관합니다.
          </p>
          <ul className="text-text-secondary mt-2 list-inside list-disc space-y-1 leading-7">
            <li>인증 토큰 (accessToken): 발급 후 1시간</li>
            <li>인증 토큰 (refreshToken): 발급 후 30일</li>
            <li>서비스 이용 기록: 회원 탈퇴 시까지</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제4조 (개인정보의 제3자 제공)</h2>
          <p className="text-text-secondary mt-3 leading-7">
            운영팀은 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 다음의 경우는
            예외로 합니다.
          </p>
          <ul className="text-text-secondary mt-2 list-inside list-disc space-y-1 leading-7">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령에 의해 요구되는 경우</li>
          </ul>
          <p className="text-text-secondary mt-3 leading-7">
            서비스 개선을 위해 Google Analytics 4(GA4)를 사용하며, 이를 통해 비식별화된 서비스 이용
            통계가 Google에 전송됩니다. 자세한 내용은{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-brand-default underline"
            >
              Google 개인정보 처리방침
            </a>
            을 참고해 주세요.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제5조 (개인정보의 파기)</h2>
          <ol className="text-text-secondary mt-3 list-inside list-decimal space-y-2 leading-7">
            <li>이용자가 회원 탈퇴를 요청하면 해당 개인정보를 지체 없이 파기합니다.</li>
            <li>
              전자적 파일 형태의 정보는 복구할 수 없는 방법으로 영구 삭제하며, 출력물은 분쇄 또는
              소각합니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제6조 (이용자의 권리)</h2>
          <p className="text-text-secondary mt-3 leading-7">
            이용자는 다음과 같은 권리를 행사할 수 있습니다.
          </p>
          <ul className="text-text-secondary mt-2 list-inside list-disc space-y-1 leading-7">
            <li>개인정보 열람 요청</li>
            <li>개인정보 정정 및 삭제 요청</li>
            <li>개인정보 처리 정지 요청</li>
            <li>회원 탈퇴 요청</li>
          </ul>
          <p className="text-text-secondary mt-3 leading-7">
            위 권리 행사는 서비스 내 프로필 설정 또는 이메일(dnd9team@gmail.com)을 통해 요청할 수
            있으며, 있으며, 운영팀은 지체 없이 조치합니다.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제7조 (쿠키 및 로컬 저장소)</h2>
          <p className="text-text-secondary mt-3 leading-7">
            서비스는 인증 및 이용 편의를 위해 쿠키와 브라우저 로컬 저장소(localStorage)를
            사용합니다. 사용합니다. 자세한 내용은{" "}
            <Link href="/cookie-policy" className="text-text-brand-default underline">
              쿠키 정책
            </Link>
            을 참고해 주세요.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">
            제8조 (개인정보의 안전성 확보 조치)
          </h2>
          <p className="text-text-secondary mt-3 leading-7">
            운영팀은 이용자의 개인정보를 안전하게 보호하기 위해 다음 조치를 취하고 있습니다.
          </p>
          <ul className="text-text-secondary mt-2 list-inside list-disc space-y-1 leading-7">
            <li>인증 토큰의 암호화 전송 (HTTPS)</li>
            <li>인증 쿠키에 HttpOnly, Secure 속성 적용</li>
            <li>접근 권한 관리 및 최소화</li>
          </ul>
        </section>

        <section className="border-border-subtle border-t pt-8">
          <h2 className="text-text-primary text-xl font-bold">개인정보 보호 문의</h2>
          <p className="text-text-secondary mt-3 leading-7">
            개인정보 처리에 관한 문의, 불만 처리 및 피해 구제는 아래로 연락해 주세요.
          </p>
          <p className="text-text-secondary mt-2">
            운영팀 이메일:{" "}
            <a href="mailto:dnd9team@gmail.com" className="text-text-brand-default underline">
              dnd9team@gmail.com
            </a>
          </p>
          <p className="text-text-secondary mt-4 leading-7">
            기타 개인정보 침해에 대한 신고 및 상담은 아래 기관에 문의하실 수 있습니다.
          </p>
          <ul className="text-text-secondary mt-2 list-inside list-disc space-y-1 leading-7">
            <li>개인정보 침해신고센터 (privacy.kisa.or.kr / 국번없이 118)</li>
            <li>개인정보 분쟁조정위원회 (kopico.go.kr / 1833-6972)</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

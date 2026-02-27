import Link from "next/link";

import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "이용약관",
  description: "GAK 서비스 이용약관입니다.",
  pathname: "/terms",
});

export default function TermsPage() {
  return (
    <div className="p-3xl flex flex-col">
      <h1 className="text-text-primary text-3xl font-bold">이용약관</h1>
      <p className="text-text-disabled mt-2 text-sm">시행일: 2025년 7월 1일</p>

      <div className="mt-10 flex flex-col gap-10">
        <section>
          <h2 className="text-text-primary text-xl font-bold">제1조 (목적)</h2>
          <p className="text-text-secondary mt-3 leading-7">
            이 약관은 GAK (DND 9팀, 이하 &quot;운영팀&quot;)이 제공하는 온라인 모각작(모여서 각자
            작업) 플랫폼 &quot;GAK&quot; (이하 &quot;서비스&quot;)의 이용과 관련하여 운영팀과 이용자
            간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제2조 (용어의 정의)</h2>
          <ol className="text-text-secondary mt-3 list-inside list-decimal space-y-2 leading-7">
            <li>
              <strong className="text-text-primary">&quot;서비스&quot;</strong>란 운영팀이
              https://gak.today 도메인을 통해 제공하는 온라인 협업 집중 플랫폼을 의미합니다.
            </li>
            <li>
              <strong className="text-text-primary">&quot;이용자&quot;</strong>란 이 약관에 따라
              서비스에 가입하여 이용하는 자를 의미합니다.
            </li>
            <li>
              <strong className="text-text-primary">&quot;세션&quot;</strong>이란 이용자가
              생성하거나 참여하는 시간 제한 기반의 집중 작업 단위를 의미합니다.
            </li>
            <li>
              <strong className="text-text-primary">&quot;호스트&quot;</strong>란 세션을 생성한
              이용자를 의미합니다.
            </li>
            <li>
              <strong className="text-text-primary">&quot;참여자&quot;</strong>란 세션에 참여하는
              모든 이용자(호스트 포함)를 의미합니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제3조 (약관의 효력 및 변경)</h2>
          <ol className="text-text-secondary mt-3 list-inside list-decimal space-y-2 leading-7">
            <li>
              이 약관은 서비스 내에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이
              발생합니다.
            </li>
            <li>
              운영팀은 관련 법령에 위배되지 않는 범위 내에서 약관을 변경할 수 있으며, 변경 시
              적용일자 및 변경 사유를 명시하여 최소 7일 전에 서비스 내에 공지합니다.
            </li>
            <li>
              변경된 약관에 동의하지 않는 이용자는 서비스 이용을 중단하고 탈퇴할 수 있습니다. 변경된
              약관의 효력 발생일 이후에도 서비스를 계속 이용하는 경우 약관 변경에 동의한 것으로
              간주합니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제4조 (회원가입 및 계정)</h2>
          <ol className="text-text-secondary mt-3 list-inside list-decimal space-y-2 leading-7">
            <li>
              서비스는 소셜 로그인(Google, Kakao)을 통해 가입할 수 있으며, 이용자는 해당 소셜
              서비스의 이용약관에도 동의한 것으로 간주합니다.
            </li>
            <li>
              이용자는 가입 시 정확한 정보를 제공해야 하며, 타인의 정보를 도용하거나 허위 정보를
              등록해서는 안 됩니다.
            </li>
            <li>
              계정에 대한 관리 책임은 이용자 본인에게 있으며, 제3자에게 계정을 양도하거나 대여할 수
              없습니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제5조 (서비스의 내용)</h2>
          <p className="text-text-secondary mt-3 leading-7">
            운영팀이 제공하는 서비스는 다음과 같습니다.
          </p>
          <ul className="text-text-secondary mt-2 list-inside list-disc space-y-1 leading-7">
            <li>세션 생성 및 참여 (시간 제한, 최대 참여 인원 설정)</li>
            <li>개인 목표(할 일) 설정 및 달성률 추적</li>
            <li>집중 타이머 및 집중률 측정</li>
            <li>참여자 간 목표 달성 상호 검증</li>
            <li>활동 리포트 (참여 시간, 집중률, 달성률 등)</li>
            <li>프로필 관리 (닉네임, 소개, 관심 카테고리)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제6조 (이용자의 의무)</h2>
          <p className="text-text-secondary mt-3 leading-7">
            이용자는 다음 행위를 해서는 안 됩니다.
          </p>
          <ul className="text-text-secondary mt-2 list-inside list-disc space-y-1 leading-7">
            <li>타인의 개인정보를 무단으로 수집, 저장, 공개하는 행위</li>
            <li>서비스의 정상적인 운영을 방해하는 행위</li>
            <li>욕설, 비방, 음란물 등 불건전한 내용을 게시하는 행위</li>
            <li>서비스를 영리 목적으로 무단 이용하는 행위</li>
            <li>기타 관련 법령에 위반되는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제7조 (서비스의 변경 및 중단)</h2>
          <ol className="text-text-secondary mt-3 list-inside list-decimal space-y-2 leading-7">
            <li>
              운영팀은 서비스의 내용을 변경하거나 중단할 수 있으며, 이 경우 사전에 서비스 내 공지를
              통해 이용자에게 알립니다.
            </li>
            <li>
              천재지변, 시스템 장애 등 불가항력적 사유로 서비스가 중단되는 경우 별도의 사전 통지
              없이 서비스를 일시 중단할 수 있습니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제8조 (지적재산권)</h2>
          <ol className="text-text-secondary mt-3 list-inside list-decimal space-y-2 leading-7">
            <li>서비스에 포함된 디자인, 로고, 코드 등 제작물의 저작권은 운영팀에 귀속됩니다.</li>
            <li>
              이용자가 서비스 내에 작성한 목표, 할 일 등의 콘텐츠에 대한 저작권은 해당 이용자에게
              귀속됩니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제9조 (면책조항)</h2>
          <ol className="text-text-secondary mt-3 list-inside list-decimal space-y-2 leading-7">
            <li>
              운영팀은 이용자 간의 상호작용에서 발생하는 분쟁에 대해 개입할 의무를 지지 않으며, 이로
              인한 손해에 대해 책임을 지지 않습니다.
            </li>
            <li>
              운영팀은 무료로 제공하는 서비스의 이용과 관련하여 이용자에게 발생한 손해에 대해
              운영팀의 고의 또는 중과실이 없는 한 책임을 지지 않습니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제10조 (회원 탈퇴 및 자격 상실)</h2>
          <ol className="text-text-secondary mt-3 list-inside list-decimal space-y-2 leading-7">
            <li>이용자는 언제든지 서비스 내 설정을 통해 탈퇴를 요청할 수 있습니다.</li>
            <li>
              탈퇴 시 이용자의 개인정보는{" "}
              <Link href="/privacy" className="text-text-brand-default underline">
                개인정보 처리방침
              </Link>
              에 따라 처리됩니다.
            </li>
          </ol>
        </section>

        <section>
          <h2 className="text-text-primary text-xl font-bold">제11조 (준거법 및 관할)</h2>
          <p className="text-text-secondary mt-3 leading-7">
            이 약관의 해석 및 운영팀과 이용자 간의 분쟁에 대해서는 대한민국 법령을 적용하며, 분쟁
            발생 시 민사소송법에 따른 관할 법원에 제소합니다.
          </p>
        </section>

        <section className="border-border-subtle border-t pt-8">
          <h2 className="text-text-primary text-xl font-bold">문의</h2>
          <p className="text-text-secondary mt-3 leading-7">
            서비스 이용에 관한 문의는 아래 이메일로 연락해 주세요.
          </p>
          <p className="text-text-secondary mt-2">
            이메일:{" "}
            <a href="mailto:dnd9team@gmail.com" className="text-text-brand-default underline">
              dnd9team@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}

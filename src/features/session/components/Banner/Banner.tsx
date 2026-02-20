import { ButtonLink } from "@/components/Button/ButtonLink";

/**
 * Banner - 피드백 참여 유도 CTA 배너
 *
 * 역할:
 * - 사용자 피드백 참여를 유도하는 정적 배너
 * - 데이터 fetching 없음 (Server Component)
 */
export function Banner() {
  return (
    <section className="p-4xl relative flex h-[264px] w-full flex-col justify-center overflow-hidden rounded-sm bg-gradient-to-b from-gray-950 to-gray-900">
      {/* 배경 이미지 오버레이 (Optional) */}
      <div className="absolute inset-0 bg-[url('/images/banner-bg.png')] bg-cover bg-center opacity-5 mix-blend-overlay" />

      <div className="relative z-10 flex flex-col items-start gap-6">
        <div className="flex flex-col items-start gap-1">
          <h2 className="text-text-primary text-2xl leading-[1.4] font-bold whitespace-pre-wrap">
            GAK, 사용해보고 느낀 점을 알려주세요
            <br />
            지금은 피드백 각!
          </h2>
        </div>

        {/* TODO(이경환): 외부 구글 폼 URL 확정 후 href 교체 */}
        <ButtonLink
          href="https://forms.gle/placeholder"
          target="_blank"
          rel="noopener noreferrer"
          className="border-none bg-green-500 font-semibold text-gray-950 hover:bg-green-600"
          size="medium"
        >
          피드백 남기기
        </ButtonLink>
      </div>
    </section>
  );
}

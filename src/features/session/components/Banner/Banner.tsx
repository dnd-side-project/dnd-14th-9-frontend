import { ButtonLink } from "@/components/Button/ButtonLink";
import { ChevronRightIcon } from "@/components/Icon/ChevronRightIcon";

/**
 * Banner - 피드백 참여 유도 CTA 배너
 *
 * 역할:
 * - 사용자 피드백 참여를 유도하는 정적 배너
 * - 데이터 fetching 없음 (Server Component)
 */
export function Banner() {
  return (
    <section className="p-4xl relative flex h-[264px] w-full flex-col justify-center overflow-hidden rounded-sm bg-[linear-gradient(180deg,_var(--color-gray-800,_#33363D)_-30.1%,_var(--color-gray-900,_#1E2124)_100%)]">
      {/* 배경 오버레이: 정적 이미지 의존을 제거해 404 요청을 방지한다. */}
      <div className="absolute inset-0 bg-[radial-gradient(80%_120%_at_0%_0%,rgba(255,255,255,0.18),transparent_65%),radial-gradient(70%_90%_at_100%_10%,rgba(255,255,255,0.12),transparent_70%)] mix-blend-overlay" />

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
          variant="outlined"
          colorScheme="secondary"
          className="gap-xs py-sm pr-sm pl-lg rounded-sm"
          rightIcon={<ChevronRightIcon />}
          size="medium"
        >
          피드백 남기기
        </ButtonLink>
      </div>
    </section>
  );
}

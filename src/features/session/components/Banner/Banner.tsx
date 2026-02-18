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
    <section className="bg-surface-subtle px-xl py-lg flex items-center justify-between rounded-lg">
      <div className="gap-xs flex flex-col">
        <h2 className="text-text-primary text-lg font-bold">서비스 경험을 들려주세요</h2>
        <p className="text-text-secondary text-sm">여러분의 피드백이 더 나은 서비스를 만듭니다</p>
      </div>

      {/* TODO(이경환): 외부 구글 폼 URL 확정 후 href 교체 */}
      <ButtonLink
        href="https://forms.gle/placeholder"
        target="_blank"
        rel="noopener noreferrer"
        variant="solid"
        size="medium"
      >
        피드백 남기기
      </ButtonLink>
    </section>
  );
}

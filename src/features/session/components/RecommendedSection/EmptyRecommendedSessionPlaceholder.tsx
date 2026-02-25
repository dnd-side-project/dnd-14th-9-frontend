import { ButtonLink } from "@/components/Button/ButtonLink";

interface EmptyRecommendedSessionPlaceholderProps {
  nickname: string;
  categoryLabel: string;
}

export function EmptyRecommendedSessionPlaceholder({
  nickname,
  categoryLabel,
}: EmptyRecommendedSessionPlaceholderProps) {
  return (
    <div className="bg-surface-strong border-border-default gap-xl p-4xl flex w-full flex-col items-center justify-center rounded-sm border">
      <div className="text-text-primary text-center text-[24px] leading-[1.4] font-bold">
        <p className="m-0">
          {nickname}님, <span className="text-surface-primary-default">{categoryLabel}</span>에도
          관심이 있으신가요?
        </p>
        <p className="m-0">그렇다면 세션을 직접 만들어보세요!</p>
      </div>
      <ButtonLink
        href="/session/create"
        variant="outlined"
        colorScheme="secondary"
        size="medium"
        hardNavigate
      >
        세션 만들기
      </ButtonLink>
    </div>
  );
}

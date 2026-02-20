import Link from "next/link";

interface EmptyRecommendedSessionPlaceholderProps {
  nickname: string;
  categoryLabel: string;
}

export function EmptyRecommendedSessionPlaceholder({
  nickname,
  categoryLabel,
}: EmptyRecommendedSessionPlaceholderProps) {
  return (
    <div className="bg-alpha-white-8 border-border-gray-default gap-xl p-4xl flex w-full flex-col items-center justify-center rounded-sm border border-solid">
      <div className="font-pretendard text-text-primary text-center text-[24px] leading-[1.4] font-bold">
        <p className="m-0">
          {nickname}님, <span className="text-surface-primary-default">{categoryLabel}</span>에도
          관심이 있으신가요?
        </p>
        <p className="m-0">관련 세션을 만들어 보세요!</p>
      </div>
      <Link href="/session/create" passHref legacyBehavior>
        <a className="bg-surface-primary-default gap-xs px-md py-2xs flex h-[44px] shrink-0 items-center justify-center rounded-md">
          <span className="font-pretendard text-text-inverse text-[14px] leading-[1.4] font-semibold">
            세션 만들기
          </span>
        </a>
      </Link>
    </div>
  );
}

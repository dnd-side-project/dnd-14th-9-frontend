import { ChipBadge } from "@/components/ChipBadge/ChipBadge";

interface ChatSessionInfoProps {
  category: string;
  title: string;
  description: string;
  notice: string;
  participantCount: number;
}

export function ChatSessionInfo({
  category,
  title,
  description,
  notice,
  participantCount,
}: ChatSessionInfoProps) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <ChipBadge radius="xs" className="w-fit border-0">
          {category}
        </ChipBadge>
        <div className="flex items-center gap-3">
          <h2 className="text-text-primary text-2xl font-bold">{title}</h2>
          <span className="text-text-disabled text-base">{participantCount}명</span>
        </div>
        <p className="text-text-tertiary text-[15px]">{description}</p>
      </div>

      {notice && (
        <div className="px-lg py-sm gap-md flex flex-row items-center rounded-lg bg-gray-900">
          <p className="text-common-white shrink-0 text-sm font-semibold">공지사항</p>
          <p className="text-sm text-gray-400">{notice}</p>
        </div>
      )}
    </>
  );
}

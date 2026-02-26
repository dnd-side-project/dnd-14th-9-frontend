import { Avatar } from "@/components/Avatar/Avatar";
import { Badge } from "@/components/Badge/Badge";
import { Button } from "@/components/Button/Button";
import { CATEGORY_LABELS, type Category } from "@/lib/constants/category";
import { cn } from "@/lib/utils/utils";

import { useMe } from "../../hooks/useMemberHooks";

interface OnboardingConfirmProps {
  className?: string;
  nickname: string;
  categories: Category[];
  onBack?: () => void;
  onConfirm?: () => void;
}

const RANK_LABELS = ["1순위", "2순위", "3순위"] as const;

export function OnboardingConfirm({
  className,
  nickname,
  categories,
  onBack,
  onConfirm,
}: OnboardingConfirmProps) {
  const { data: meData } = useMe();
  const profileImageUrl = meData?.result?.profileImageUrl ?? null;

  return (
    <div
      className={cn(
        "p-3xl gap-3xl border-sm border-border-default bg-surface-default flex min-w-110 flex-col rounded-lg shadow-[0_0_2px_0_rgba(0,0,0,0.08),0_16px_24px_0_rgba(0,0,0,0.12)]",
        className
      )}
    >
      {/* Header */}
      <div className="gap-2xs flex flex-col justify-center">
        <h1 className="text-text-primary text-2xl font-bold">프로필 설정 완료!</h1>
        <p className="text-text-secondary text-sm">이제 맞춤 추천 세션을 찾아볼까요?</p>
      </div>

      <div className="gap-lg flex flex-col">
        <div className="gap-sm flex flex-col items-center">
          {/* Avatar */}
          <Avatar
            size="xlarge"
            type={profileImageUrl ? "image" : "empty"}
            src={profileImageUrl ?? undefined}
            alt={`${nickname} 프로필 이미지`}
            className="h-16 w-16"
          />

          {/* Nickname */}
          <div className="flex w-full flex-col gap-2">
            <span className="text-text-primary text-sm font-semibold">닉네임</span>
            <div className="border-sm border-border-default bg-surface-strong text-text-primary font-regular items-center gap-2 rounded-sm p-4">
              {nickname}
            </div>
          </div>
        </div>
        {/* Categories */}
        <div className="gap-md flex w-full flex-wrap items-center">
          {categories.map((category, index) => (
            <div key={category} className="gap-xs flex items-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-text-primary text-xs font-semibold">
                  {RANK_LABELS[index]}
                </span>
                {index === 0 && (
                  <span className="text-text-status-negative-default text-[13px] font-semibold">
                    *
                  </span>
                )}
              </div>
              <Badge status="inProgress" radius="max">
                {CATEGORY_LABELS[category]}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex w-full gap-3">
        <Button
          variant="solid"
          colorScheme="tertiary"
          className="flex-1 items-center justify-center px-5 py-3 text-sm font-semibold"
          onClick={onBack}
        >
          뒤로가기
        </Button>
        <Button
          variant="solid"
          colorScheme="primary"
          className="flex-1 items-center justify-center px-5 py-3 text-sm font-semibold"
          onClick={onConfirm}
        >
          확인
        </Button>
      </div>
    </div>
  );
}

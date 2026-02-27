import { memo } from "react";

import { Avatar } from "@/components/Avatar/Avatar";
import { Badge } from "@/components/Badge/Badge";
import type { MemberProfileView } from "@/features/member/types";
import { cn } from "@/lib/utils/utils";

function SkeletonBlock({ className }: { className: string }) {
  return <div className={cn("bg-surface-strong animate-pulse rounded-sm", className)} />;
}

function AccountProfileCardSkeleton() {
  return (
    <div className="bg-surface-strong p-lg rounded-sm">
      <div className="gap-lg flex items-center">
        <SkeletonBlock className="h-10 w-10 shrink-0 rounded-full" />
        <div className="gap-xs flex flex-col">
          <SkeletonBlock className="h-5 w-24" />
          <SkeletonBlock className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

export const AccountProfileCard = memo(function AccountProfileCard({
  profile,
  isLoading,
}: {
  profile: MemberProfileView | undefined;
  isLoading: boolean;
}) {
  return (
    <div className="gap-lg flex flex-col">
      <h4 className="text-text-primary text-lg font-bold">탈퇴하려는 계정</h4>
      {isLoading ? (
        <AccountProfileCardSkeleton />
      ) : profile ? (
        <div className="bg-surface-strong gap-lg p-lg flex rounded-sm">
          <Avatar
            type={profile.profileImageUrl ? "image" : "empty"}
            src={profile.profileImageUrl ?? undefined}
            alt={profile.nickname}
            size="large"
            className="h-10 w-10"
          />
          <div className="gap-xs flex flex-col justify-center">
            <p className="text-text-primary text-lg font-bold">{profile.nickname}</p>
            <Badge
              status="closed"
              radius="xs"
              className="bg-alpha-white-8 text-text-secondary px-xs py-2xs border-none text-xs font-semibold"
            >
              {profile.email}
            </Badge>
          </div>
        </div>
      ) : null}
    </div>
  );
});

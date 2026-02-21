"use client";

import { Avatar } from "@/components/Avatar/Avatar";
import { useMe } from "@/features/member/hooks/useMemberHooks";

export function ProfileSummary() {
  const { data } = useMe();
  const profile = data?.result;

  if (!profile) return null;

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 py-8">
      <Avatar
        src={profile.profileImageUrl ?? undefined}
        alt={profile.nickname}
        size="xlarge"
        className="h-[88px] w-[88px]"
      />
      <div className="flex flex-col items-center justify-center gap-1">
        <h2 className="text-text-normal font-pretendard text-2xl font-bold">{profile.nickname}</h2>
        {/* bio가 MemberProfileView에 추가된다면 아래 주석을 해제하거나 활용 */}
        {/* <p className="text-text-subtle text-base font-normal">{profile.bio}</p> */}
      </div>
    </div>
  );
}

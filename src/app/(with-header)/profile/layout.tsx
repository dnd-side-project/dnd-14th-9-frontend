import { ReactNode } from "react";

import { ProfileSummary } from "@/features/member/components/Profile/ProfileSummary";
import { ProfileTabs } from "@/features/member/components/Profile/ProfileTabs";

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="mx-auto flex w-full flex-col gap-[64px] px-6 py-[64px] md:px-[54px]">
      <ProfileSummary />
      <div className="flex flex-col gap-[64px]">
        <ProfileTabs />
        {children}
      </div>
    </div>
  );
}

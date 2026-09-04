import { ReactNode } from "react";

import { ProfileSummary } from "@/features/member/components/Profile/ProfileSummary";
import { ProfileTabs } from "@/features/member/components/Profile/ProfileTabs";

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="gap-2xl py-2xl mx-auto flex w-full flex-col px-0 md:gap-16 md:px-10 md:py-16 xl:px-[54px]">
      <div className="px-5 md:px-0">
        <ProfileSummary />
      </div>
      <div className="gap-2xl flex flex-col md:gap-16">
        <ProfileTabs />
        <div className="px-5 md:px-0">{children}</div>
      </div>
    </div>
  );
}

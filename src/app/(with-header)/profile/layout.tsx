import { ReactNode } from "react";

import { ProfileSummary } from "@/features/member/components/Profile/ProfileSummary";
import { ProfileTabs } from "@/features/member/components/Profile/ProfileTabs";

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="gap-2xl py-2xl mx-auto flex w-full flex-col px-5 md:gap-16 md:px-10 md:py-16 xl:px-[54px]">
      <ProfileSummary />
      <div className="gap-2xl flex flex-col md:gap-16">
        <ProfileTabs />
        {children}
      </div>
    </div>
  );
}

import { ReactNode } from "react";

import { ProfileSummary } from "@/features/member/components/Profile/ProfileSummary";
import { ProfileTabs } from "@/features/member/components/Profile/ProfileTabs";

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="mx-auto flex w-full flex-col gap-16 px-6 pt-16 pb-36 md:px-[54px]">
      <ProfileSummary />
      <div className="flex flex-col gap-20">
        <ProfileTabs />
        {children}
      </div>
    </div>
  );
}

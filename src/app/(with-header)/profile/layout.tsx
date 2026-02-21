import { ReactNode } from "react";

import { ProfileSummary } from "@/features/member/components/Profile/ProfileSummary";
import { ProfileTabs } from "@/features/member/components/Profile/ProfileTabs";

interface ProfileLayoutProps {
  children: ReactNode;
}

export default function ProfileLayout({ children }: ProfileLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col items-center">
      <ProfileSummary />
      <div className="w-full">
        <ProfileTabs />
      </div>
      <div className="w-full pt-6 pb-20">{children}</div>
    </div>
  );
}

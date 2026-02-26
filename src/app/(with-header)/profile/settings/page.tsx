import type { Metadata } from "next";

import { ProfileEditForm } from "@/features/member/components/Profile/ProfileEditForm";

export const metadata: Metadata = {
  title: "설정",
  description: "프로필 및 계정 설정을 관리하세요.",
};

export default function ProfileSettingsPage() {
  return (
    <div className="w-full">
      <ProfileEditForm />
    </div>
  );
}

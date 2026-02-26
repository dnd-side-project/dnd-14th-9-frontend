import { ProfileEditForm } from "@/features/member/components/Profile/ProfileEditForm";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "설정",
  description: "프로필 및 계정 설정을 관리하세요.",
  noIndex: true,
});

export default function ProfileSettingsPage() {
  return (
    <div className="w-full">
      <ProfileEditForm />
    </div>
  );
}

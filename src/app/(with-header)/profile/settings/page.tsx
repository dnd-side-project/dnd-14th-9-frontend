import { ProfileEditForm } from "@/features/member/components/Profile/ProfileEditForm";

export const metadata = { title: "설정" };

export default function ProfileSettingsPage() {
  return (
    <div className="w-full">
      <ProfileEditForm />
    </div>
  );
}

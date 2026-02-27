import { ProfileAccountContent } from "@/features/member/components/Profile/ProfileAccountContent";

export const metadata = { title: "계정 관리" };

export default function ProfileAccountPage() {
  return (
    <div className="w-full">
      <ProfileAccountContent />
    </div>
  );
}

import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "개인정보 처리방침",
  description: "GAK 서비스 개인정보 처리방침입니다.",
  pathname: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold">개인정보 처리방침</h1>
      <p className="text-text-muted mt-4">준비 중입니다.</p>
    </div>
  );
}

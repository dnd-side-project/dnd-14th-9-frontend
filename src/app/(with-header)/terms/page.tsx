import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "이용약관",
  description: "GAK 서비스 이용약관입니다.",
  pathname: "/terms",
});

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold">이용약관</h1>
      <p className="text-text-muted mt-4">준비 중입니다.</p>
    </div>
  );
}

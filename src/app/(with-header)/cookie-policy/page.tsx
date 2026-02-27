import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "쿠키 정책",
  description: "GAK 서비스 쿠키 정책입니다.",
  pathname: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-2xl font-bold">쿠키 정책</h1>
      <p className="text-text-muted mt-4">준비 중입니다.</p>
    </div>
  );
}

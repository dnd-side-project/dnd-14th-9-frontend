import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata = createPageMetadata({
  title: "피드백",
  description: "각 서비스에 대한 피드백을 남겨주세요.",
  noIndex: true,
});

export default function FeedbackPage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-16">
      <h1 className="text-2xl font-bold text-gray-50">피드백</h1>
      <p className="mt-3 text-base text-gray-400">
        임시 페이지입니다. 추후 피드백 화면이 이 경로에 연결됩니다.
      </p>
    </main>
  );
}

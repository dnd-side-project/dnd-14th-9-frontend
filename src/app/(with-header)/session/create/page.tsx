import { SessionCreateForm } from "@/features/session/components/SessionCreateForm";

export const metadata = { title: "세션 만들기" };

export default function SessionCreatePage() {
  return (
    <main className="p-md md:p-xl xl:p-3xl mx-auto w-full max-w-7xl">
      {/* 제목 섹션 */}
      <header className="mb-xl md:mb-2xl">
        <h1 className="text-lg leading-[140%] font-bold text-gray-50 md:text-2xl">세션 만들기</h1>
        <p className="mt-2xs text-[13px] text-gray-500 md:text-base">
          함께 집중할 공간을 만들어보세요
        </p>
      </header>

      {/* 폼 섹션 */}
      <SessionCreateForm />
    </main>
  );
}

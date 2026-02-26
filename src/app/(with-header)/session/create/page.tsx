import { SessionCreateForm } from "@/features/session/components/SessionCreateForm";

export default function SessionCreatePage() {
  return (
    <main className="p-3xl mx-auto w-full max-w-7xl">
      {/* 제목 섹션 */}
      <header className="mb-2xl">
        <h1 className="text-2xl leading-[140%] font-bold text-gray-50">세션 만들기</h1>
        <p className="mt-2xs text-base text-gray-500">함께 집중할 공간을 만들어보세요</p>
      </header>

      {/* 폼 섹션 */}
      <SessionCreateForm />
    </main>
  );
}

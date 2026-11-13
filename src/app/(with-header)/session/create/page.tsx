import { SessionCreateForm } from "@/features/session/components/SessionCreateForm";

export const metadata = { title: "새로운 세션 만들기" };

export default function SessionCreatePage() {
  // 하단 패딩에는 푸터와의 간격(모바일 16 / md 이상 40)이 포함되어 있다.
  return (
    <div className="mx-auto w-full max-w-7xl px-5 pt-9 pb-14 md:px-10 md:pt-10 md:pb-26 xl:px-[54px]">
      {/* 제목 섹션 */}
      <header className="mb-6 md:mb-10 xl:mb-16">
        <h1 className="text-text-primary text-lg leading-[1.4] font-bold md:text-2xl">
          새로운 세션 만들기
        </h1>
        <p className="text-text-secondary mt-0.5 text-[13px] leading-[1.4] md:mt-1 md:text-[15px]">
          함께 집중할 세션을 만들어 볼까요?
        </p>
      </header>

      {/* 폼 섹션 */}
      <SessionCreateForm />
    </div>
  );
}

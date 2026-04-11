import { ErrorFallbackUI } from "@/components/Error/ErrorFallbackUI";
import { Header } from "@/components/Header/Header";

export default async function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="gap-2xl mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center md:px-[250px]">
        <ErrorFallbackUI
          title="Page not found"
          description={
            "Ooops.. 요청하신 페이지가 삭제되었거나 주소가 변경되었어요.\n다른 모집 중인 세션을 둘러보실래요?"
          }
          buttonLabel="홈으로 가기"
          href="/"
        />
      </main>
    </div>
  );
}

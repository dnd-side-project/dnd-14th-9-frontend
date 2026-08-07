import { ErrorFallbackUI } from "@/components/Error/ErrorFallbackUI";

export default function SessionNotFound() {
  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-20 md:px-[250px]">
      <ErrorFallbackUI
        title="Session not found"
        description={"존재하지 않는 세션입니다.\n삭제되었거나 잘못된 주소일 수 있어요."}
        buttonLabel="홈으로 가기"
        href="/"
      />
    </div>
  );
}

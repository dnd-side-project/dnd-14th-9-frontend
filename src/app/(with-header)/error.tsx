"use client";

import { useEffect } from "react";

import { ErrorFallbackUI } from "@/components/Error/ErrorFallbackUI";

export default function WithHeaderError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("WithHeader Route Error:", error);
  }, [error]);

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4 py-20 md:px-[250px]">
      <ErrorFallbackUI
        title="Error"
        description={"데이터를 불러오는 데 문제가 발생했어요.\n잠시 후 다시 시도해주실래요?"}
        buttonLabel="다시 시도"
        onRetry={() => reset()}
      />
    </div>
  );
}

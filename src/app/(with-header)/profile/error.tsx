"use client";

import { useEffect } from "react";

import { ErrorFallbackUI } from "@/components/Error/ErrorFallbackUI";

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Profile Error:", error);
  }, [error]);

  return (
    <div className="flex w-full flex-col py-10">
      <ErrorFallbackUI
        title="Error"
        description={"프로필 정보를 불러오는 데 문제가 발생했어요.\n잠시 후 다시 시도해주실래요?"}
        buttonLabel="다시 시도"
        onRetry={() => reset()}
      />
    </div>
  );
}

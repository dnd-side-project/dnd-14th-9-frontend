"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";
import { ArrowLeftIcon } from "@/components/Icon/ArrowLeftIcon";

export function LobbyHeader() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="mb-2xl flex items-start justify-between">
      <div className="gap-sm flex items-start">
        <button
          type="button"
          onClick={handleBack}
          aria-label="뒤로 가기"
          className="text-text-muted hover:text-text-secondary mt-1 shrink-0 cursor-pointer transition-colors"
        >
          <ArrowLeftIcon size="medium" />
        </button>

        <div>
          <h1 className="text-[24px] leading-[140%] font-bold text-gray-50">세션 시작 대기 방</h1>
          <p className="mt-2xs text-base text-gray-500">
            세션 시작 전 대기 방이에요. 세션은 시간이 되면 자동 시작되요
          </p>
        </div>
      </div>

      <Button variant="outlined" colorScheme="secondary" size="small" onClick={handleBack}>
        나가기
      </Button>
    </header>
  );
}

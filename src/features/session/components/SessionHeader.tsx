"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";

export function SessionHeader() {
  const router = useRouter();

  const handleExit = () => {
    // TODO: 세션 나가기 API 호출 후 이동
    router.push("/");
  };

  return (
    <header className="mb-2xl flex items-start justify-between">
      <div>
        <h1 className="text-[24px] leading-[140%] font-bold text-gray-50">진행 중인 세션</h1>
      </div>

      <Button variant="outlined" colorScheme="secondary" size="small" onClick={handleExit}>
        나가기
      </Button>
    </header>
  );
}

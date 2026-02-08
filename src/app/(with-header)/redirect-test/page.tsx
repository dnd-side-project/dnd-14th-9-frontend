"use client";

import { Button } from "@/components/Button/Button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function RedirectTestPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.toString();
  const currentPathWithQuery = `${pathname}${query ? `?${query}` : ""}`;
  const loginPath = `/login?next=${encodeURIComponent(currentPathWithQuery)}`;

  const openLogin = () => {
    router.push(loginPath);
  };

  const openQueryCase = () => {
    router.push("/redirect-test?from=redirect-test&tab=search");
  };

  return (
    <section className="mx-auto w-full max-w-[42rem] px-4 py-12 [text-orientation:mixed] [writing-mode:horizontal-tb]">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight">로그인 복귀 테스트 페이지 (임시)</h1>
        <p className="mt-3 text-sm leading-6 text-gray-700">
          현재 위치를 <code className="rounded bg-gray-100 px-1 py-0.5">{`next`}</code> 파라미터로
          넘겨 로그인 후 동일 위치로 복귀되는지 확인하는 용도입니다.
        </p>

        <div className="mt-6 space-y-3 rounded-lg bg-gray-50 p-4 text-sm text-gray-800">
          <p>
            <span className="font-semibold">현재 경로:</span>{" "}
            <code className="rounded bg-white px-1 py-0.5 break-all">{currentPathWithQuery}</code>
          </p>
          <p>
            <span className="font-semibold">로그인 이동 경로:</span>{" "}
            <code className="rounded bg-white px-1 py-0.5 break-all">{loginPath}</code>
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={openLogin}>현재 경로로 로그인 테스트</Button>
          <Button variant="secondary" onClick={openQueryCase}>
            쿼리 포함 케이스 열기
          </Button>
        </div>
      </div>
    </section>
  );
}

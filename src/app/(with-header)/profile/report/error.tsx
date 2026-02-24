"use client";

export default function ReportError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">리포트를 불러올 수 없습니다</h2>
      <p className="text-gray-600">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        다시 시도
      </button>
    </div>
  );
}

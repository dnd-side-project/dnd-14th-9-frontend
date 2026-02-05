"use client";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (provider: "google" | "kakao") => void;
  from: string | null;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* 모달 컨텐츠 */}
      <div className="relative z-10 min-h-[300px] w-[90vw] max-w-[400px] rounded-lg bg-white p-6 shadow-xl">
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* 제목 */}
        <h2 className="mb-6 text-center text-xl font-bold">로그인</h2>

        {/* 로그인 버튼들 */}
        <div className="flex flex-col gap-3">
          {/* 구글 로그인 */}
          <button
            onClick={() => onLogin("google")}
            className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-center hover:bg-gray-50"
          >
            구글로 로그인
          </button>

          {/* 카카오 로그인 */}
          <button
            onClick={() => onLogin("kakao")}
            className="w-full rounded bg-yellow-400 px-4 py-3 text-center hover:bg-yellow-500"
          >
            카카오로 로그인
          </button>
        </div>
      </div>
    </div>
  );
}

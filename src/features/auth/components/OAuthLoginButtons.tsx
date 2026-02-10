"use client";

interface OAuthLoginButtonsProps {
  onLogin: (provider: "google" | "kakao") => void;
}

export function OAuthLoginButtons({ onLogin }: OAuthLoginButtonsProps) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => onLogin("google")}
        className="w-full rounded border border-gray-300 bg-white px-4 py-3 text-center hover:bg-gray-50"
      >
        구글로 로그인
      </button>
      <button
        type="button"
        onClick={() => onLogin("kakao")}
        className="w-full rounded bg-yellow-400 px-4 py-3 text-center hover:bg-yellow-500"
      >
        카카오로 로그인
      </button>
    </div>
  );
}

"use client";

import { OAuthLoginButtons } from "@/features/auth/components/OAuthLoginButtons";

interface LoginCardProps {
  reasonMessage?: string | null;
  onLogin: (provider: "google" | "kakao") => void;
  onClose?: () => void;
}

export function LoginCard({ reasonMessage, onLogin, onClose }: LoginCardProps) {
  return (
    <div className="relative z-10 min-h-[300px] w-[90vw] max-w-[400px] rounded-lg bg-white p-6 shadow-xl">
      {onClose ? (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      ) : null}

      <h2 className="mb-6 text-center text-xl font-bold">로그인</h2>
      {reasonMessage ? (
        <p className="mb-4 text-center text-sm text-red-600">{reasonMessage}</p>
      ) : null}
      <OAuthLoginButtons onLogin={onLogin} />
    </div>
  );
}

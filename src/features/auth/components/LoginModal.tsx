"use client";

import { LoginCard } from "@/features/auth/components/LoginCard";
import { useRouter } from "next/navigation";

interface LoginModalProps {
  nextPath: string;
}

export function LoginModal({ nextPath }: LoginModalProps) {
  const router = useRouter();

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(nextPath);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      <div className="relative z-10">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <LoginCard nextPath={nextPath} />
      </div>
    </div>
  );
}

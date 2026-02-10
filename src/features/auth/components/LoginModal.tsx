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
    <div className="p-2xs fixed inset-0 z-50 flex items-center justify-center">
      {/* 오버레이 */}
      <div className="bg-overlay-default fixed inset-0" />

      <div className="relative z-10">
        <LoginCard nextPath={nextPath} onClose={handleClose} />
      </div>
    </div>
  );
}

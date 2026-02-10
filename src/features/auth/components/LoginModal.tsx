"use client";

import { LoginCard } from "@/features/auth/components/LoginCard";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (provider: "google" | "kakao") => void;
}

export function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <LoginCard onClose={onClose} onLogin={onLogin} />
    </div>
  );
}

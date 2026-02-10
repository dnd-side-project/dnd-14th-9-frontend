"use client";

import { LoginCard } from "@/features/auth/components/LoginCard";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextPath: string;
}

export function LoginModal({ isOpen, onClose, nextPath }: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 오버레이 */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className="relative z-10">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-2xl text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
        <LoginCard nextPath={nextPath} />
      </div>
    </div>
  );
}

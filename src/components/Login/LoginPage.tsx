"use client";

import { LoginCard } from "@/components/Login/LoginCard";

interface LoginPageProps {
  reasonMessage: string | null;
  onLogin: (provider: "google" | "kakao") => void;
}

export function LoginPage({ reasonMessage, onLogin }: LoginPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <LoginCard reasonMessage={reasonMessage} onLogin={onLogin} />
    </main>
  );
}

"use client";

import { useState } from "react";

import { OAuthProviderButton } from "@/features/auth/components/OAuthProviderButton";
import { LOGIN_PROVIDERS, type LoginProvider } from "@/lib/auth/auth-constants";

interface OAuthLoginFormProps {
  nextPath: string;
}

export function OAuthLoginForm({ nextPath }: OAuthLoginFormProps) {
  const [googleProvider, kakaoProvider] = LOGIN_PROVIDERS;
  const [loadingProvider, setLoadingProvider] = useState<LoginProvider | null>(null);

  const handleSubmit = (provider: LoginProvider) => {
    setLoadingProvider(provider);
  };

  return (
    <div className="w-[360px]">
      <p className="sr-only" aria-live="polite">
        {loadingProvider === kakaoProvider
          ? "카카오 로그인 중…"
          : loadingProvider === googleProvider
            ? "구글 로그인 중…"
            : ""}
      </p>

      <div className="gap-sm flex flex-col">
        <OAuthProviderButton
          provider={kakaoProvider}
          nextPath={nextPath}
          loadingProvider={loadingProvider}
          onSubmit={handleSubmit}
        />
        <OAuthProviderButton
          provider={googleProvider}
          nextPath={nextPath}
          loadingProvider={loadingProvider}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

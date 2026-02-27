"use client";

import { useEffect, useState } from "react";

import { OAuthProviderItem } from "@/features/auth/components/OAuthProviderItem";
import {
  getLastLoginProvider,
  saveLastLoginProvider,
} from "@/features/auth/lib/last-login-provider";
import { LOGIN_PROVIDERS, type LoginProvider } from "@/lib/auth/login-policy";

interface OAuthLoginFormProps {
  nextPath: string;
}

export function OAuthLoginForm({ nextPath }: OAuthLoginFormProps) {
  const [googleProvider, kakaoProvider] = LOGIN_PROVIDERS;
  const [loadingProvider, setLoadingProvider] = useState<LoginProvider | null>(null);
  const [lastLoginProvider, setLastLoginProvider] = useState<LoginProvider | null>(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLastLoginProvider(getLastLoginProvider());
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSubmit = (provider: LoginProvider) => {
    saveLastLoginProvider(provider);
    setLastLoginProvider(provider);
    setLoadingProvider(provider);
  };

  const guideTargetProvider = lastLoginProvider ?? kakaoProvider;
  const guideMessage = lastLoginProvider ? "최근 로그인됐어요" : "3초만에 회원가입하기";
  const shouldShowGuide = (provider: LoginProvider) => guideTargetProvider === provider;

  return (
    <div className="w-[360px] max-w-full">
      <p className="sr-only" aria-live="polite">
        {loadingProvider === kakaoProvider
          ? "카카오 로그인 중…"
          : loadingProvider === googleProvider
            ? "구글 로그인 중…"
            : ""}
      </p>

      <div className="gap-lg flex flex-col">
        <OAuthProviderItem
          provider={kakaoProvider}
          nextPath={nextPath}
          loadingProvider={loadingProvider}
          guideMessage={shouldShowGuide(kakaoProvider) ? guideMessage : undefined}
          onSubmit={handleSubmit}
        />

        <OAuthProviderItem
          provider={googleProvider}
          nextPath={nextPath}
          loadingProvider={loadingProvider}
          guideMessage={shouldShowGuide(googleProvider) ? guideMessage : undefined}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}

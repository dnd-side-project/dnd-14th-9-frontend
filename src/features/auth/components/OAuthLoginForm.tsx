"use client";

import { type FormEvent, useState } from "react";

import { OAuthProviderButton } from "@/features/auth/components/OAuthProviderButton";
import { LOGIN_PROVIDERS } from "@/lib/auth/auth-constants";

interface OAuthLoginFormProps {
  nextPath: string;
}

export function OAuthLoginForm({ nextPath }: OAuthLoginFormProps) {
  type LoginProvider = (typeof LOGIN_PROVIDERS)[number];
  const [googleProvider, kakaoProvider] = LOGIN_PROVIDERS;
  const [loadingProvider, setLoadingProvider] = useState<LoginProvider | null>(null);
  const isLoginProvider = (provider: string): provider is LoginProvider =>
    provider === googleProvider || provider === kakaoProvider;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;

    if (!(submitter instanceof HTMLButtonElement)) {
      return;
    }

    const provider = submitter.value;
    if (isLoginProvider(provider)) {
      setLoadingProvider(provider);
    }
  };

  return (
    <form action="/api/auth/login" method="get" className="w-[360px]" onSubmit={handleSubmit}>
      <input type="hidden" name="next" value={nextPath} />
      <p className="sr-only" aria-live="polite">
        {loadingProvider === kakaoProvider
          ? "카카오 로그인 중…"
          : loadingProvider === googleProvider
            ? "구글 로그인 중…"
            : ""}
      </p>

      <div className="gap-sm flex flex-col">
        <OAuthProviderButton provider={kakaoProvider} loadingProvider={loadingProvider} />
        <OAuthProviderButton provider={googleProvider} loadingProvider={loadingProvider} />
      </div>
    </form>
  );
}

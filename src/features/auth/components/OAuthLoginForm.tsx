"use client";

import { useState } from "react";

import { SocialLoginButton } from "@/features/auth/components/SocialLoginButton";
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
        <form
          action="/api/auth/login"
          method="get"
          className="w-[360px]"
          onSubmit={() => handleSubmit(kakaoProvider)}
        >
          <input type="hidden" name="provider" value={kakaoProvider} />
          <input type="hidden" name="next" value={nextPath} />
          <SocialLoginButton
            provider={kakaoProvider}
            type="submit"
            isLoading={loadingProvider === kakaoProvider}
            disabled={loadingProvider !== null}
          />
        </form>

        <form
          action="/api/auth/login"
          method="get"
          className="w-[360px]"
          onSubmit={() => handleSubmit(googleProvider)}
        >
          <input type="hidden" name="provider" value={googleProvider} />
          <input type="hidden" name="next" value={nextPath} />
          <SocialLoginButton
            provider={googleProvider}
            type="submit"
            isLoading={loadingProvider === googleProvider}
            disabled={loadingProvider !== null}
          />
        </form>
      </div>
    </div>
  );
}

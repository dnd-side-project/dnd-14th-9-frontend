"use client";

import { useState, useSyncExternalStore } from "react";

import { GuideBox } from "@/features/auth/components/GuideBox";
import { SocialLoginButton } from "@/features/auth/components/SocialLoginButton";
import {
  getLastLoginProvider,
  saveLastLoginProvider,
} from "@/features/auth/lib/last-login-provider";
import { LOGIN_PROVIDERS, type LoginProvider } from "@/lib/auth/login-policy";

interface OAuthLoginFormProps {
  nextPath: string;
}

const subscribeLastLoginProvider = () => () => undefined;

export function OAuthLoginForm({ nextPath }: OAuthLoginFormProps) {
  const [googleProvider, kakaoProvider] = LOGIN_PROVIDERS;
  const [loadingProvider, setLoadingProvider] = useState<LoginProvider | null>(null);
  const lastLoginProvider = useSyncExternalStore(
    subscribeLastLoginProvider,
    getLastLoginProvider,
    () => null
  );

  const handleSubmit = (provider: LoginProvider) => {
    saveLastLoginProvider(provider);
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
        <div className="relative w-full">
          {shouldShowGuide(kakaoProvider) ? (
            <div className="pointer-events-none absolute bottom-[calc(100%+15px)] left-1/2 z-20 -translate-x-1/2">
              <GuideBox>{guideMessage}</GuideBox>
            </div>
          ) : null}

          <form
            action="/api/auth/login"
            method="get"
            className="w-full"
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
        </div>

        <div className="relative w-full">
          {shouldShowGuide(googleProvider) ? (
            <div className="pointer-events-none absolute bottom-[calc(100%+15px)] left-1/2 z-20 -translate-x-1/2">
              <GuideBox>{guideMessage}</GuideBox>
            </div>
          ) : null}

          <form
            action="/api/auth/login"
            method="get"
            className="w-full"
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
    </div>
  );
}

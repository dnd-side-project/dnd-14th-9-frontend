"use client";

import { Button } from "@/components/Button/Button";
import { GoogleIcon } from "@/components/Icon/GoogleIcon";
import { KakaoIcon } from "@/components/Icon/KakaoIcon";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import { LOGIN_PROVIDERS } from "@/lib/auth/auth-constants";
import { useState } from "react";

interface OAuthLoginButtonsProps {
  nextPath: string;
}

export function OAuthLoginButtons({ nextPath }: OAuthLoginButtonsProps) {
  type LoginProvider = (typeof LOGIN_PROVIDERS)[number];
  const [googleProvider, kakaoProvider] = LOGIN_PROVIDERS;
  const [loadingProvider, setLoadingProvider] = useState<LoginProvider | null>(null);
  const isKakaoLoading = loadingProvider === kakaoProvider;
  const isGoogleLoading = loadingProvider === googleProvider;

  const handleSubmit = (provider: LoginProvider) => {
    setLoadingProvider(provider);
  };

  return (
    <div className="gap-sm flex flex-col">
      <p className="sr-only" aria-live="polite">
        {isKakaoLoading ? "카카오 로그인 중…" : isGoogleLoading ? "구글 로그인 중…" : ""}
      </p>

      <form
        action="/api/auth/login"
        method="get"
        className="w-[360px]"
        onSubmit={() => handleSubmit(kakaoProvider)}
      >
        <input type="hidden" name="provider" value={kakaoProvider} />
        <input type="hidden" name="next" value={nextPath} />
        <Button
          type="submit"
          variant="solid"
          className="px-sm py-md gap-none h-14 w-full bg-[#FEE500] text-gray-900 hover:bg-[#FDD835] active:bg-[#FBC02D] disabled:bg-[#FEE500] disabled:text-gray-900 disabled:hover:bg-[#FEE500] disabled:active:bg-[#FEE500]"
          disabled={loadingProvider !== null}
          aria-busy={isKakaoLoading}
          leftIcon={isKakaoLoading ? undefined : <KakaoIcon size="small" />}
        >
          {isKakaoLoading ? (
            <span className="flex w-full items-center justify-center">
              <LoadingSpinner size={20} />
            </span>
          ) : (
            <span className="font-pretendard px-lg flex flex-[1_0_0] items-center justify-center text-center text-lg leading-[140%] font-semibold">
              카카오 계정으로 로그인
            </span>
          )}
        </Button>
      </form>

      <form
        action="/api/auth/login"
        method="get"
        className="w-[360px]"
        onSubmit={() => handleSubmit(googleProvider)}
      >
        <input type="hidden" name="provider" value={googleProvider} />
        <input type="hidden" name="next" value={nextPath} />
        <Button
          type="submit"
          variant="solid"
          className="bg-common-white text-alpha-black-64 px-sm py-md disabled:bg-common-white disabled:text-alpha-black-64 disabled:hover:bg-common-white disabled:active:bg-common-white gap-none border-sm h-14 w-full border-gray-200 hover:bg-gray-50 active:bg-gray-100 disabled:border-gray-200"
          disabled={loadingProvider !== null}
          aria-busy={isGoogleLoading}
          leftIcon={isGoogleLoading ? undefined : <GoogleIcon size="small" />}
        >
          {isGoogleLoading ? (
            <span className="flex w-full items-center justify-center">
              <LoadingSpinner size={20} />
            </span>
          ) : (
            <span className="font-pretendard text-alpha-black-64 px-lg flex flex-[1_0_0] items-center justify-center text-center text-lg leading-[140%] font-semibold">
              구글 계정으로 로그인
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}

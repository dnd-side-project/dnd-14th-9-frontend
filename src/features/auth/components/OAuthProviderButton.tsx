import type { ReactNode } from "react";

import { Button } from "@/components/Button/Button";
import { GoogleIcon } from "@/components/Icon/GoogleIcon";
import { KakaoIcon } from "@/components/Icon/KakaoIcon";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import { LOGIN_PROVIDERS } from "@/lib/auth/auth-constants";

type LoginProvider = (typeof LOGIN_PROVIDERS)[number];

const oauthProviderButtonConfigs: Record<
  LoginProvider,
  {
    label: string;
    buttonClassName: string;
    labelClassName: string;
    spinnerClassName: string;
    icon: ReactNode;
  }
> = {
  kakao: {
    label: "카카오 계정으로 로그인",
    buttonClassName:
      "px-sm py-md gap-none h-14 w-full bg-[#FEE500] text-gray-900 hover:bg-[#FDD835] active:bg-[#FBC02D] disabled:bg-[#FEE500] disabled:text-gray-900 disabled:hover:bg-[#FEE500] disabled:active:bg-[#FEE500]",
    labelClassName: "text-gray-900",
    spinnerClassName: "text-gray-900",
    icon: <KakaoIcon size="small" />,
  },
  google: {
    label: "구글 계정으로 로그인",
    buttonClassName:
      "bg-common-white text-alpha-black-64 px-sm py-md disabled:bg-common-white disabled:text-alpha-black-64 disabled:hover:bg-common-white disabled:active:bg-common-white gap-none border-sm h-14 w-full border-gray-200 hover:bg-gray-50 active:bg-gray-100 disabled:border-gray-200",
    labelClassName: "text-alpha-black-64",
    spinnerClassName: "text-alpha-black-64",
    icon: <GoogleIcon size="small" />,
  },
};

interface OAuthProviderButtonProps {
  provider: LoginProvider;
  nextPath: string;
  loadingProvider: LoginProvider | null;
  onSubmit: (provider: LoginProvider) => void;
}

export function OAuthProviderButton({
  provider,
  nextPath,
  loadingProvider,
  onSubmit,
}: OAuthProviderButtonProps) {
  const config = oauthProviderButtonConfigs[provider];
  const isLoading = loadingProvider === provider;
  const isDisabled = loadingProvider !== null;

  return (
    <form
      action="/api/auth/login"
      method="get"
      className="w-[360px]"
      onSubmit={() => onSubmit(provider)}
    >
      <input type="hidden" name="provider" value={provider} />
      <input type="hidden" name="next" value={nextPath} />
      <Button
        type="submit"
        variant="solid"
        className={config.buttonClassName}
        disabled={isDisabled}
        aria-busy={isLoading}
        leftIcon={isLoading ? undefined : config.icon}
      >
        {isLoading ? (
          <span className="flex w-full items-center justify-center">
            <LoadingSpinner size={20} className={config.spinnerClassName} />
          </span>
        ) : (
          <span
            className={`font-pretendard px-lg flex flex-[1_0_0] items-center justify-center text-center text-lg leading-[140%] font-semibold ${config.labelClassName}`}
          >
            {config.label}
          </span>
        )}
      </Button>
    </form>
  );
}

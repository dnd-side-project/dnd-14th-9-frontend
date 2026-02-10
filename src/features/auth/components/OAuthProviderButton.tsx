import { Button } from "@/components/Button/Button";
import { GoogleIcon } from "@/components/Icon/GoogleIcon";
import { KakaoIcon } from "@/components/Icon/KakaoIcon";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import { OAUTH_PROVIDER_BUTTON_CONFIGS } from "@/features/auth/lib/oauth-provider-config";
import type { LoginProvider } from "@/lib/auth/auth-constants";

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
  const config = OAUTH_PROVIDER_BUTTON_CONFIGS[provider];
  const isLoading = loadingProvider === provider;
  const isDisabled = loadingProvider !== null;
  const icon = provider === "kakao" ? <KakaoIcon size="small" /> : <GoogleIcon size="small" />;

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
        leftIcon={isLoading ? undefined : icon}
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

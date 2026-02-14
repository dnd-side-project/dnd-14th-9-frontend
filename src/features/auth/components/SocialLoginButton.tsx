import { Button, type ButtonProps } from "@/components/Button/Button";
import { GoogleIcon } from "@/components/Icon/GoogleIcon";
import { KakaoIcon } from "@/components/Icon/KakaoIcon";
import { LoadingSpinner } from "@/components/LoadingSpinner/LoadingSpinner";
import { SOCIAL_LOGIN_BUTTON_CONFIGS } from "@/features/auth/lib/oauth-provider-config";
import type { LoginProvider } from "@/lib/auth/login-policy";
import { cn } from "@/lib/utils/utils";

export interface SocialLoginButtonProps extends Omit<
  ButtonProps,
  "children" | "leftIcon" | "rightIcon" | "variant"
> {
  provider: LoginProvider;
  isLoading?: boolean;
}

export function SocialLoginButton({
  provider,
  isLoading = false,
  className,
  ...buttonProps
}: SocialLoginButtonProps) {
  const config = SOCIAL_LOGIN_BUTTON_CONFIGS[provider];
  const icon = provider === "kakao" ? <KakaoIcon size="small" /> : <GoogleIcon size="small" />;

  return (
    <Button
      variant="solid"
      className={cn(config.buttonClassName, className)}
      aria-busy={isLoading}
      leftIcon={isLoading ? undefined : icon}
      {...buttonProps}
    >
      {isLoading ? (
        <span className="flex w-full items-center justify-center">
          <LoadingSpinner size={20} className={config.spinnerClassName} />
        </span>
      ) : (
        <span
          className={cn(
            "font-pretendard px-lg flex flex-[1_0_0] items-center justify-center text-center text-lg leading-[140%] font-semibold",
            config.labelClassName
          )}
        >
          {config.label}
        </span>
      )}
    </Button>
  );
}

import { GuideBox } from "@/features/auth/components/GuideBox";
import { SocialLoginButton } from "@/features/auth/components/SocialLoginButton";
import type { LoginProvider } from "@/lib/auth/login-policy";

interface OAuthProviderItemProps {
  provider: LoginProvider;
  nextPath: string;
  loadingProvider: LoginProvider | null;
  guideMessage?: string;
  onSubmit: (provider: LoginProvider) => void;
}

export function OAuthProviderItem({
  provider,
  nextPath,
  loadingProvider,
  guideMessage,
  onSubmit,
}: OAuthProviderItemProps) {
  const isLoading = loadingProvider === provider;
  const disabled = loadingProvider !== null;

  return (
    <div className="relative w-full">
      {guideMessage ? (
        <div className="pointer-events-none absolute bottom-[calc(100%+15px)] left-1/2 z-20 -translate-x-1/2">
          <GuideBox>{guideMessage}</GuideBox>
        </div>
      ) : null}

      <form
        action="/api/auth/login"
        method="get"
        className="w-full"
        onSubmit={() => onSubmit(provider)}
      >
        <input type="hidden" name="provider" value={provider} />
        <input type="hidden" name="next" value={nextPath} />
        <SocialLoginButton
          provider={provider}
          type="submit"
          isLoading={isLoading}
          disabled={disabled}
        />
      </form>
    </div>
  );
}

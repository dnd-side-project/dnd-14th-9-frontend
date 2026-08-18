import { GuideBox } from "@/features/auth/components/GuideBox";
import { SocialLoginButton } from "@/features/auth/components/SocialLoginButton";
import type { LoginProvider } from "@/lib/auth/oauth-provider-policy";

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
    // 말풍선이 차지할 공간(pt)을 미리 확보해 위쪽 콘텐츠(에러 메시지 등)와 겹치지 않게 한다.
    <div className={`relative w-full ${guideMessage ? "pt-11" : ""}`}>
      {guideMessage ? (
        <div className="pointer-events-none absolute top-0 left-1/2 z-20 -translate-x-1/2">
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

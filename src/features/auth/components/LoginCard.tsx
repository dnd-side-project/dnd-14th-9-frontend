import { CloseIcon } from "@/components/Icon/CloseIcon";
import { OAuthLoginForm } from "@/features/auth/components/OAuthLoginForm";

interface LoginCardProps {
  reasonMessage?: string | null;
  nextPath: string;
  onClose?: () => void; // Added purely for potential usage, optional
}

export function LoginCard({ reasonMessage, nextPath, onClose }: LoginCardProps) {
  return (
    <div className="border-sm border-border-gray-stronger bg-surface-default p-3xl relative flex min-h-[360px] w-[440px] max-w-full flex-col items-start justify-between rounded-lg shadow-[0_0_80px_0_var(--color-alpha-black-32)]">
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="text-text-muted hover:text-text-primary focus-visible:ring-text-muted p-xs top-lg right-lg gap-none absolute flex cursor-pointer items-center rounded-sm focus-visible:ring-2"
          aria-label="닫기"
        >
          <CloseIcon />
        </button>
      ) : null}

      <div className="w-full">
        <div className="mb-lg gap-2xs flex flex-col text-left">
          <h2 className="font-pretendard text-text-primary text-2xl leading-[140%] font-semibold">
            회원가입 / 로그인
          </h2>
          <p className="font-pretendard text-text-secondary text-base leading-[140%] font-normal">
            쉽게 가입하고 간편하게 로그인하세요!
          </p>
        </div>

        {reasonMessage ? (
          <p className="font-pretendard text-text-status-negative-default text-left text-sm">
            {reasonMessage}
          </p>
        ) : null}
      </div>

      <div className="flex w-full flex-col items-center">
        <OAuthLoginForm nextPath={nextPath} />
      </div>
    </div>
  );
}

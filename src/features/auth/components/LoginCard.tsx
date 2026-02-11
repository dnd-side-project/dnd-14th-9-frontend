import { OAuthLoginButtons } from "@/features/auth/components/OAuthLoginButtons";

interface LoginCardProps {
  reasonMessage?: string | null;
  nextPath: string;
}

export function LoginCard({ reasonMessage, nextPath }: LoginCardProps) {
  return (
    <div className="relative z-10 min-h-[300px] w-[90vw] max-w-[400px] rounded-lg bg-white p-6 shadow-xl">
      <h2 className="mb-6 text-center text-xl font-bold">로그인</h2>
      {reasonMessage ? (
        <p className="mb-4 text-center text-sm text-red-600">{reasonMessage}</p>
      ) : null}
      <OAuthLoginButtons nextPath={nextPath} />
    </div>
  );
}

import { LoginCard } from "@/features/auth/components/LoginCard";

interface LoginPageProps {
  reasonMessage: string | null;
  nextPath: string;
}

export function LoginPage({ reasonMessage, nextPath }: LoginPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <LoginCard reasonMessage={reasonMessage} nextPath={nextPath} />
    </main>
  );
}

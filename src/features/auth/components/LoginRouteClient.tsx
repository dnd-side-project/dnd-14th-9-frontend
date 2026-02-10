"use client";

import { LoginModal } from "@/features/auth/components/LoginModal";
import { useRouter } from "next/navigation";

interface LoginRouteClientProps {
  nextPath: string;
}

export function LoginRouteClient({ nextPath }: LoginRouteClientProps) {
  const router = useRouter();

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.replace(nextPath);
  };

  return <LoginModal isOpen={true} onClose={handleClose} nextPath={nextPath} />;
}

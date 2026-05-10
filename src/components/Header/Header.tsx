import Image from "next/image";
import Link from "next/link";

import { ROOT_ROUTE } from "@/lib/routes/route-paths";

import { HeaderAuthActions } from "./HeaderAuthActions";

export function Header() {
  return (
    <header className="border-border-subtle bg-surface-default sticky top-0 z-50 h-[56px] w-full border-b">
      <div className="px-lg md:px-xl mx-auto flex h-full max-w-[1280px] items-center justify-between xl:px-[50px]">
        <Link
          href={ROOT_ROUTE}
          aria-label="홈으로 이동"
          className="focus-visible:ring-primary transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
        >
          <Image
            src="/header-logo.svg"
            alt="GAK"
            width={90}
            height={24}
            className="h-4 w-[60px] md:h-6 md:w-[90px]"
            priority
          />
        </Link>

        <div className="gap-sm flex items-center justify-end">
          <HeaderAuthActions />
        </div>
      </div>
    </header>
  );
}

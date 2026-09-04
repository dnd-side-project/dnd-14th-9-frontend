"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/utils";

const TABS = [
  { name: "내 정보", href: "/profile/settings" },
  { name: "기록 리포트", href: "/profile/report" },
  { name: "계정 관리", href: "/profile/account" },
];

export function ProfileTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="마이페이지 메뉴"
      className="border-border-subtle relative flex w-full items-center border-b-[2px]"
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "relative flex flex-1 shrink-0 items-center justify-center px-6 py-3 text-center transition-colors md:flex-initial md:items-start md:text-left",
              isActive ? "text-text-primary" : "text-text-muted hover:text-text-primary"
            )}
          >
            <span className="text-xs font-semibold whitespace-nowrap md:text-base">{tab.name}</span>
            {isActive && (
              <span
                aria-hidden="true"
                className="bg-border-stronger absolute right-0 -bottom-[2px] left-0 h-[2px]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

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
      className="border-border-subtle scrollbar-hide flex w-full items-center overflow-x-auto border-b-[2px]"
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex flex-1 shrink-0 flex-col items-center justify-center border-b-[2px] px-2 py-3 text-center transition-colors md:flex-initial md:items-start md:px-6 md:text-left",
              isActive
                ? "border-border-stronger text-text-primary mb-[-2px]" // mb-[-2px] ensures the active border overlaps the container's bottom border visually
                : "text-text-muted hover:text-text-primary mb-[-2px] border-transparent"
            )}
          >
            <span className="text-xs font-semibold whitespace-nowrap md:text-base">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}

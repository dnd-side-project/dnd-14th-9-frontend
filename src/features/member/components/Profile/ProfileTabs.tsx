"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/utils";

const TABS = [
  { name: "내 정보", href: "/profile/settings" },
  { name: "기록 리포트", href: "/profile/report" },
];

export function ProfileTabs() {
  const pathname = usePathname();

  return (
    <div className="border-border-subtle flex w-full items-center border-b-[2px]">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-col items-start border-b-[2px] px-6 py-3 transition-colors",
              isActive
                ? "border-border-stronger text-text-primary mb-[-2px]" // mb-[-2px] ensures the active border overlaps the container's bottom border visually
                : "text-text-muted hover:text-text-primary mb-[-2px] border-transparent"
            )}
          >
            <span className="font-pretendard text-base font-semibold">{tab.name}</span>
          </Link>
        );
      })}
    </div>
  );
}

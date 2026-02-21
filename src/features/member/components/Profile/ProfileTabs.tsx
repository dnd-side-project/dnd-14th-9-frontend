"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils/utils";

const tabs = [
  { name: "내 정보", href: "/profile/settings" },
  { name: "기록 리포트", href: "/profile/report" },
];

export function ProfileTabs() {
  const pathname = usePathname();

  return (
    <div className="border-border-default flex w-full items-center border-b">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex flex-1 items-center justify-center border-b-2 py-3 text-base font-semibold transition-colors",
              isActive
                ? "border-text-normal text-text-normal"
                : "text-text-subtle hover:text-text-normal border-transparent"
            )}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}

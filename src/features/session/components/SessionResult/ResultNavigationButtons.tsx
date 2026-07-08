"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/Button/Button";
import { cn } from "@/lib/utils/utils";

type NavigationAction = {
  label: string;
  href: string;
  replace?: boolean;
} & (
  | {
      variant: "solid";
      colorScheme: "primary" | "secondary" | "tertiary";
    }
  | {
      variant: "outlined";
      colorScheme: "primary" | "secondary";
    }
);

interface ResultNavigationButtonsProps {
  actions: NavigationAction[];
}

// 모바일은 medium 버튼, 태블릿(md) 이상은 large 버튼 치수로 키웁니다.
const RESPONSIVE_BUTTON_SIZE = "md:h-14 md:min-w-22.5 md:px-xl md:py-md md:text-base";

export function ResultNavigationButtons({ actions }: ResultNavigationButtonsProps) {
  const router = useRouter();

  return (
    <section className="mt-2xl mb-3xl gap-md flex justify-center">
      {actions.map((action) =>
        action.replace ? (
          action.variant === "solid" ? (
            <Button
              key={action.label}
              variant="solid"
              colorScheme={action.colorScheme}
              size="medium"
              className={RESPONSIVE_BUTTON_SIZE}
              onClick={() => router.replace(action.href)}
            >
              {action.label}
            </Button>
          ) : (
            <Button
              key={action.label}
              variant="outlined"
              colorScheme={action.colorScheme}
              size="medium"
              className={RESPONSIVE_BUTTON_SIZE}
              onClick={() => router.replace(action.href)}
            >
              {action.label}
            </Button>
          )
        ) : (
          <Link
            key={action.label}
            href={action.href}
            className={cn(
              buttonVariants({
                variant: action.variant,
                colorScheme: action.colorScheme,
                size: "medium",
              }),
              RESPONSIVE_BUTTON_SIZE
            )}
          >
            {action.label}
          </Link>
        )
      )}
    </section>
  );
}

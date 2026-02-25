"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/Button/Button";
import { cn } from "@/lib/utils/utils";

interface NavigationAction {
  label: string;
  href: string;
  variant: "outlined" | "solid";
  colorScheme: "primary" | "secondary";
  replace?: boolean;
}

interface ResultNavigationButtonsProps {
  actions: NavigationAction[];
}

export function ResultNavigationButtons({ actions }: ResultNavigationButtonsProps) {
  const router = useRouter();

  return (
    <section className="mt-2xl mb-3xl gap-md flex justify-center">
      {actions.map((action) =>
        action.replace ? (
          <Button
            key={action.label}
            variant={action.variant}
            colorScheme={action.colorScheme}
            size="large"
            onClick={() => router.replace(action.href)}
          >
            {action.label}
          </Button>
        ) : (
          <Link
            key={action.label}
            href={action.href}
            className={cn(
              buttonVariants({
                variant: action.variant,
                colorScheme: action.colorScheme,
                size: "large",
              })
            )}
          >
            {action.label}
          </Link>
        )
      )}
    </section>
  );
}

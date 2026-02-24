"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/Button/Button";

interface NavigationAction {
  label: string;
  href: string;
  variant: "outlined" | "solid";
  colorScheme: "primary" | "secondary";
}

interface ResultNavigationButtonsProps {
  actions: NavigationAction[];
}

export function ResultNavigationButtons({ actions }: ResultNavigationButtonsProps) {
  const router = useRouter();

  return (
    <section className="mt-2xl mb-3xl gap-md flex justify-center">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          colorScheme={action.colorScheme}
          size="large"
          onClick={() => router.push(action.href)}
        >
          {action.label}
        </Button>
      ))}
    </section>
  );
}

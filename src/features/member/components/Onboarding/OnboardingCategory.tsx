import { useState } from "react";

import { Button } from "@/components/Button/Button";
import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { CATEGORY_LABELS, ONBOARDING_CATEGORIES, type Category } from "@/lib/constants/category";
import { cn } from "@/lib/utils/utils";

interface OnboardingCategoryProps {
  className?: string;
  nickname: string;
  onNext?: (categories: string[]) => void;
}

const ONBOARDING_CATEGORY_SPAN_CLASS: Record<Category, string> = {
  DEVELOPMENT: "col-span-2",
  DESIGN: "col-span-2",
  PLANNING_PM: "col-span-2",
  CAREER_SELF_DEVELOPMENT: "col-span-3",
  STUDY_READING: "col-span-3",
  CREATIVE: "col-span-2",
  TEAM_PROJECT: "col-span-2",
  FREE: "col-span-2",
};

export function OnboardingCategory({ className, nickname, onNext }: OnboardingCategoryProps) {
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const toggleCategory = (category: Category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, category];
    });
  };

  const handleNext = () => {
    onNext?.(selectedCategories.map((category) => CATEGORY_LABELS[category]));
  };

  return (
    <div
      className={cn(
        "bg-surface-default flex flex-col items-center gap-[48px] rounded-lg border border-gray-900 p-10 shadow-[0px_0px_80px_0px_rgba(0,0,0,0.3)]",
        className
      )}
    >
      {/* Header */}
      <div className="flex w-full flex-col gap-1 text-left">
        <h1 className="text-text-primary text-2xl font-bold">
          {nickname}님! <br />
          요즘 관심있는 카테고리는 무엇인가요?
        </h1>
      </div>

      {/* Category Grid */}
      <div className="grid w-full grid-cols-6 gap-3">
        {ONBOARDING_CATEGORIES.map((category) => {
          const label = CATEGORY_LABELS[category];
          const isSelected = selectedCategories.includes(category);

          return (
            <CategoryFilterButton
              key={category}
              type="button"
              isSelected={isSelected}
              onClick={() => toggleCategory(category)}
              className={cn(
                "h-14 w-full rounded-lg px-4 py-3 text-center text-base",
                ONBOARDING_CATEGORY_SPAN_CLASS[category],
                isSelected
                  ? "text-text-brand-default bg-[#27EA671F]"
                  : "bg-surface-strong text-text-secondary hover:bg-surface-subtle"
              )}
            >
              {label}
            </CategoryFilterButton>
          );
        })}
      </div>

      <div className="flex w-full">
        <Button
          variant="solid"
          colorScheme="primary"
          className="h-12 w-full text-base font-semibold"
          disabled={selectedCategories.length === 0}
          onClick={handleNext}
        >
          완료
        </Button>
      </div>
    </div>
  );
}

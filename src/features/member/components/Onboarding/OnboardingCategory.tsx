import { useState } from "react";

import { Button } from "@/components/Button/Button";
import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { cn } from "@/lib/utils/utils";
import {
  MEMBER_INTEREST_CATEGORY_LABELS,
  type MemberInterestCategory,
} from "@/types/shared/member-interest-category";

interface OnboardingCategoryProps {
  className?: string;
  nickname: string;
  onNext?: (categories: string[]) => void;
}

const CATEGORIES = [
  { key: "DEVELOPMENT", spanClassName: "col-span-2" },
  { key: "DESIGN", spanClassName: "col-span-2" },
  { key: "PLANNING_PM", spanClassName: "col-span-2" },
  { key: "CAREER_SELF_DEVELOPMENT", spanClassName: "col-span-3" },
  { key: "STUDY_READING", spanClassName: "col-span-3" },
  { key: "CREATIVE", spanClassName: "col-span-2" },
  { key: "TEAM_PROJECT", spanClassName: "col-span-2" },
  { key: "FREE", spanClassName: "col-span-2" },
] as const satisfies ReadonlyArray<{
  key: MemberInterestCategory;
  spanClassName: string;
}>;

export function OnboardingCategory({ className, nickname, onNext }: OnboardingCategoryProps) {
  const [selectedCategories, setSelectedCategories] = useState<MemberInterestCategory[]>([]);

  const toggleCategory = (category: MemberInterestCategory) => {
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
    onNext?.(selectedCategories.map((category) => MEMBER_INTEREST_CATEGORY_LABELS[category]));
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
        {CATEGORIES.map((category) => {
          const label = MEMBER_INTEREST_CATEGORY_LABELS[category.key];
          const isSelected = selectedCategories.includes(category.key);

          return (
            <CategoryFilterButton
              key={category.key}
              type="button"
              isSelected={isSelected}
              onClick={() => toggleCategory(category.key)}
              className={cn(
                "h-14 w-full rounded-lg px-4 py-3 text-center text-base",
                category.spanClassName,
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

import { useState } from "react";

import { Badge } from "@/components/Badge/Badge";
import { Button } from "@/components/Button/Button";
import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { CATEGORY_LABELS, ONBOARDING_CATEGORIES, type Category } from "@/lib/constants/category";
import { cn } from "@/lib/utils/utils";

interface OnboardingCategoryProps {
  className?: string;
  nickname: string;
  isLoading?: boolean;
  onBack?: () => void;
  onNext?: (categories: Category[]) => void;
}

const RANK_LABELS = ["1순위", "2순위", "3순위"] as const;

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

export function OnboardingCategory({
  className,
  nickname,
  isLoading = false,
  onBack,
  onNext,
}: OnboardingCategoryProps) {
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

  const removeCategoryByIndex = (index: number) => {
    setSelectedCategories((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    onNext?.(selectedCategories);
  };

  const visibleSlots = Math.min(selectedCategories.length + 1, 3);

  return (
    <div
      className={cn(
        "p-3xl border-sm border-border-default bg-surface-default flex w-140 flex-col gap-12 rounded-lg shadow-[0_0_2px_0_rgba(0,0,0,0.08),0_16px_24px_0_rgba(0,0,0,0.12)]",
        className
      )}
    >
      {/* Header */}
      <div className="gap-md flex w-full flex-col">
        <h1 className="text-text-primary text-[24px] font-bold">
          {nickname}님! <br />
          요즘 관심있는 카테고리는 무엇인가요?
        </h1>
        <div className="gap-md flex flex-wrap items-center">
          {Array.from({ length: visibleSlots }, (_, index) => {
            const selected = selectedCategories[index];
            const isFirst = index === 0;

            return (
              <div key={index} className="gap-xs flex items-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-text-primary text-[12px] font-semibold">
                    {RANK_LABELS[index]}
                  </span>
                  {isFirst && (
                    <span className="text-text-status-negative-default text-[13px] font-semibold">
                      *
                    </span>
                  )}
                </div>
                {selected ? (
                  <Badge
                    status="inProgress"
                    radius="max"
                    showIcon
                    onIconClick={() => removeCategoryByIndex(index)}
                  >
                    {CATEGORY_LABELS[selected]}
                  </Badge>
                ) : (
                  <Badge status="recruiting" radius="max">
                    카테고리를 선택해 주세요
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Grid */}
      <div className="flex w-full flex-col gap-4">
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
                {isSelected && <CheckIcon size="small" className="text-text-brand-default" />}
                {label}
              </CategoryFilterButton>
            );
          })}
        </div>
      </div>

      <div className="flex w-full gap-3">
        <Button
          variant="solid"
          colorScheme="tertiary"
          className="h-12 flex-1 text-base font-semibold"
          onClick={onBack}
        >
          뒤로가기
        </Button>
        <Button
          variant="solid"
          colorScheme="primary"
          className="h-12 flex-1 text-base font-semibold"
          disabled={selectedCategories.length === 0 || isLoading}
          onClick={handleNext}
        >
          {isLoading ? "저장 중..." : "선택 완료"}
        </Button>
      </div>
    </div>
  );
}

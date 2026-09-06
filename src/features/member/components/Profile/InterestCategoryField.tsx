import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { CATEGORY_LABELS, ONBOARDING_CATEGORIES } from "@/lib/constants/category";
import { toast } from "@/lib/toast";

const MAX_INTEREST_CATEGORIES = 3;

type InterestCategoryFieldProps = {
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
};

export function InterestCategoryField({ value, onChange, error }: InterestCategoryFieldProps) {
  const toggle = (key: string) => {
    if (value.includes(key)) {
      onChange(value.filter((k) => k !== key));
      return;
    }

    if (value.length >= MAX_INTEREST_CATEGORIES) {
      toast.info(`관심 카테고리는 최대 ${MAX_INTEREST_CATEGORIES}개까지 선택 가능합니다.`);
      return;
    }

    onChange([...value, key]);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h3 className="text-text-primary text-lg font-bold">관심 카테고리</h3>
        <p className="text-text-disabled text-[15px]">
          관심 있는 카테고리를 선택하면 맞춤 세션을 추천해 드려요
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-start gap-2 md:gap-3 lg:justify-center">
        {ONBOARDING_CATEGORIES.map((catKey) => (
          <CategoryFilterButton
            key={catKey}
            type="button"
            isSelected={value.includes(catKey)}
            onClick={() => toggle(catKey)}
            className="lg:w-[136px]"
          >
            {CATEGORY_LABELS[catKey]}
          </CategoryFilterButton>
        ))}
      </div>

      {error && <p className="text-system-error -mt-4 text-center text-sm">{error}</p>}
    </div>
  );
}

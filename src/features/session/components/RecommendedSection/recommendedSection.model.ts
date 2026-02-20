import type { Category, CategoryFilter } from "@/lib/constants/category";

type RecommendedView =
  | {
      type: "carousel";
      category: Category;
    }
  | {
      type: "single";
      category: Category;
    }
  | {
      type: "empty";
      placeholderCategory: CategoryFilter;
    };

interface ResolveRecommendedViewParams {
  selectedCategory?: CategoryFilter;
  interestCategories: Category[];
  currentPage: number;
}

export function collectInterestCategories(
  categories: Array<Category | undefined | null>
): Category[] {
  return categories.filter((category): category is Category => Boolean(category));
}

export function resolveRecommendedView({
  selectedCategory,
  interestCategories,
  currentPage,
}: ResolveRecommendedViewParams): RecommendedView | null {
  if (!selectedCategory || selectedCategory === "ALL") {
    const category = interestCategories[currentPage - 1];
    if (!category) {
      return null;
    }

    return {
      type: "carousel",
      category,
    };
  }

  if (interestCategories.includes(selectedCategory)) {
    return {
      type: "single",
      category: selectedCategory,
    };
  }

  return {
    type: "empty",
    placeholderCategory: selectedCategory,
  };
}

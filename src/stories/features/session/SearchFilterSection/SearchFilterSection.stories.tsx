import { CategoryFilterButton } from "@/components/CategoryFilterButton/CategoryFilterButton";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { SearchFilterSection } from "@/features/session/components/SearchFilterSection/SearchFilterSection";
import { CATEGORIES, getCategoryLabel } from "@/lib/constants/category";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const customViewports = {
  mobile: {
    name: "Mobile (375px)",
    styles: { width: "375px", height: "600px" },
  },
  tablet: {
    name: "Tablet (768px)",
    styles: { width: "768px", height: "600px" },
  },
  desktop: {
    name: "Desktop (1440px)",
    styles: { width: "1440px", height: "800px" },
  },
};

const meta = {
  title: "Features/Session/SearchFilterSection",
  component: SearchFilterSection,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    viewport: {
      viewports: customViewports,
    },
    docs: {
      description: {
        component:
          "피그마 Category 디자인 시스템(`Category/Expandable`, `Category/Scrollable`, `Category/Atomic`, `Chip/Filter`)을 바탕으로 구현된 세션 검색 및 카테고리 필터 섹션입니다.",
      },
    },
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: "/",
        query: {},
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="dark bg-background-default text-foreground min-h-[400px] w-full p-6">
        <div className="mx-auto max-w-[1200px]">
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof SearchFilterSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// ---------------------------------------------------------------------------
// 1. Next.js 라우팅 연동 기본 스토리
// ---------------------------------------------------------------------------

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: "기본 상태(전체 카테고리 선택)의 SearchFilterSection입니다.",
      },
    },
  },
};

export const CategorySelected: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/",
        query: { category: "DEVELOPMENT" },
      },
    },
    docs: {
      description: {
        story: "'개발' 카테고리가 쿼리로 선택된 상태입니다.",
      },
    },
  },
};

export const WithSearchKeyword: Story = {
  parameters: {
    nextjs: {
      navigation: {
        pathname: "/",
        query: { q: "React 스터디", category: "STUDY_READING" },
      },
    },
    docs: {
      description: {
        story: "검색어와 카테고리가 모두 지정된 상태입니다.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 3. 피그마 스펙 비교 (Expandable Collapsed vs Expanded)
// ---------------------------------------------------------------------------

export const FigmaExpandableComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-text-primary text-sm font-semibold">
            1. Figma Collapsed State (335px 너비, 단일 행 가로 스크롤 + 우측 페이드 마스크)
          </h3>
          <span className="bg-surface-subtle text-text-muted rounded-xs px-2 py-1 text-xs">
            height: 41px, width: 335px
          </span>
        </div>
        <div className="border-border-default bg-surface-default mx-auto w-[335px] rounded-lg border p-3">
          <div className="flex w-full items-center gap-2">
            <div
              className="flex flex-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                maskImage: "linear-gradient(to right, black calc(100% - 40px), transparent 100%)",
              }}
            >
              <div className="flex items-center gap-2">
                {CATEGORIES.map((category, idx) => (
                  <CategoryFilterButton key={category} isSelected={idx === 0}>
                    {getCategoryLabel(category)}
                  </CategoryFilterButton>
                ))}
              </div>
            </div>
            <button
              type="button"
              className="border-alpha-white-16 border-sm bg-surface-default px-xs py-2xs rounded-max flex shrink-0 items-center justify-center"
              aria-label="카테고리 펼치기"
            >
              <ChevronDownIcon />
            </button>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-text-primary text-sm font-semibold">
            2. Figma Expanded State (335px 너비, flex-wrap 다중 행 노출 + 접기 버튼)
          </h3>
          <span className="bg-surface-subtle text-text-muted rounded-xs px-2 py-1 text-xs">
            height: ~139px, width: 335px
          </span>
        </div>
        <div className="border-border-default bg-surface-default mx-auto w-[335px] rounded-lg border p-3">
          <div className="flex w-full items-start gap-3">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {CATEGORIES.map((category, idx) => (
                <CategoryFilterButton key={category} isSelected={idx === 0}>
                  {getCategoryLabel(category)}
                </CategoryFilterButton>
              ))}
            </div>
            <button
              type="button"
              className="border-alpha-white-16 border-sm bg-surface-strong px-xs py-2xs rounded-max flex shrink-0 items-center justify-center"
              aria-label="카테고리 접기"
            >
              <ChevronDownIcon className="rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Figma Category/Expandable(Node 417:3594)의 접힘(Collapsed, 41px)과 펼침(Expanded, 139px) 상태 레이아웃 비교입니다.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 4. 피그마 스크롤 마스크 동작 데모 (Scrollable)
// ---------------------------------------------------------------------------

export const FigmaScrollableMaskDemo: Story = {
  render: () => {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-text-muted text-xs leading-relaxed">
          피그마 `Category/Scrollable`(Node 417:3627) 스펙에 따른 가로 스크롤 및 마스크 동작입니다.
          스크롤 위치에 따라 좌우 40px 페이드 그라디언트가 자동으로 적용됩니다.
        </p>

        <div className="flex flex-col gap-6">
          <div className="border-border-default bg-surface-default mx-auto w-[335px] rounded-lg border p-4">
            <h4 className="text-text-secondary mb-2 text-xs font-semibold">
              양방향 페이드 마스크 (스크롤 중간 위치)
            </h4>
            <div
              className="flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{
                maskImage:
                  "linear-gradient(to right, transparent, black 40px, black calc(100% - 40px), transparent)",
              }}
            >
              <div className="flex items-center gap-2">
                {CATEGORIES.map((category, idx) => (
                  <CategoryFilterButton key={category} isSelected={idx === 2}>
                    {getCategoryLabel(category)}
                  </CategoryFilterButton>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "제한된 너비(335px) 내에서 양방향 스크롤 마스크가 적용된 Scrollable 카테고리 데모입니다.",
      },
    },
  },
};

// ---------------------------------------------------------------------------
// 5. 반응형 뷰포트 레이아웃 비교
// ---------------------------------------------------------------------------

export const ResponsiveBreakpointsComparison: Story = {
  render: () => (
    <div className="flex flex-col gap-10">
      <div>
        <h4 className="text-text-secondary mb-2 text-xs font-semibold">
          📱 Mobile View (375px) — 스크롤 및 접기/펼치기 토글 지원
        </h4>
        <div className="border-border-default bg-background-default w-[375px] rounded-xl border p-4">
          <SearchFilterSection />
        </div>
      </div>

      <div>
        <h4 className="text-text-secondary mb-2 text-xs font-semibold">
          💻 Desktop View (1024px+) — 중앙 정렬 및 전체 카테고리 항시 노출
        </h4>
        <div className="border-border-default bg-background-default w-full rounded-xl border p-6">
          <SearchFilterSection />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "모바일(375px)과 데스크톱(1024px+) 환경에서의 반응형 동작을 한눈에 비교합니다.",
      },
    },
  },
};

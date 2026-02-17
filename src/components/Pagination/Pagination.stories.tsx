import { useEffect, useState, type ComponentProps } from "react";

import { Pagination } from "./Pagination";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

type PaginationStoryProps = Omit<ComponentProps<typeof Pagination>, "onPageChange">;

function StatefulPagination({ totalPage, currentPage, variant, className }: PaginationStoryProps) {
  const normalizedTotalPage = Math.max(totalPage, 1);
  const [page, setPage] = useState(Math.min(Math.max(currentPage, 1), normalizedTotalPage));

  useEffect(() => {
    setPage(Math.min(Math.max(currentPage, 1), normalizedTotalPage));
  }, [currentPage, normalizedTotalPage]);

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > normalizedTotalPage) {
      return;
    }

    setPage(nextPage);
  };

  return (
    <div className="bg-background-default dark rounded-2xl p-6">
      <Pagination
        totalPage={normalizedTotalPage}
        currentPage={page}
        onPageChange={handlePageChange}
        variant={variant}
        className={className}
      />
    </div>
  );
}

const META = {
  title: "Components/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  tags: ["autodocs"],
  argTypes: {
    totalPage: {
      control: {
        type: "number",
        min: 1,
        step: 1,
      },
    },
    currentPage: {
      control: {
        type: "number",
        min: 1,
        step: 1,
      },
    },
    className: {
      control: false,
    },
    onPageChange: {
      table: {
        disable: true,
      },
    },
  },
  args: {
    totalPage: 20,
    currentPage: 1,
    onPageChange: () => undefined,
  },
  render: (args) => (
    <StatefulPagination
      totalPage={args.totalPage ?? 1}
      currentPage={args.currentPage ?? 1}
      variant={args.variant}
      className={args.className}
    />
  ),
} satisfies Meta<typeof Pagination>;

export default META;
type Story = StoryObj<typeof META>;

export const DEFAULT: Story = {};

export const MIDDLE_PAGE: Story = {
  args: {
    currentPage: 10,
  },
};

export const LAST_PAGE: Story = {
  args: {
    currentPage: 20,
  },
};

export const SHORT_RANGE: Story = {
  args: {
    totalPage: 5,
    currentPage: 3,
  },
};

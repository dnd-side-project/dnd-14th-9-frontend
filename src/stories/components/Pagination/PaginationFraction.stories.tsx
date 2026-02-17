import { useEffect, useState, type ComponentProps } from "react";

import { PaginationFraction } from "@/components/Pagination/PaginationFraction";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

type PaginationFractionStoryProps = Omit<ComponentProps<typeof PaginationFraction>, "onPageChange">;

function StatefulPaginationFraction({
  totalPage,
  currentPage,
  className,
}: PaginationFractionStoryProps) {
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  return (
    <div className="bg-background-default dark rounded-2xl p-6">
      <PaginationFraction
        totalPage={totalPage}
        currentPage={page}
        onPageChange={setPage}
        className={className}
      />
    </div>
  );
}

const META = {
  title: "Components/Pagination/Fraction",
  component: PaginationFraction,
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
        min: 0,
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
    totalPage: 3,
    currentPage: 1,
    onPageChange: () => undefined,
  },
  render: (args) => (
    <StatefulPaginationFraction
      totalPage={args.totalPage ?? 1}
      currentPage={args.currentPage ?? 1}
      className={args.className}
    />
  ),
} satisfies Meta<typeof PaginationFraction>;

export default META;
type Story = StoryObj<typeof META>;

export const DEFAULT: Story = {};

export const MIDDLE_PAGE: Story = {
  args: {
    currentPage: 2,
  },
};

export const LAST_PAGE: Story = {
  args: {
    currentPage: 3,
  },
};

export const ZERO_TOTAL_PAGE: Story = {
  args: {
    totalPage: 0,
    currentPage: 1,
  },
};

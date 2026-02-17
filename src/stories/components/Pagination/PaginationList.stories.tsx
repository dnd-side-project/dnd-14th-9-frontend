import { useEffect, useState, type ComponentProps } from "react";

import { PaginationList } from "@/components/Pagination/PaginationList";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

type PaginationListStoryProps = Omit<ComponentProps<typeof PaginationList>, "onPageChange">;

function StatefulPaginationList({ totalPage, currentPage, className }: PaginationListStoryProps) {
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  return (
    <div className="bg-background-default dark rounded-2xl p-6">
      <PaginationList
        totalPage={totalPage}
        currentPage={page}
        onPageChange={setPage}
        className={className}
      />
    </div>
  );
}

const META = {
  title: "Components/Pagination/List",
  component: PaginationList,
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
    totalPage: 20,
    currentPage: 1,
    onPageChange: () => undefined,
  },
  render: (args) => (
    <StatefulPaginationList
      totalPage={args.totalPage ?? 1}
      currentPage={args.currentPage ?? 1}
      className={args.className}
    />
  ),
} satisfies Meta<typeof PaginationList>;

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

export const ZERO_TOTAL_PAGE: Story = {
  args: {
    totalPage: 0,
    currentPage: 1,
  },
};

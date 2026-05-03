import { useEffect, useState, type ComponentProps } from "react";

import { Pagination } from "@/components/Pagination/Pagination";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

type PaginationStoryProps = Omit<ComponentProps<typeof Pagination>, "onPageChange">;

function StatefulPagination({ type, totalPage, currentPage, className }: PaginationStoryProps) {
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  return (
    <div className="bg-background-default dark rounded-2xl p-6">
      <Pagination
        type={type as "fraction" | "list"}
        totalPage={totalPage}
        currentPage={page}
        onPageChange={setPage}
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
    type: {
      control: "radio",
      options: ["fraction", "list"],
    },
    totalPage: {
      control: { type: "number", min: 0, step: 1 },
    },
    currentPage: {
      control: { type: "number", min: 1, step: 1 },
    },
    onPageChange: { table: { disable: true } },
  },
  args: {
    onPageChange: () => undefined,
  },
} satisfies Meta<typeof Pagination>;

export default META;
type Story = StoryObj<typeof META>;

export const Fraction: Story = {
  args: {
    type: "fraction",
    totalPage: 3,
    currentPage: 1,
  },
  render: (args) => (
    <StatefulPagination
      type="fraction"
      totalPage={args.totalPage ?? 3}
      currentPage={args.currentPage ?? 1}
      className={args.className}
    />
  ),
};

export const List: Story = {
  args: {
    type: "list",
    totalPage: 20,
    currentPage: 1,
  },
  render: (args) => (
    <StatefulPagination
      type="list"
      totalPage={args.totalPage ?? 20}
      currentPage={args.currentPage ?? 1}
      className={args.className}
    />
  ),
};

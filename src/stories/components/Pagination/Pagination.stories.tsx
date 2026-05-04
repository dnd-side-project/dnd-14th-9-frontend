import { useState, type ComponentProps, type ReactElement } from "react";

import { useArgs } from "storybook/preview-api";

import { Pagination } from "@/components/Pagination/Pagination";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

type PaginationStoryArgs = {
  type: "fraction" | "list";
  totalPage: number;
  currentPage: number;
  className?: string;
};

type PaginationStoryProps = Omit<ComponentProps<typeof Pagination>, "onPageChange" | "type">;

function StatefulPagination({
  type,
  totalPage,
  currentPage,
  className,
}: PaginationStoryProps & { type: "fraction" | "list" }) {
  const [page, setPage] = useState(currentPage);

  return (
    <div className="bg-background-default dark rounded-2xl p-6">
      <Pagination
        type={type}
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
  component: Pagination as unknown as (props: PaginationStoryArgs) => ReactElement,
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "dark",
    },
  },
  tags: ["autodocs"],
  argTypes: {
    totalPage: {
      control: { type: "number", min: 0, step: 1 },
    },
    currentPage: {
      control: { type: "number", min: 1, step: 1 },
    },
    type: { table: { disable: true } },
  },
} satisfies Meta<PaginationStoryArgs>;

export default META;
type Story = StoryObj<PaginationStoryArgs>;

export const Fraction: Story = {
  args: {
    totalPage: 3,
    currentPage: 1,
  },
  render: (args) => (
    <StatefulPagination
      key={`fraction-${args.currentPage ?? 1}`}
      type="fraction"
      totalPage={args.totalPage ?? 3}
      currentPage={args.currentPage ?? 1}
      className={args.className}
    />
  ),
};

export const List: Story = {
  args: {
    totalPage: 20,
    currentPage: 1,
  },
  render: (args) => (
    <StatefulPagination
      key={`list-${args.currentPage ?? 1}`}
      type="list"
      totalPage={args.totalPage ?? 20}
      currentPage={args.currentPage ?? 1}
      className={args.className}
    />
  ),
};

export const Playground: Story = {
  args: {
    type: "fraction",
    totalPage: 3,
    currentPage: 1,
  },
  argTypes: {
    type: {
      control: "radio",
      options: ["fraction", "list"],
      table: { disable: false },
    },
  },
  render: function Render(args) {
    const [, updateArgs] = useArgs();

    return (
      <div className="bg-background-default dark rounded-2xl p-6">
        <Pagination
          type={args.type}
          totalPage={args.totalPage ?? 3}
          currentPage={args.currentPage ?? 1}
          onPageChange={(page) => updateArgs({ currentPage: page })}
          className={args.className}
        />
      </div>
    );
  },
};

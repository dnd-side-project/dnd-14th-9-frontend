import { Footer } from "@/components/Footer/Footer";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta: Meta<typeof Footer> = {
  title: "Components/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: "tablet",
    },
  },
};

export const Desktop: Story = {
  parameters: {
    viewport: {
      defaultViewport: "desktop",
    },
  },
};

export const DesktopXL: Story = {
  parameters: {
    viewport: {
      defaultViewport: "reset", // or a specific large viewport if configured, otherwise default full width
    },
    chromatic: { viewports: [1440] },
  },
};

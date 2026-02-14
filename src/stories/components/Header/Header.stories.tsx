import Link from "next/link";

import { ButtonLink } from "@/components/Button/ButtonLink";
import { ProfileDropdown } from "@/components/Header/ProfileDropdown";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Viewport } from "storybook/viewport";

function HeaderStory({ isAuthenticated }: { isAuthenticated: boolean }) {
  return (
    <header className="border-border-subtle bg-surface-default px-lg md:px-xl md:py-sm mx-auto flex h-full max-w-[1280px] items-center justify-between border-b py-[15px] lg:px-[50px]">
      <Link
        href="/"
        aria-label="홈으로 이동"
        className="text-common-white focus-visible:ring-primary text-[27px] leading-[120%] font-bold transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
      >
        GAK
      </Link>

      <div className="gap-sm flex items-center justify-end">
        {isAuthenticated ? (
          <>
            <ButtonLink
              href="/session/create"
              aria-label="세션 만들기"
              size="small"
              variant="solid"
              colorScheme="primary"
              className="px-xs py-2xs md:px-sm md:py-xs"
            >
              세션 만들기
            </ButtonLink>
            <ProfileDropdown />
          </>
        ) : (
          <ButtonLink
            href="/login"
            aria-label="로그인"
            size="small"
            variant="outlined"
            colorScheme="secondary"
            className="px-xs py-2xs md:px-sm md:py-xs"
          >
            회원가입 / 로그인
          </ButtonLink>
        )}
      </div>
    </header>
  );
}

const HEADER_VIEWPORTS = {
  mobile: {
    name: "Mobile (375px)",
    styles: {
      width: "375px",
      height: "812px",
    },
    type: "mobile",
  },
  tablet: {
    name: "Tablet (768px)",
    styles: {
      width: "768px",
      height: "1024px",
    },
    type: "tablet",
  },
  desktop: {
    name: "Desktop (1280px)",
    styles: {
      width: "1280px",
      height: "900px",
    },
    type: "desktop",
  },
  desktopXL: {
    name: "DesktopXL (1440px)",
    styles: {
      width: "1440px",
      height: "900px",
    },
    type: "desktop",
  },
} satisfies Record<string, Viewport>;

const meta = {
  title: "Components/Header",
  component: HeaderStory,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
    viewport: {
      options: HEADER_VIEWPORTS,
    },
    docs: {
      story: {
        inline: false,
      },
    },
  },
} satisfies Meta<typeof HeaderStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  args: {
    isAuthenticated: false,
  },
};

export const LoggedIn: Story = {
  args: {
    isAuthenticated: true,
  },
};

export const Mobile: Story = {
  args: {
    isAuthenticated: false,
  },
  globals: {
    viewport: {
      value: "mobile",
      isRotated: false,
    },
  },
};

export const Tablet: Story = {
  args: {
    isAuthenticated: false,
  },
  globals: {
    viewport: {
      value: "tablet",
      isRotated: false,
    },
  },
};

export const Desktop: Story = {
  args: {
    isAuthenticated: false,
  },
  globals: {
    viewport: {
      value: "desktop",
      isRotated: false,
    },
  },
};

export const DesktopXL: Story = {
  args: {
    isAuthenticated: false,
  },
  globals: {
    viewport: {
      value: "desktopXL",
      isRotated: false,
    },
  },
};

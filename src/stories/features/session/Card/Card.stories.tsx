import { Card } from "@/features/session/components/Card/Card";
import { CardSkeleton } from "@/features/session/components/Card/CardSkeleton";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Features/Session/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "세션 목록에서 사용되는 카드 컴포넌트입니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    thumbnailSrc: {
      control: "text",
      description: "썸네일 이미지 URL",
    },
    category: {
      control: "text",
      description: "카테고리명",
    },
    createdAt: {
      control: "date",
      description: "생성일시",
    },
    title: {
      control: "text",
      description: "세션 제목",
    },
    nickname: {
      control: "text",
      description: "작성자 닉네임",
    },
    layout: {
      control: "select",
      options: ["vertical", "horizontal"],
      description: "레이아웃 방향",
    },
    size: {
      control: "select",
      options: ["md", "sm", "responsive"],
      description: "카드 사이즈 또는 반응형 density",
    },
    showDescription: {
      control: "boolean",
      description: "description 표시 여부",
    },
    currentParticipants: {
      control: "number",
      description: "현재 참가자 수",
    },
    maxParticipants: {
      control: "number",
      description: "최대 참가자 수",
    },
    durationMinutes: {
      control: "number",
      description: "세션 소요시간 (분)",
    },
    sessionDate: {
      control: "date",
      description: "세션 일시",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;
type CardSkeletonStory = StoryObj<typeof CardSkeleton>;

const DEFAULT_CREATED_AT = new Date("2026-04-21T09:00:00Z");
const SECONDARY_CREATED_AT = new Date("2026-04-24T04:00:00Z");
const RECENT_CREATED_AT = new Date("2026-04-24T08:30:00Z");
const SESSION_DATE = new Date("2026-05-01T09:00:00Z");

const BASE_ARGS = {
  thumbnailSrc: "https://picsum.photos/320/170",
  category: "개발",
  createdAt: DEFAULT_CREATED_AT,
  title: "React 스터디 모집합니다",
  nickname: "김개발",
  description: "세션 한 줄 소개",
  currentParticipants: 3,
  maxParticipants: 6,
  durationMinutes: 90,
  sessionDate: SESSION_DATE,
};

function CardStoryFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark" style={{ padding: "20px", background: "#0b0f0e" }}>
      {children}
    </div>
  );
}

// --- Vertical MD (기본) ---
export const VerticalMd: Story = {
  args: {
    ...BASE_ARGS,
    layout: "vertical",
    size: "md",
  },
  decorators: [
    (Story) => (
      <CardStoryFrame>
        <div style={{ width: "320px" }}>
          <Story />
        </div>
      </CardStoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { story: "Figma: layout=vertical, size=md (320px)" },
    },
  },
};

// --- Vertical SM ---
export const VerticalSm: Story = {
  args: {
    ...BASE_ARGS,
    layout: "vertical",
    size: "sm",
  },
  decorators: [
    (Story) => (
      <CardStoryFrame>
        <div style={{ width: "226px" }}>
          <Story />
        </div>
      </CardStoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { story: "Figma: layout=vertical, size=sm (226px)" },
    },
  },
};

// --- Vertical Responsive ---
export const VerticalResponsive: Story = {
  args: {
    ...BASE_ARGS,
    layout: "vertical",
    size: "responsive",
  },
  decorators: [
    (Story) => (
      <CardStoryFrame>
        <div className="w-full md:max-w-69">
          <Story />
        </div>
      </CardStoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Usage: 모바일은 compact density, md 이상은 md density로 전환되는 명시적 반응형 variant",
      },
    },
  },
};

// --- Horizontal MD ---
export const HorizontalMd: Story = {
  args: {
    ...BASE_ARGS,
    layout: "horizontal",
    size: "md",
  },
  decorators: [
    (Story) => (
      <CardStoryFrame>
        <div style={{ width: "528px" }}>
          <Story />
        </div>
      </CardStoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { story: "Figma: layout=horizontal, size=md (528px)" },
    },
  },
};

// --- Horizontal SM ---
export const HorizontalSm: Story = {
  args: {
    ...BASE_ARGS,
    layout: "horizontal",
    size: "sm",
  },
  decorators: [
    (Story) => (
      <CardStoryFrame>
        <div style={{ width: "444px" }}>
          <Story />
        </div>
      </CardStoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { story: "Figma: layout=horizontal, size=sm (444px)" },
    },
  },
};

// --- Horizontal MD — 마감임박 배지 ---
export const HorizontalMdClosing: Story = {
  args: {
    ...BASE_ARGS,
    layout: "horizontal",
    size: "md",
    statusText: "마감임박",
    statusBadgeStatus: "closing",
  },
  decorators: [
    (Story) => (
      <CardStoryFrame>
        <div style={{ width: "528px" }}>
          <Story />
        </div>
      </CardStoryFrame>
    ),
  ],
  parameters: {
    docs: {
      description: { story: "Figma Usage 예시: horizontal md + 마감임박 배지" },
    },
  },
};

// --- showDescription=false ---
export const HideDescription: Story = {
  args: {
    ...BASE_ARGS,
    layout: "vertical",
    size: "md",
    showDescription: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Figma Usage: showDescription=false — description 숨기고 nickname만 표시",
      },
    },
  },
};

// --- 기타 기존 케이스 ---
export const Urgent: Story = {
  args: {
    thumbnailSrc: "https://picsum.photos/320/170?1",
    category: "디자인",
    title: "Figma 협업 스터디",
    nickname: "박디자인",
    statusText: "마감임박",
    statusBadgeStatus: "closing",
    currentParticipants: 5,
    maxParticipants: 6,
    durationMinutes: 60,
    sessionDate: SESSION_DATE,
    size: "md",
  },
  parameters: {
    docs: {
      description: { story: "마감임박 상태 배지를 직접 표시합니다." },
    },
  },
};

export const LongTitle: Story = {
  args: {
    thumbnailSrc: "https://picsum.photos/320/170?3",
    category: "개발",
    createdAt: DEFAULT_CREATED_AT,
    title: "주니어 개발자를 위한 알고리즘 스터디 모집합니다 함께 성장해요",
    nickname: "알고리즘마스터",
    currentParticipants: 4,
    maxParticipants: 8,
    durationMinutes: 180,
    sessionDate: SESSION_DATE,
    size: "md",
  },
  parameters: {
    docs: {
      description: { story: "긴 제목은 말줄임표(...)로 표시됩니다." },
    },
  },
};

export const NoThumbnail: Story = {
  args: {
    thumbnailSrc: null,
    category: "취미",
    createdAt: DEFAULT_CREATED_AT,
    title: "독서 모임",
    nickname: "책벌레",
    currentParticipants: 2,
    maxParticipants: 5,
    durationMinutes: 60,
    sessionDate: SESSION_DATE,
    size: "md",
  },
  parameters: {
    docs: {
      description: { story: "썸네일이 없을 때 placeholder가 표시됩니다." },
    },
  },
};

export const CardList: Story = {
  args: {
    ...BASE_ARGS,
    size: "md",
  },
  render: (args) => (
    <div className="flex flex-col gap-6">
      <Card {...args} />
      <Card
        size="md"
        thumbnailSrc="https://picsum.photos/320/170?11"
        category="디자인"
        createdAt={SECONDARY_CREATED_AT}
        title="Figma 협업 스터디"
        nickname="박디자인"
        currentParticipants={5}
        maxParticipants={6}
        durationMinutes={60}
        sessionDate={SESSION_DATE}
      />
      <Card
        size="md"
        thumbnailSrc="https://picsum.photos/320/170?12"
        category="언어"
        createdAt={RECENT_CREATED_AT}
        title="영어 회화 스터디"
        nickname="이영어"
        currentParticipants={2}
        maxParticipants={4}
        durationMinutes={120}
        sessionDate={SESSION_DATE}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "여러 카드를 목록으로 표시합니다." },
    },
  },
};

export const SkeletonWidthPolicy: CardSkeletonStory = {
  args: {
    layout: "vertical",
    size: "md",
  },
  render: ({ layout, size }) => (
    <div className="flex flex-col gap-8">
      <div className="w-[180px] border border-dashed border-white/20 p-2">
        <CardSkeleton layout={layout} size={size} />
      </div>
      <div className="w-[226px] border border-dashed border-white/20 p-2">
        <CardSkeleton size="sm" />
      </div>
      <div className="w-full border border-dashed border-white/20 p-2 md:max-w-69">
        <CardSkeleton size="responsive" />
      </div>
      <div className="w-full border border-dashed border-white/20 p-2">
        <CardSkeleton className="max-w-full" />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "CardSkeleton의 layout/size/responsive 변형과 부모 컨테이너 폭 정책을 비교합니다.",
      },
    },
  },
};

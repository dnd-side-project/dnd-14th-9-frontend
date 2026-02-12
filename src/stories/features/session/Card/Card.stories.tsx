import { Card } from "@/features/session/components/Card/Card";

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
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e", width: "316px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const NOW = new Date();
const THREE_DAYS_AGO = new Date(NOW.getTime() - 3 * 24 * 60 * 60 * 1000);
const FIVE_HOURS_AGO = new Date(NOW.getTime() - 5 * 60 * 60 * 1000);
const THIRTY_MINUTES_AGO = new Date(NOW.getTime() - 30 * 60 * 1000);
const SESSION_DATE = new Date(NOW.getTime() + 7 * 24 * 60 * 60 * 1000);

export const Default: Story = {
  args: {
    thumbnailSrc: "https://picsum.photos/276/146",
    category: "개발",
    createdAt: THREE_DAYS_AGO,
    title: "React 스터디 모집합니다",
    nickname: "김개발",
    currentParticipants: 3,
    maxParticipants: 6,
    durationMinutes: 90,
    sessionDate: SESSION_DATE,
  },
};

export const Urgent: Story = {
  args: {
    thumbnailSrc: "https://picsum.photos/276/146?1",
    category: "디자인",
    createdAt: THIRTY_MINUTES_AGO,
    title: "Figma 협업 스터디",
    nickname: "박디자인",
    currentParticipants: 5,
    maxParticipants: 6,
    durationMinutes: 60,
    sessionDate: SESSION_DATE,
  },
  parameters: {
    docs: {
      description: {
        story: "1시간 미만일 때 '마감임박'으로 표시됩니다.",
      },
    },
  },
};

export const RecentlyCreated: Story = {
  args: {
    thumbnailSrc: "https://picsum.photos/276/146?2",
    category: "언어",
    createdAt: FIVE_HOURS_AGO,
    title: "영어 회화 스터디",
    nickname: "이영어",
    currentParticipants: 2,
    maxParticipants: 4,
    durationMinutes: 120,
    sessionDate: SESSION_DATE,
  },
  parameters: {
    docs: {
      description: {
        story: "1시간~24시간 사이일 때 'n시간 전'으로 표시됩니다.",
      },
    },
  },
};

export const LongTitle: Story = {
  args: {
    thumbnailSrc: "https://picsum.photos/276/146?3",
    category: "개발",
    createdAt: THREE_DAYS_AGO,
    title: "주니어 개발자를 위한 알고리즘 스터디 모집합니다 함께 성장해요",
    nickname: "알고리즘마스터",
    currentParticipants: 4,
    maxParticipants: 8,
    durationMinutes: 180,
    sessionDate: SESSION_DATE,
  },
  parameters: {
    docs: {
      description: {
        story: "긴 제목은 말줄임표(...)로 표시됩니다.",
      },
    },
  },
};

export const NoThumbnail: Story = {
  args: {
    thumbnailSrc: null,
    category: "취미",
    createdAt: THREE_DAYS_AGO,
    title: "독서 모임",
    nickname: "책벌레",
    currentParticipants: 2,
    maxParticipants: 5,
    durationMinutes: 60,
    sessionDate: SESSION_DATE,
  },
  parameters: {
    docs: {
      description: {
        story: "썸네일이 없을 때 placeholder가 표시됩니다.",
      },
    },
  },
};

export const CardList: Story = {
  args: {
    thumbnailSrc: "https://picsum.photos/276/146",
    category: "개발",
    createdAt: THREE_DAYS_AGO,
    title: "React 스터디",
    nickname: "김개발",
    currentParticipants: 3,
    maxParticipants: 6,
    durationMinutes: 90,
    sessionDate: SESSION_DATE,
  },
  render: () => (
    <div className="flex flex-col gap-6">
      <Card
        thumbnailSrc="https://picsum.photos/276/146?10"
        category="개발"
        createdAt={THREE_DAYS_AGO}
        title="React 스터디 모집합니다"
        nickname="김개발"
        currentParticipants={3}
        maxParticipants={6}
        durationMinutes={90}
        sessionDate={SESSION_DATE}
      />
      <Card
        thumbnailSrc="https://picsum.photos/276/146?11"
        category="디자인"
        createdAt={FIVE_HOURS_AGO}
        title="Figma 협업 스터디"
        nickname="박디자인"
        currentParticipants={5}
        maxParticipants={6}
        durationMinutes={60}
        sessionDate={SESSION_DATE}
      />
      <Card
        thumbnailSrc="https://picsum.photos/276/146?12"
        category="언어"
        createdAt={THIRTY_MINUTES_AGO}
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
      description: {
        story: "여러 카드를 목록으로 표시합니다.",
      },
    },
  },
};

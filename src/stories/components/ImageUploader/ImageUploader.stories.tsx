import { useEffect, useState } from "react";

import { ImageUploader } from "@/components/ImageUploader/ImageUploader";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const meta = {
  title: "Components/ImageUploader",
  component: ImageUploader,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "이미지 업로드를 위한 드래그앤드롭 및 클릭 영역 컴포넌트입니다. 업로드 진행 상태를 시각적으로 표시합니다.",
      },
    },
    backgrounds: {
      default: "dark",
    },
  },
  argTypes: {
    onFileSelect: {
      action: "fileSelected",
      description: "파일 선택 시 호출되는 콜백",
    },
    uploadProgress: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "업로드 진행률 (0-100)",
    },
    accept: {
      control: "text",
      description: "허용할 파일 타입",
    },
    maxFileSize: {
      control: "number",
      description: "최대 파일 크기 (bytes)",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    hintText: {
      control: "text",
      description: "힌트 텍스트",
    },
    uploadingText: {
      control: "text",
      description: "업로드 중 텍스트",
    },
  },
  decorators: [
    (Story) => (
      <div className="dark" style={{ padding: "20px", background: "#0b0f0e", width: "420px" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ImageUploader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "기본 상태의 이미지 업로더입니다. 점선 테두리와 클라우드 아이콘이 표시됩니다.",
      },
    },
  },
};

export const Wide: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div
        className="dark"
        style={{ padding: "20px", background: "#0b0f0e", width: "1088px", minWidth: "1088px" }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "fullscreen",
    viewport: {
      defaultViewport: "desktop",
    },
    docs: {
      description: {
        story: "1088px 너비의 이미지 업로더입니다.",
      },
    },
  },
};

export const CustomHint: Story = {
  args: {
    hintText: "PNG, JPG, GIF (최대 10MB)",
    maxFileSize: 10 * 1024 * 1024,
  },
  parameters: {
    docs: {
      description: {
        story: "커스텀 힌트 텍스트와 파일 크기 제한을 설정한 예시입니다.",
      },
    },
  },
};

export const Uploading: Story = {
  args: {
    uploadProgress: 45,
  },
  parameters: {
    docs: {
      description: {
        story: "업로드 진행 중 상태입니다. 도넛형 프로그레스 바와 퍼센트가 표시됩니다.",
      },
    },
  },
};

export const UploadingAnimated: Story = {
  render: (args) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }, []);

    return <ImageUploader {...args} uploadProgress={progress} />;
  },
  args: {},
  parameters: {
    docs: {
      description: {
        story: "업로드 진행률이 자동으로 증가하는 애니메이션 데모입니다.",
      },
    },
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "비활성화된 상태의 이미지 업로더입니다.",
      },
    },
  },
};

export const WithFileSelection: Story = {
  render: (args) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    return (
      <div className="flex flex-col gap-4">
        <ImageUploader
          {...args}
          onFileSelect={(file) => {
            setSelectedFile(file);
            args.onFileSelect?.(file);
          }}
        />
        {selectedFile && (
          <div className="text-text-secondary text-sm">
            선택된 파일: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)}KB)
          </div>
        )}
      </div>
    );
  },
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "파일을 선택하면 파일 정보가 표시됩니다. 드래그앤드롭 또는 클릭으로 파일을 선택해보세요.",
      },
    },
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-text-secondary mb-2 text-sm">Default</p>
        <ImageUploader />
      </div>
      <div>
        <p className="text-text-secondary mb-2 text-sm">Uploading (45%)</p>
        <ImageUploader uploadProgress={45} />
      </div>
      <div>
        <p className="text-text-secondary mb-2 text-sm">Disabled</p>
        <ImageUploader disabled />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "ImageUploader 컴포넌트의 모든 상태를 한눈에 비교합니다.",
      },
    },
  },
};

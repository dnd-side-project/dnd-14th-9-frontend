"use client";

import { Button } from "@/components/Button/Button";
import { TextInput } from "@/components/Input/TextInput";

interface ChatMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  /** 참여자(비호스트)는 입력이 비활성화된다 */
  disabled?: boolean;
}

export function ChatMessageInput({
  value,
  onChange,
  onSend,
  disabled = false,
}: ChatMessageInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <TextInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="텍스트를 입력해 주세요"
        maxLength={200}
        disabled={disabled}
        fullWidth
        containerClassName="flex-1"
      />
      <Button
        variant="solid"
        colorScheme="primary"
        size="medium"
        onClick={onSend}
        disabled={disabled}
      >
        보내기
      </Button>
    </div>
  );
}

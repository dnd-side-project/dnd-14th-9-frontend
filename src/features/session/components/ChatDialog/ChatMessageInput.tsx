"use client";

import { Button } from "@/components/Button/Button";
import { TextInput } from "@/components/Input/TextInput";

interface ChatMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  /** 참여자(비호스트)는 입력이 비활성화된다 */
  disabled?: boolean;
  /** 퀵액션 선택 중에는 지정 문구를 수정할 수 없다 (전송은 가능) */
  readOnly?: boolean;
}

export function ChatMessageInput({
  value,
  onChange,
  onSend,
  disabled = false,
  readOnly = false,
}: ChatMessageInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // 한글 IME 조합 중 Enter(글자 확정)는 전송으로 처리하지 않는다
    if (event.key === "Enter" && !event.nativeEvent.isComposing) {
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
        readOnly={readOnly}
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

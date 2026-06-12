import { Button } from "@/components/Button/Button";

interface SessionListErrorStateProps {
  onRetry: () => void;
}

export function SessionListErrorState({ onRetry }: SessionListErrorStateProps) {
  return (
    <div className="border-border-default bg-surface-strong flex h-60 flex-col items-center justify-center gap-4 rounded-sm border px-4 text-center">
      <div className="flex flex-col gap-1">
        <p className="text-text-primary text-sm font-semibold">세션 목록을 불러오지 못했습니다</p>
        <p className="text-text-muted text-xs">잠시 후 다시 시도해주세요.</p>
      </div>
      <Button
        type="button"
        variant="outlined"
        colorScheme="secondary"
        size="small"
        onClick={onRetry}
      >
        다시 불러오기
      </Button>
    </div>
  );
}

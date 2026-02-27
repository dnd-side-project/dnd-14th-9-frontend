import { useCallback } from "react";

import { toast } from "@/lib/toast";
import { getSessionShareUrl } from "@/lib/utils/url";

export function useShareSession() {
  const shareSession = useCallback(async (sessionId: number) => {
    const url = getSessionShareUrl(sessionId);

    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 복사되었습니다");
    } catch {
      toast.error("링크 복사에 실패했습니다");
    }
  }, []);

  return { shareSession };
}

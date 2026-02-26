import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/features/auth/api";
import { memberKeys } from "@/features/member/hooks/useMemberHooks";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      // 사용자 관련 캐시만 제거
      queryClient.removeQueries({ queryKey: memberKeys.all });
      queryClient.removeQueries({ queryKey: ["lobby"] });
      queryClient.removeQueries({ queryKey: ["session", "waitingRoom"] });
      queryClient.removeQueries({ queryKey: ["session", "inProgress"] });
      queryClient.removeQueries({ queryKey: ["session", "myReport"] });

      // 공개 데이터는 무효화하여 재요청
      queryClient.invalidateQueries({ queryKey: ["session", "list"] });
    },
  });
}

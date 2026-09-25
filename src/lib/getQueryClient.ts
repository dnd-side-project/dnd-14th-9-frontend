import { cache } from "react";

import {
  isServer,
  QueryCache,
  QueryClient,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";

import { isAuthRejectedError } from "@/lib/api/api-client";
import { toast } from "@/lib/toast";

function makeQueryClient() {
  return new QueryClient({
    // 재시도까지 모두 실패했을 때 쿼리당 한 번 호출되므로, 구독 컴포넌트 수와 무관하게 토스트가 한 번만 뜬다.
    // meta.transientErrorToast를 지정한 쿼리의 일시 실패(인증 거부 제외)만 안내한다.
    queryCache: new QueryCache({
      onError: (error, query) => {
        const message = query.meta?.transientErrorToast;
        if (typeof message === "string" && !isAuthRejectedError(error)) {
          toast.error(message);
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;
const getServerQueryClient = cache(makeQueryClient);

export function getQueryClient() {
  if (isServer) return getServerQueryClient();
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

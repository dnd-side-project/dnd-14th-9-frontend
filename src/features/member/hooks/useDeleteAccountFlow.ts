"use client";

import { useRouter } from "next/navigation";

import { getApiErrorMessage } from "@/lib/error/api-error-utils";
import { toast } from "@/lib/toast";

import { useDeleteMe } from "./useMemberHooks";

export function useDeleteAccountFlow() {
  const router = useRouter();
  const { mutate: deleteMe, isPending: isDeleting } = useDeleteMe();

  const deleteAccount = () => {
    if (isDeleting) return;

    deleteMe(undefined, {
      onSuccess: () => {
        router.replace("/");
        router.refresh();
      },
      onError: (error: unknown) => {
        toast.error(getApiErrorMessage(error));
      },
    });
  };

  return { deleteAccount, isDeleting };
}

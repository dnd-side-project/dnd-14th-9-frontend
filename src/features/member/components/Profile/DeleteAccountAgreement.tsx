"use client";

import { useEffect, useState } from "react";

import { CheckIcon } from "@/components/Icon/CheckIcon";
import { cn } from "@/lib/utils/utils";

interface CheckboxItemProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CheckboxItem({ label, checked, onChange }: CheckboxItemProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="focus-visible:ring-primary text-text-secondary hover:text-text-primary gap-sm flex w-full cursor-pointer items-center rounded-[4px] text-left transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <span
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border border-solid",
          checked
            ? "border-border-primary-default bg-surface-primary-alpha-subtle text-text-brand-default"
            : "border-border-strong bg-transparent text-transparent"
        )}
      >
        <CheckIcon size="xsmall" />
      </span>
      <span className="text-[15px] leading-[1.4]">{label}</span>
    </button>
  );
}

export interface DeleteAccountAgreementProps {
  onAgreementChange?: (allAgreed: boolean) => void;
}

export function DeleteAccountAgreement({ onAgreementChange }: DeleteAccountAgreementProps) {
  const [agreements, setAgreements] = useState({
    notice: false,
    data: false,
  });

  const handleToggle = (key: keyof typeof agreements) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    onAgreementChange?.(Object.values(agreements).every(Boolean));
  }, [agreements, onAgreementChange]);

  return (
    <div className="gap-md flex flex-col">
      <CheckboxItem
        label="회원 탈퇴 이후 참여 세션 기록, 목표 및 통계 데이터가 영구적으로 삭제됨을 이해하고 동의합니다."
        checked={agreements.notice}
        onChange={() => handleToggle("notice")}
      />
      <CheckboxItem
        label="계정 및 프로필 정보가 모두 삭제되며 복구할 수 없음에 동의합니다."
        checked={agreements.data}
        onChange={() => handleToggle("data")}
      />
    </div>
  );
}

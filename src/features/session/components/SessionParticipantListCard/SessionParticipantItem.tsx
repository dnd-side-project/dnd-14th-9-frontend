import { Avatar } from "@/components/Avatar/Avatar";
import { ChipBadge } from "@/components/ChipBadge/ChipBadge";
import { CheckIcon } from "@/components/Icon/CheckIcon";
import { ChevronDownIcon } from "@/components/Icon/ChevronDownIcon";
import { formatHHMMSS } from "@/lib/utils/format";
import { cn } from "@/lib/utils/utils";

import type { InProgressMember } from "../../types";

interface SessionParticipantItemProps {
  member: InProgressMember;
  isExpanded: boolean;
  onToggle: () => void;
}

/** 참여자 목록의 한 항목 (Figma Select 세트: 항목 카드 + 펼침 시 투두 패널). 펼침 상태는 부모가 가진다 */
export function SessionParticipantItem({
  member,
  isExpanded,
  onToggle,
}: SessionParticipantItemProps) {
  const todos = member.task?.todos ?? [];
  const completedCount = todos.filter((t) => t.isCompleted).length;
  const isFocusing = member.status === "FOCUSED";
  const isHost = member.role === "HOST";

  return (
    <li className="gap-xs flex flex-col">
      <div className="bg-surface-strong p-md gap-md relative flex items-start rounded-lg">
        {/* 프로필 이미지 */}
        <Avatar
          className="shrink-0"
          size="xlarge"
          type={member.profileImageUrl ? "image" : "empty"}
          src={member.profileImageUrl}
          alt={member.nickname}
          showBadge={isHost}
        />

        {/* 정보 */}
        <div className="gap-sm flex min-w-0 flex-1 flex-col">
          <div className="gap-3xs flex flex-col">
            {/* 오른쪽 위에 겹쳐 놓인 펼침 버튼(24px + 여백 8px)과 닉네임이 겹치지 않게 비운다 */}
            <span className="text-text-primary pr-2xl text-base leading-[1.4] font-semibold">
              {member.nickname}
            </span>
            <span className="text-text-muted truncate text-xs leading-[1.4]">
              {member.task?.goal}
            </span>
          </div>

          <div className="gap-sm flex items-center">
            <span className="gap-xs flex items-center">
              {/* 현재 상태 (집중 중 / 자리비움) */}
              <span
                className={cn(
                  "gap-xs flex shrink-0 items-center text-xs leading-[1.4] font-semibold whitespace-nowrap",
                  isFocusing ? "text-text-status-positive-default" : "text-text-tertiary"
                )}
              >
                <svg
                  className={
                    isFocusing ? "text-text-status-positive-default" : "text-text-disabled"
                  }
                  width="6"
                  height="6"
                  viewBox="0 0 6 6"
                  fill="currentColor"
                >
                  <circle cx="3" cy="3" r="3" />
                </svg>
                {isFocusing ? "집중 중" : "자리비움"}
              </span>

              {/* 누적 집중 시간 — 값이 있을 때만 (집중 중 하늘색 / 자리비움 회색) */}
              {typeof member.totalFocusSeconds === "number" && (
                <ChipBadge
                  radius="xs"
                  status={isFocusing ? "positive" : "recruiting"}
                  className="leading-[1.4]"
                >
                  {formatHHMMSS(member.totalFocusSeconds)}
                </ChipBadge>
              )}
            </span>

            <span
              data-testid="status-divider"
              aria-hidden="true"
              className="bg-border-default h-[18px] w-px shrink-0"
            />

            {/* 투두 달성률 */}
            <span className="gap-xs flex items-center">
              <span className="text-text-tertiary shrink-0 text-xs leading-[1.4] font-semibold whitespace-nowrap">
                투두 달성률
              </span>
              <ChipBadge radius="xs" className="leading-[1.4]">
                {member.achievementRate}%
              </ChipBadge>
            </span>
          </div>
        </div>

        {/* 토글 버튼 — 레이아웃 폭을 차지하지 않고 오른쪽 위에 겹쳐 놓는다 (Figma Dropdown Icon) */}
        <button
          type="button"
          className="top-md right-md absolute flex size-6 cursor-pointer items-center justify-center"
          onClick={onToggle}
          aria-label={isExpanded ? "할 일 접기" : "할 일 펼치기"}
        >
          <ChevronDownIcon
            size="medium"
            className={`text-text-muted transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* 펼침 영역: 항목 아래 별도 카드로 Todo 목록 (Figma todo 변형) */}
      {isExpanded && todos.length > 0 && (
        <div className="bg-surface-strong p-lg gap-md flex flex-col rounded-lg">
          <p className="gap-2xs flex items-center text-base leading-[1.4] font-semibold">
            <span className="text-text-primary">투두리스트</span>
            <span className="text-text-brand-subtler">
              {completedCount}/{todos.length}
            </span>
          </p>
          <ul className="gap-xs flex flex-col">
            {todos.map((todo) => (
              <li key={todo.subtaskId} className="p-2xs gap-sm flex items-center">
                {/* 완료 상태 체크 표시 */}
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-xs border",
                    todo.isCompleted
                      ? "border-border-primary-default bg-surface-primary-alpha-subtle"
                      : "border-border-strong"
                  )}
                >
                  {todo.isCompleted && (
                    <CheckIcon size="small" className="text-text-brand-default" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-[15px] leading-[1.4]",
                    todo.isCompleted ? "text-text-muted line-through" : "text-text-secondary"
                  )}
                >
                  {todo.content}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

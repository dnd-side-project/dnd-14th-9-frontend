import type { FILTER_VARIANTS } from "../Filter/Filter";
import type { VariantProps } from "class-variance-authority";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps extends Omit<VariantProps<typeof FILTER_VARIANTS>, "bordered"> {
  /** 드롭다운 옵션 목록 */
  options: DropdownOption[];
  /** 선택된 값 (controlled) */
  value?: string;
  /** 기본 선택 값 (uncontrolled) */
  defaultValue?: string;
  /** 선택 변경 시 콜백 */
  onChange?: (value: string) => void;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 컨테이너 className */
  className?: string;
}

export interface DropdownOptionProps {
  option: DropdownOption;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

export interface UseDropdownProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export interface UseDropdownReturn {
  isOpen: boolean;
  selectedValue: string | null;
  focusedIndex: number;
  setIsOpen: (open: boolean) => void;
  toggle: () => void;
  selectOption: (value: string) => void;
  setFocusedIndex: (index: number) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  listRef: React.RefObject<HTMLUListElement | null>;
}

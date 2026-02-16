import { useCallback, useEffect, useRef, useState } from "react";

import type { UseDropdownProps, UseDropdownReturn } from "./Dropdown.types";

export function useDropdown({
  value,
  defaultValue,
  onChange,
  disabled,
}: UseDropdownProps): UseDropdownReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<string | null>(defaultValue ?? null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // controlled vs uncontrolled
  const isControlled = value !== undefined;
  const selectedValue = isControlled ? value : internalValue;

  const toggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => {
      if (!prev) {
        // opening: reset focus index
        setFocusedIndex(-1);
      }
      return !prev;
    });
  }, [disabled]);

  const selectOption = useCallback(
    (optionValue: string) => {
      if (!isControlled) {
        setInternalValue(optionValue);
      }
      onChange?.(optionValue);
      setIsOpen(false);
      setFocusedIndex(-1);
    },
    [isControlled, onChange]
  );

  // Click outside & Escape key handling
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  return {
    isOpen,
    selectedValue: selectedValue ?? null,
    focusedIndex,
    setIsOpen,
    toggle,
    selectOption,
    setFocusedIndex,
    containerRef,
    listRef,
  };
}

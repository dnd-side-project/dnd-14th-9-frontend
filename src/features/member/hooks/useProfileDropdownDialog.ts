"use client";

import { useEffect, useId, useRef, useState } from "react";

export function useProfileDropdownDialog() {
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dialogId = useId();
  const dialogTitleId = `${dialogId}-title`;
  const [isOpen, setIsOpen] = useState(false);

  const closeDropdown = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!isOpen) return;

    dialogRef.current?.focus();

    const closeDropdownWithoutFocus = () => {
      setIsOpen(false);
    };

    const handleClickOutside = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (!containerRef.current?.contains(target)) {
        closeDropdownWithoutFocus();
      }
    };

    const handleFocusOutside = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (!containerRef.current?.contains(target)) {
        closeDropdownWithoutFocus();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDropdown();
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    document.addEventListener("focusin", handleFocusOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
      document.removeEventListener("focusin", handleFocusOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen]);

  return {
    isOpen,
    dialogId,
    dialogTitleId,
    containerRef,
    triggerRef,
    dialogRef,
    closeDropdown,
    toggleDropdown,
  };
}

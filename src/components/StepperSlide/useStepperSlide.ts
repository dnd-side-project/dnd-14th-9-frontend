import { useState, useRef, useEffect } from "react";

interface UseStepperSlideOptions {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  limit?: number;
  disabled?: boolean;
}

interface UseStepperSlideReturn {
  isDragging: boolean;
  percentage: number;
  /** 실제로 선택 가능한 최대값 (limit 반영) */
  selectableMax: number;
  trackRef: React.RefObject<HTMLDivElement | null>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleTrackClick: (e: React.MouseEvent) => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

export function useStepperSlide({
  value,
  onChange,
  min = 0,
  max = 100,
  limit,
  disabled = false,
}: UseStepperSlideOptions): UseStepperSlideReturn {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  // limit은 눈금 스케일(min~max)은 그대로 두고 선택 상한만 낮춘다.
  // 소수점 비율(예: 63.5)이 들어와도 상한을 넘기지 않도록 내림한다.
  const selectableMax = limit === undefined ? max : Math.min(max, Math.max(min, Math.floor(limit)));

  const getValueFromPosition = (clientX: number) => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const position = (clientX - rect.left) / rect.width;
    const rawValue = min + position * (max - min);
    return Math.round(Math.min(selectableMax, Math.max(min, rawValue)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (disabled || isDragging) return;
    const newValue = getValueFromPosition(e.clientX);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    let newValue = value;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        newValue = Math.min(selectableMax, value + 1);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        newValue = Math.max(min, value - 1);
        break;
      case "Home":
        newValue = min;
        break;
      case "End":
        newValue = selectableMax;
        break;
      default:
        return;
    }
    if (newValue !== value) {
      e.preventDefault();
      onChange(newValue);
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromPosition(e.clientX);
      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, getValueFromPosition, onChange]);

  return {
    isDragging,
    percentage,
    selectableMax,
    trackRef,
    handleMouseDown,
    handleTrackClick,
    handleKeyDown,
  };
}

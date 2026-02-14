import { useState, useRef, useCallback, useEffect } from "react";

interface UseStepperSlideOptions {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

interface UseStepperSlideReturn {
  isDragging: boolean;
  percentage: number;
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
  disabled = false,
}: UseStepperSlideOptions): UseStepperSlideReturn {
  const [isDragging, setIsDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  const percentage = ((value - min) / (max - min)) * 100;

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return value;
      const rect = trackRef.current.getBoundingClientRect();
      const position = (clientX - rect.left) / rect.width;
      const rawValue = min + position * (max - min);
      return Math.round(Math.min(max, Math.max(min, rawValue)));
    },
    [min, max, value]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;
      e.preventDefault();
      setIsDragging(true);
    },
    [disabled]
  );

  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled || isDragging) return;
      const newValue = getValueFromPosition(e.clientX);
      onChange(newValue);
    },
    [disabled, isDragging, getValueFromPosition, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      let newValue = value;
      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          newValue = Math.min(max, value + 1);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          newValue = Math.max(min, value - 1);
          break;
        case "Home":
          newValue = min;
          break;
        case "End":
          newValue = max;
          break;
        default:
          return;
      }
      if (newValue !== value) {
        e.preventDefault();
        onChange(newValue);
      }
    },
    [disabled, value, min, max, onChange]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newValue = getValueFromPosition(e.clientX);
      if (newValue !== value) {
        onChange(newValue);
      }
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
  }, [isDragging, getValueFromPosition, value, onChange]);

  return {
    isDragging,
    percentage,
    trackRef,
    handleMouseDown,
    handleTrackClick,
    handleKeyDown,
  };
}

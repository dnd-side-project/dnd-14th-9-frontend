import { useState, useRef, useCallback } from "react";

export interface UseDragAndDropOptions {
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 파일 드롭 시 콜백 */
  onFileDrop?: (file: File) => void;
  /** 컨테이너 ref (마우스 위치 계산용) */
  containerRef?: React.RefObject<HTMLElement | null>;
}

export interface UseDragAndDropReturn {
  /** 드래그 중 여부 */
  isDragging: boolean;
  /** 드래그 중인 파일명 */
  dragFileName: string | null;
  /** 마우스 위치 (컨테이너 기준) */
  mousePosition: { x: number; y: number };
  /** 드래그 이벤트 핸들러들 */
  dragHandlers: {
    onDragEnter: (e: React.DragEvent<HTMLElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLElement>) => void;
    onDrop: (e: React.DragEvent<HTMLElement>) => void;
  };
  /** 드래그 상태 초기화 */
  resetDragState: () => void;
}

/**
 * 파일 드래그 앤 드롭을 처리하는 커스텀 훅
 */
export function useDragAndDrop({
  disabled = false,
  onFileDrop,
  containerRef,
}: UseDragAndDropOptions = {}): UseDragAndDropReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [dragFileName, setDragFileName] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const dragCounter = useRef(0);

  const extractFileName = useCallback((e: React.DragEvent<HTMLElement>): string | null => {
    // files에서 파일명 추출 시도 (드롭 시 동작)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      return e.dataTransfer.files[0].name;
    }

    // items에서 파일명 추출 시도
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file?.name) {
          return file.name;
        }
      }
    }

    // 대체: 파일이 드래그 중인지 확인
    if (e.dataTransfer.types.includes("Files")) {
      return "파일";
    }

    return null;
  }, []);

  const resetDragState = useCallback(() => {
    setIsDragging(false);
    setDragFileName(null);
    dragCounter.current = 0;
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      dragCounter.current++;
      if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
        setIsDragging(true);
        const fileName = extractFileName(e);
        if (fileName) {
          setDragFileName(fileName);
        }
      }
    },
    [disabled, extractFileName]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;

      dragCounter.current--;
      if (dragCounter.current === 0) {
        setIsDragging(false);
        setDragFileName(null);
      }
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (containerRef?.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }

      // 파일명이 아직 설정되지 않은 경우 추출 시도
      if (!dragFileName || dragFileName === "파일") {
        const fileName = extractFileName(e);
        if (fileName && fileName !== "파일") {
          setDragFileName(fileName);
        } else if (!dragFileName && fileName) {
          setDragFileName(fileName);
        }
      }
    },
    [containerRef, dragFileName, extractFileName]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLElement>) => {
      e.preventDefault();
      e.stopPropagation();
      resetDragState();

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        onFileDrop?.(files[0]);
      }
    },
    [disabled, onFileDrop, resetDragState]
  );

  return {
    isDragging,
    dragFileName,
    mousePosition,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
    resetDragState,
  };
}

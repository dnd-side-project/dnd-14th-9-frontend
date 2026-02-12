"use client";

import { forwardRef, useRef, useCallback, useId, type InputHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { cn } from "@/lib/utils/utils";

import { Button } from "../Button/Button";
import { CloudUploadIcon } from "../Icon/CloudUploadIcon";
import { FileIcon } from "../Icon/FileIcon";
import { ProgressRing } from "../ProgressRing/ProgressRing";

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const imageUploaderVariants = cva(
  [
    "relative",
    "flex",
    "flex-col",
    "items-center",
    "justify-between",
    "w-full",
    "min-h-[144px]",
    "py-6",
    "rounded-lg",
    "border-2",
    "cursor-pointer",
    "transition-all",
    "duration-200",
    "outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-green-600",
    "focus-visible:ring-offset-2",
    "focus-visible:ring-offset-gray-950",
  ],
  {
    variants: {
      state: {
        default: ["border-dashed", "border-green-600", "bg-transparent", "hover:bg-green-950"],
        dragging: ["border-solid", "border-green-600", "bg-green-950"],
        uploading: ["border-solid", "border-green-600", "bg-transparent", "cursor-default"],
      },
      disabled: {
        true: ["cursor-not-allowed", "opacity-50", "border-gray-600", "hover:bg-transparent"],
        false: "",
      },
    },
    defaultVariants: {
      state: "default",
      disabled: false,
    },
  }
);

type UploadState = "default" | "dragging" | "uploading";

export interface ImageUploaderProps
  extends
    Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value">,
    VariantProps<typeof imageUploaderVariants> {
  /** 파일 선택 시 콜백 */
  onFileSelect?: (file: File | null) => void;
  /** 업로드 진행률 (0-100), 설정 시 uploading 상태로 전환 */
  uploadProgress?: number;
  /** 허용할 파일 타입 (기본값: image/*) */
  accept?: string;
  /** 최대 파일 크기 (bytes, 기본값: 5MB) */
  maxFileSize?: number;
  /** 파일 크기 초과 시 콜백 */
  onFileSizeError?: (file: File, maxSize: number) => void;
  /** 비활성화 상태 */
  disabled?: boolean;
  /** 힌트 텍스트 (기본값: "최대 5MB 파일만 허용 가능") */
  hintText?: string;
  /** 업로드 중 텍스트 (기본값: "업로드 중...") */
  uploadingText?: string;
  /** 컨테이너 클래스 */
  containerClassName?: string;
  /** 업로드 취소 시 콜백 */
  onCancel?: () => void;
}

export const ImageUploader = forwardRef<HTMLInputElement, ImageUploaderProps>(
  (
    {
      className,
      containerClassName,
      onFileSelect,
      uploadProgress,
      accept = "image/*",
      maxFileSize = DEFAULT_MAX_FILE_SIZE,
      onFileSizeError,
      disabled = false,
      hintText = "최대 5MB 파일만 허용 가능",
      uploadingText = "업로드 중...",
      onCancel,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const internalInputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const isUploading = uploadProgress !== undefined && uploadProgress >= 0 && uploadProgress < 100;

    const handleFileSelection = useCallback(
      (file: File | null) => {
        if (!file) {
          onFileSelect?.(null);
          return;
        }

        if (file.size > maxFileSize) {
          onFileSizeError?.(file, maxFileSize);
          return;
        }

        onFileSelect?.(file);
      },
      [maxFileSize, onFileSelect, onFileSizeError]
    );

    const { isDragging, dragFileName, mousePosition, dragHandlers } = useDragAndDrop({
      disabled: disabled || isUploading,
      onFileDrop: handleFileSelection,
      containerRef,
    });

    const state: UploadState = isUploading ? "uploading" : isDragging ? "dragging" : "default";

    const handleClick = useCallback(() => {
      if (disabled || isUploading) return;
      internalInputRef.current?.click();
    }, [disabled, isUploading]);

    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileSelection(file);
        e.target.value = "";
      },
      [handleFileSelection]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      },
      [handleClick]
    );

    return (
      <div className={cn("w-full", containerClassName)}>
        <div
          ref={containerRef}
          className={cn(imageUploaderVariants({ state, disabled, className }))}
          onDragEnter={dragHandlers.onDragEnter}
          onDragLeave={dragHandlers.onDragLeave}
          onDragOver={dragHandlers.onDragOver}
          onDrop={dragHandlers.onDrop}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          role="button"
          tabIndex={disabled || isUploading ? -1 : 0}
          aria-label="이미지 업로드 영역"
          aria-disabled={disabled || isUploading}
        >
          {/* 숨겨진 파일 input */}
          <input
            ref={(node) => {
              internalInputRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            type="file"
            id={inputId}
            accept={accept}
            disabled={disabled || isUploading}
            onChange={handleFileChange}
            className="sr-only"
            aria-describedby={`${inputId}-hint`}
            {...props}
          />

          {/* 드래그 중 파일명 툴팁 - OS 프리뷰 위에 표시되도록 위쪽에 배치 */}
          {isDragging && dragFileName && (
            <div
              className="pointer-events-none absolute z-50 flex items-center gap-1.5 rounded bg-green-600 px-2 py-1 shadow-lg"
              style={{
                left: mousePosition.x + 16,
                top: mousePosition.y - 36,
              }}
            >
              <FileIcon size="xsmall" className="text-white" />
              <span className="text-xs font-medium text-gray-800">{dragFileName}</span>
            </div>
          )}

          {/* 상태별 콘텐츠 렌더링 */}
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <ProgressRing progress={uploadProgress!} />
              <span id={`${inputId}-hint`} className="text-text-secondary text-sm leading-[1.43]">
                {uploadingText}
              </span>
              <Button
                variant="outlined"
                colorScheme="secondary"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onCancel?.();
                }}
              >
                취소하기
              </Button>
            </div>
          ) : (
            <>
              <CloudUploadIcon size="xlarge" className="text-green-600" />
              <span className="text-sm text-gray-50">커버 사진을 등록해주세요</span>
              <span id={`${inputId}-hint`} className="text-text-secondary text-sm leading-[1.43]">
                {hintText}
              </span>
            </>
          )}
        </div>
      </div>
    );
  }
);

ImageUploader.displayName = "ImageUploader";

export { imageUploaderVariants };

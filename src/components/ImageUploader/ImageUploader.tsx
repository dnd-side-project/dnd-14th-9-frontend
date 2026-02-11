"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, useState, useRef, useCallback, useId, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils/utils";
import { CloudUploadIcon } from "../Icon/CloudUploadIcon";
import { ProgressRing } from "../ProgressRing/ProgressRing";

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const imageUploaderVariants = cva(
  [
    "relative",
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "gap-4",
    "w-full",
    "min-h-[144px]",
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
        default: ["border-dashed", "border-green-600", "bg-transparent", "hover:bg-green-950/30"],
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
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const internalInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);

    const [isDragging, setIsDragging] = useState(false);

    const getState = useCallback((): UploadState => {
      if (uploadProgress !== undefined && uploadProgress >= 0 && uploadProgress < 100) {
        return "uploading";
      }
      if (isDragging) {
        return "dragging";
      }
      return "default";
    }, [uploadProgress, isDragging]);

    const state = getState();
    const isUploading = state === "uploading";

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

    const handleDragEnter = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled || isUploading) return;

        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
          setIsDragging(true);
        }
      },
      [disabled, isUploading]
    );

    const handleDragLeave = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (disabled || isUploading) return;

        dragCounter.current--;
        if (dragCounter.current === 0) {
          setIsDragging(false);
        }
      },
      [disabled, isUploading]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        dragCounter.current = 0;

        if (disabled || isUploading) return;

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
          handleFileSelection(files[0]);
        }
      },
      [disabled, isUploading, handleFileSelection]
    );

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
          className={cn(imageUploaderVariants({ state, disabled, className }))}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
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

          {/* 상태별 콘텐츠 렌더링 */}
          {isUploading ? (
            <>
              <ProgressRing progress={uploadProgress!} />
              <span
                id={`${inputId}-hint`}
                className="text-text-secondary text-sm leading-[1.43]"
                style={{ fontSize: "14px" }}
              >
                {uploadingText}
              </span>
            </>
          ) : (
            <>
              <CloudUploadIcon size="xlarge" className="text-green-600" />
              <span
                id={`${inputId}-hint`}
                className="text-text-secondary text-sm leading-[1.43]"
                style={{ fontSize: "14px" }}
              >
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

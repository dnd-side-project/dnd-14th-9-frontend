"use client";

import { useRef, useId, type InputHTMLAttributes } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { cn } from "@/lib/utils/utils";

import { Button } from "../Button/Button";
import { FileIcon } from "../Icon/FileIcon";
import { ImageIcon } from "../Icon/ImageIcon";
import { TimerCircular } from "../TimerCircular/TimerCircular";

const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const imageUploaderVariants = cva(
  [
    "relative",
    "flex",
    "flex-col",
    "items-center",
    "justify-center",
    "gap-3",
    "w-full",
    // 시안의 선은 안쪽에 그려져 패딩에 포함된다. 테두리 대신 inset ring으로 그려 패딩을 토큰 값 그대로 쓴다.
    "px-4xl",
    "py-3xl md:py-4xl",
    "rounded-sm",
    "cursor-pointer",
    "transition-colors",
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
        // 기본 상태의 점선은 CSS dashed로는 대시 길이를 정할 수 없어 마스크 이미지로 그린다(시안: 4/4, 1px, 반경 6).
        default: ["bg-surface-default", "hover:bg-surface-strong"],
        dragging: ["inset-ring-1", "inset-ring-green-600", "bg-green-950"],
        uploading: ["inset-ring-1", "inset-ring-green-600", "bg-transparent", "cursor-default"],
      },
      disabled: {
        // 시안의 비활성: 배경 surface/disabled + 실선 border/disabled (점선 아님)
        true: [
          "cursor-not-allowed",
          "bg-surface-disabled",
          "inset-ring-1",
          "inset-ring-border-disabled",
          "hover:bg-surface-disabled",
        ],
        false: "",
      },
    },
    defaultVariants: {
      state: "default",
      disabled: false,
    },
  }
);

/**
 * 시안의 점선 테두리(안쪽 1px, 대시 4 / 간격 4, 반경 6)를 마스크로 그린다.
 * - CSS dashed는 대시 길이를 정할 수 없고, 일반 SVG 요소는 소수 좌표에서 두 픽셀 줄에 번진다.
 *   배경 마스크는 요소 상자와 함께 픽셀에 스냅되어 선이 또렷하다. 색은 마스크를 입힌 요소의 배경(토큰)이다.
 * - 두께 2의 선을 가장자리에 두고 바깥 절반이 이미지 밖으로 잘리게 해 안쪽 1px 선을 만든다.
 */
const DASHED_BORDER_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%'><rect width='100%' height='100%' rx='6' fill='none' stroke='black' stroke-width='2' stroke-dasharray='4 4'/></svg>"
)}")`;

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
  /** 메인 안내 텍스트 (기본값: "커버 사진을 등록해주세요") */
  mainText?: string;
  /** 힌트 텍스트 (기본값: "최대 5MB 파일만 허용 가능") */
  hintText?: string;
  /** 업로드 중 텍스트 (기본값: "업로드 중...") */
  uploadingText?: string;
  /** 컨테이너 클래스 */
  containerClassName?: string;
  /** 업로드 취소 시 콜백 */
  onCancel?: () => void;
  ref?: React.Ref<HTMLInputElement>;
}

export function ImageUploader({
  className,
  containerClassName,
  onFileSelect,
  uploadProgress,
  accept = "image/*",
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  onFileSizeError,
  disabled = false,
  mainText = "커버 사진을 등록해주세요",
  hintText = "최대 5MB 파일만 허용 가능",
  uploadingText = "업로드 중...",
  onCancel,
  id,
  ref,
  ...props
}: ImageUploaderProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const internalInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isUploading = uploadProgress !== undefined && uploadProgress >= 0 && uploadProgress < 100;

  const handleFileSelection = (file: File | null) => {
    if (!file) {
      onFileSelect?.(null);
      return;
    }

    if (file.size > maxFileSize) {
      onFileSizeError?.(file, maxFileSize);
      return;
    }

    onFileSelect?.(file);
  };

  const { isDragging, dragFileName, mousePosition, dragHandlers } = useDragAndDrop({
    disabled: disabled || isUploading,
    onFileDrop: handleFileSelection,
    containerRef,
  });

  const state: UploadState = isUploading ? "uploading" : isDragging ? "dragging" : "default";

  const handleClick = () => {
    if (disabled || isUploading) return;
    internalInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelection(file);
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

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
        {state === "default" && !disabled && (
          <span
            aria-hidden="true"
            className="bg-border-default pointer-events-none absolute inset-0"
            style={{
              maskImage: DASHED_BORDER_MASK,
              WebkitMaskImage: DASHED_BORDER_MASK,
              maskSize: "100% 100%",
              maskRepeat: "no-repeat",
            }}
          />
        )}

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
            <TimerCircular progress={uploadProgress!} />
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
            <ImageIcon size="xlarge" className="text-text-muted" />
            <div className="gap-2xs flex flex-col items-center leading-[1.4]">
              <span className="text-text-muted text-[13px] md:text-base">{mainText}</span>
              <span
                id={`${inputId}-hint`}
                className="text-text-disabled text-[11px] md:text-[13px]"
              >
                {hintText}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export { imageUploaderVariants };

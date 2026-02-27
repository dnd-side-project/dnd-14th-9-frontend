"use client";

import { forwardRef, useState } from "react";

import Image from "next/image";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/utils";

const DEFAULT_PLACEHOLDER = "/images/thumbnail-fallback.svg";

const THUMBNAIL_VARIANTS = cva(
  [
    "relative",
    "overflow-hidden",
    "bg-surface-subtle",
    "w-full",
    "aspect-[276/146]",
    "border-border-default",
  ],
  {
    variants: {
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        xs: "rounded-xs",
      },
      border: {
        none: "",
        sm: "border-sm",
      },
    },
    defaultVariants: {
      radius: "lg",
      border: "none",
    },
  }
);

export interface ThumbnailProps
  extends
    Omit<React.ComponentPropsWithoutRef<"div">, "children">,
    VariantProps<typeof THUMBNAIL_VARIANTS> {
  src: string | null | undefined;
  alt: string;
  fallbackSrc?: string;
}

interface ThumbnailImageProps {
  src: string;
  alt: string;
  fallbackSrc: string;
  onLoadingChange: (loading: boolean) => void;
}

const ThumbnailImage = ({ src, alt, fallbackSrc, onLoadingChange }: ThumbnailImageProps) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    onLoadingChange(false);
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      className="object-cover"
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

export const Thumbnail = forwardRef<HTMLDivElement, ThumbnailProps>(
  ({ className, radius, border, src, alt, fallbackSrc = DEFAULT_PLACEHOLDER, ...props }, ref) => {
    const [isLoading, setIsLoading] = useState(true);
    const imageSrc = src || fallbackSrc;

    return (
      <div
        ref={ref}
        className={cn(
          THUMBNAIL_VARIANTS({ radius, border, className }),
          isLoading && "animate-pulse"
        )}
        {...props}
      >
        <ThumbnailImage
          key={imageSrc}
          src={imageSrc}
          alt={alt}
          fallbackSrc={fallbackSrc}
          onLoadingChange={setIsLoading}
        />
      </div>
    );
  }
);

Thumbnail.displayName = "Thumbnail";

export { THUMBNAIL_VARIANTS };

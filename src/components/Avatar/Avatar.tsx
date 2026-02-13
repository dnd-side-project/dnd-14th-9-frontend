"use client";

import { forwardRef, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils/utils";

export interface AvatarProps extends ComponentPropsWithoutRef<"div"> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: number;
}

// TODO(이경환): 공통 아바타 컴포넌트가 존재하지만 아직 추가되지 않은 상태입니다. 추후 공통 컴포넌트로 교체 예정입니다.
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt = "Avatar", fallback, size = 44, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "border-alpha-white-16 relative shrink-0 overflow-hidden rounded-full border bg-gray-800",
          className
        )}
        style={{ width: size, height: size }}
        {...props}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-700 text-xs font-medium text-gray-300">
            {fallback || alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

import { ComponentPropsWithoutRef } from "react";

import Image from "next/image";

import { cva, type VariantProps } from "class-variance-authority";

import { DefaultProfileIcon } from "@/components/Icon/DefaultProfileIcon";
import { EditProfileIcon } from "@/components/Icon/EditProfileIcon";
import { HostBadgeIcon } from "@/components/Icon/HostBadgeIcon";
import { type IconProps } from "@/components/Icon/Icon";
import { cn } from "@/lib/utils/utils";

// 방장 배지 크기 (아바타 사이즈별, Figma Leader Badge 기준)
const BADGE_SIZES: Record<"xlarge" | "large" | "medium" | "small", string> = {
  xlarge: "size-5", // 20px (48px 아바타)
  large: "size-4", // 16px (40px 아바타, 보간)
  medium: "size-3", // 12px (32px 아바타)
  small: "size-2.5", // 10px (24px 아바타, 보간)
};

const AVATAR_VARIANTS = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-surface-subtle ring-1 ring-inset ring-border-strong box-border",
  {
    variants: {
      size: {
        xlarge: "size-12", // 48px
        large: "size-10", // 40px
        medium: "size-8", // 32px
        small: "size-6", // 24px
      },
      type: {
        image: "",
        empty: "",
      },
    },
    defaultVariants: {
      size: "xlarge",
      type: "empty",
    },
  }
);

export interface AvatarProps
  extends Omit<ComponentPropsWithoutRef<"div">, "children">, VariantProps<typeof AVATAR_VARIANTS> {
  src?: string;
  alt?: string;
  edit?: boolean;
  /** 방장 배지 노출 (아바타 우하단) */
  showBadge?: boolean;
}

const getIconSize = (avatarSize: AvatarProps["size"]): IconProps["size"] | undefined => {
  switch (avatarSize) {
    case "xlarge":
      return "medium"; // 24px
    case "large":
      return "small"; // 20px
    case "medium":
      return "xsmall"; // 16px
    case "small":
      return undefined; // 12px (custom class needed)
    default:
      return "medium";
  }
};

export const Avatar = ({
  className,
  size = "xlarge",
  type = "empty",
  edit = false,
  showBadge = false,
  src,
  alt = "Avatar",
  ...props
}: AvatarProps) => {
  const iconSize = getIconSize(size);
  const isSmall = size === "small";

  // Avatar 크기에 따른 sizes 값 설정
  const getSizes = () => {
    switch (size) {
      case "xlarge":
        return "48px";
      case "large":
        return "40px";
      case "medium":
        return "32px";
      case "small":
        return "24px";
      default:
        return "48px";
    }
  };

  const circle = (
    <div className={cn(AVATAR_VARIANTS({ size, type, className }))} {...props}>
      {type === "image" && src ? (
        <Image src={src} alt={alt} fill className="aspect-square object-cover" sizes={getSizes()} />
      ) : (
        <DefaultProfileIcon
          size={iconSize}
          className={cn("text-text-muted", isSmall && "size-3")}
        />
      )}
      {edit && (
        <div className="bg-overlay-subtle absolute inset-0 flex items-center justify-center opacity-0 transition-opacity hover:opacity-100">
          <EditProfileIcon
            size={iconSize}
            className={cn("text-common-white", isSmall && "size-3")}
          />
        </div>
      )}
    </div>
  );

  if (!showBadge) return circle;

  // 배지는 아바타 모서리 바깥으로 삐져나오므로, overflow-hidden인 원(circle)의
  // 형제로 두어 잘리지 않게 한다.
  return (
    <div className="relative inline-flex shrink-0">
      {circle}
      <span
        className="absolute top-[85%] left-[85%] inline-flex -translate-x-1/2 -translate-y-1/2"
        aria-label="방장"
      >
        <HostBadgeIcon
          className={cn(
            "border-border-gray-subtler rounded-full border-2",
            BADGE_SIZES[size ?? "xlarge"]
          )}
        />
      </span>
    </div>
  );
};

Avatar.displayName = "Avatar";

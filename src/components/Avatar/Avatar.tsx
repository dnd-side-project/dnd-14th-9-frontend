import { ComponentPropsWithoutRef } from "react";

import Image from "next/image";

import { cva, type VariantProps } from "class-variance-authority";

import { DefaultProfileIcon } from "@/components/Icon/DefaultProfileIcon";
import { EditProfileIcon } from "@/components/Icon/EditProfileIcon";
import { type IconProps } from "@/components/Icon/Icon";
import { cn } from "@/lib/utils/utils";

const AVATAR_VARIANTS = cva(
  "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-surface-subtle border border-border-strong box-border",
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
  src,
  alt = "Avatar",
  ...props
}: AvatarProps) => {
  const iconSize = getIconSize(size);
  const isSmall = size === "small";

  return (
    <div className={cn(AVATAR_VARIANTS({ size, type, className }))} {...props}>
      {type === "image" && src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <DefaultProfileIcon
          size={iconSize}
          className={cn("text-text-primary", isSmall && "size-3")}
        />
      )}
      {edit && (
        <div className="bg-overlay-subtle absolute inset-0 flex items-center justify-center">
          <EditProfileIcon
            size={iconSize}
            className={cn("text-common-white", isSmall && "size-3")}
          />
        </div>
      )}
    </div>
  );
};

Avatar.displayName = "Avatar";

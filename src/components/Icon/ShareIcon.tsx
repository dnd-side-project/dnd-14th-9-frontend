import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const ShareSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="18" cy="5" r="3" fill="currentColor" />
    <circle cx="6" cy="12" r="3" fill="currentColor" />
    <circle cx="18" cy="19" r="3" fill="currentColor" />
    <path
      d="M8.59 13.51L15.42 17.49M15.41 6.51L8.59 10.49"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export type ShareIconProps = Omit<IconProps, "svg">;

export const ShareIcon = forwardRef<HTMLSpanElement, ShareIconProps>(
  ({ size = "medium", className, ...props }, ref) => {
    return (
      <Icon
        ref={ref}
        size={size}
        svg={ShareSvg}
        className={className ?? "text-text-muted"}
        {...props}
      />
    );
  }
);

ShareIcon.displayName = "ShareIcon";

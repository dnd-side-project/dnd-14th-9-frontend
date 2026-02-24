import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const XSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11.5874 3.58687C11.8152 3.35907 12.1851 3.35907 12.4129 3.58687C12.6407 3.81468 12.6407 4.18458 12.4129 4.41239L8.82564 7.99963L12.4129 11.5869C12.6407 11.8147 12.6407 12.1846 12.4129 12.4124C12.1851 12.6402 11.8152 12.6402 11.5874 12.4124L8.00012 8.82515L4.41288 12.4124C4.18507 12.6402 3.81516 12.6402 3.58736 12.4124C3.35955 12.1846 3.35955 11.8147 3.58736 11.5869L7.1746 7.99963L3.58736 4.41239C3.35955 4.18458 3.35955 3.81468 3.58736 3.58687C3.81516 3.35906 4.18507 3.35906 4.41288 3.58687L8.00012 7.17411L11.5874 3.58687Z"
      fill="currentColor"
    />
  </svg>
);

export type XIconProps = Omit<IconProps, "svg">;

export const XIcon = forwardRef<HTMLSpanElement, XIconProps>(
  ({ size = "xsmall", className, ...props }, ref) => {
    return (
      <Icon
        ref={ref}
        size={size}
        svg={XSvg}
        className={className ?? "text-text-brand-default"}
        {...props}
      />
    );
  }
);

XIcon.displayName = "XIcon";

import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const CloseSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M17.3808 5.38092C17.7225 5.03921 18.2774 5.03921 18.6191 5.38092C18.9608 5.72262 18.9608 6.27749 18.6191 6.6192L13.2382 12.0001L18.6191 17.3809C18.9608 17.7226 18.9608 18.2775 18.6191 18.6192C18.2774 18.9609 17.7225 18.9609 17.3808 18.6192L11.9999 13.2383L6.61907 18.6192C6.27737 18.9609 5.7225 18.9609 5.38079 18.6192C5.03908 18.2775 5.03908 17.7226 5.38079 17.3809L10.7617 12.0001L5.38079 6.6192C5.03908 6.27749 5.03908 5.72262 5.38079 5.38092C5.7225 5.03921 6.27737 5.03921 6.61907 5.38092L11.9999 10.7618L17.3808 5.38092Z"
      fill="currentColor"
    />
  </svg>
);

export type CloseIconProps = Omit<IconProps, "svg">;

export const CloseIcon = forwardRef<HTMLSpanElement, CloseIconProps>(
  ({ size = "medium", className, ...props }, ref) => {
    return (
      <Icon
        ref={ref}
        size={size}
        svg={CloseSvg}
        className={className ?? "text-text-muted"}
        {...props}
      />
    );
  }
);

CloseIcon.displayName = "CloseIcon";

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
      d="M6.34315 6.34315C6.73368 5.95262 7.36684 5.95262 7.75737 6.34315L12.0003 10.586L16.2432 6.34315C16.6337 5.95262 17.2669 5.95262 17.6574 6.34315C18.0479 6.73367 18.0479 7.36684 17.6574 7.75737L13.4145 12.0003L17.6574 16.2432C18.0479 16.6337 18.0479 17.2669 17.6574 17.6574C17.2669 18.0479 16.6337 18.0479 16.2432 17.6574L12.0003 13.4145L7.75737 17.6574C7.36684 18.0479 6.73368 18.0479 6.34315 17.6574C5.95262 17.2669 5.95262 16.6337 6.34315 16.2432L10.586 12.0003L6.34315 7.75737C5.95262 7.36684 5.95262 6.73368 6.34315 6.34315Z"
      fill="currentColor"
    />
  </svg>
);

export type CloseIconProps = Omit<IconProps, "svg">;

export const CloseIcon = forwardRef<HTMLSpanElement, CloseIconProps>(
  ({ size = "medium", ...props }, ref) => {
    return <Icon ref={ref} size={size} svg={CloseSvg} {...props} />;
  }
);

CloseIcon.displayName = "CloseIcon";

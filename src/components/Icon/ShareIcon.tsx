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
    <path
      d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L8.08261 9.16029C7.54305 8.45284 6.6247 8 5.6 8C3.83269 8 2.4 9.43269 2.4 11.2C2.4 12.9673 3.83269 14.4 5.6 14.4C6.6247 14.4 7.54305 13.9472 8.08261 13.2397L15.0227 17.0294C15.0077 17.1508 15 17.2745 15 17.4C15 19.0569 16.3431 20.4 18 20.4C19.6569 20.4 21 19.0569 21 17.4C21 15.7431 19.6569 14.4 18 14.4C16.9753 14.4 16.057 14.8528 15.5174 15.5603L8.57739 11.7706C8.59229 11.6492 8.6 11.5255 8.6 11.4C8.6 11.2745 8.59229 11.1508 8.57739 11.0294L15.5174 7.23971C16.057 7.94716 16.9753 8.4 18 8.4V8Z"
      fill="currentColor"
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

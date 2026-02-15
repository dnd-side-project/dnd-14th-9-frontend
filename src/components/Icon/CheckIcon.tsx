import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const CheckSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.1796 7.7831C16.5204 7.44051 17.0743 7.43945 17.4169 7.78017C17.7595 8.12091 17.7615 8.67483 17.4208 9.01747L10.2607 16.2177C10.0965 16.3826 9.87328 16.4755 9.64055 16.4755C9.40781 16.4755 9.18462 16.3826 9.02043 16.2177L6.58 13.7626C6.23928 13.4199 6.24027 12.866 6.58293 12.5253C6.92557 12.1846 7.47949 12.1866 7.82024 12.5292L9.63957 14.3593L16.1796 7.7831Z"
      fill="currentColor"
    />
  </svg>
);

export type CheckIconProps = Omit<IconProps, "svg">;

export const CheckIcon = forwardRef<HTMLSpanElement, CheckIconProps>((props, ref) => {
  return <Icon ref={ref} svg={CheckSvg} {...props} />;
});

CheckIcon.displayName = "CheckIcon";

import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const CalendarSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.6667 2.66667H3.33333C2.59695 2.66667 2 3.26362 2 4V13.3333C2 14.0697 2.59695 14.6667 3.33333 14.6667H12.6667C13.403 14.6667 14 14.0697 14 13.3333V4C14 3.26362 13.403 2.66667 12.6667 2.66667Z"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.6667 1.33333V4"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.33333 1.33333V4"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M2 6.66667H14"
      stroke="currentColor"
      strokeWidth="1.33"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export type CalendarIconProps = Omit<IconProps, "svg">;

export const CalendarIcon = forwardRef<HTMLSpanElement, CalendarIconProps>((props, ref) => {
  return <Icon ref={ref} svg={CalendarSvg} {...props} />;
});

CalendarIcon.displayName = "CalendarIcon";

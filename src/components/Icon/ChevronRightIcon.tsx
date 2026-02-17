import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const ChevronRightSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10 6L8.59 7.41L13.17 12L8.59 16.59L10 18L16 12L10 6Z" fill="currentColor" />
  </svg>
);

export type ChevronRightIconProps = Omit<IconProps, "svg">;

export const ChevronRightIcon = forwardRef<HTMLSpanElement, ChevronRightIconProps>((props, ref) => {
  return <Icon ref={ref} svg={ChevronRightSvg} {...props} />;
});

ChevronRightIcon.displayName = "ChevronRightIcon";

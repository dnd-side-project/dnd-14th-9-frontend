import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const ArrowLeftSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z"
      fill="currentColor"
    />
  </svg>
);

export type ArrowLeftIconProps = Omit<IconProps, "svg">;

export const ArrowLeftIcon = forwardRef<HTMLSpanElement, ArrowLeftIconProps>((props, ref) => {
  return <Icon ref={ref} svg={ArrowLeftSvg} {...props} />;
});

ArrowLeftIcon.displayName = "ArrowLeftIcon";

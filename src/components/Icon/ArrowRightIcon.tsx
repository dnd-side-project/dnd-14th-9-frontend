import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const ARROW_RIGHT_SVG = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 4L10.59 5.41L16.17 11H4V13H16.17L10.59 18.59L12 20L20 12L12 4Z"
      fill="currentColor"
    />
  </svg>
);

export type ArrowRightIconProps = Omit<IconProps, "svg">;

export const ArrowRightIcon = forwardRef<HTMLSpanElement, ArrowRightIconProps>((props, ref) => {
  return <Icon ref={ref} svg={ARROW_RIGHT_SVG} {...props} />;
});

ArrowRightIcon.displayName = "ArrowRightIcon";

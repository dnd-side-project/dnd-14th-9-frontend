import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const MinusSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19.2002 11.125C19.6833 11.1252 20.0752 11.5169 20.0752 12C20.0752 12.4831 19.6833 12.8748 19.2002 12.875H4.7998C4.31656 12.875 3.9248 12.4832 3.9248 12C3.9248 11.5168 4.31656 11.125 4.7998 11.125H19.2002Z"
      fill="currentColor"
    />
  </svg>
);

export type MinusIconProps = Omit<IconProps, "svg">;

export const MinusIcon = forwardRef<HTMLSpanElement, MinusIconProps>((props, ref) => {
  return <Icon ref={ref} svg={MinusSvg} {...props} />;
});

MinusIcon.displayName = "MinusIcon";

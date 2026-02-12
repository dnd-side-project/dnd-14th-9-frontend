import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const UsersSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 14V12.6667C11 11.9594 10.719 11.2811 10.219 10.781C9.71886 10.281 9.04057 10 8.33333 10H3.66667C2.95942 10 2.28115 10.281 1.78105 10.781C1.28095 11.2811 1 11.9594 1 12.6667V14"
      stroke="currentColor"
      strokeWidth="0.893432"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 7.33333C7.47276 7.33333 8.66667 6.13943 8.66667 4.66667C8.66667 3.19391 7.47276 2 6 2C4.52724 2 3.33333 3.19391 3.33333 4.66667C3.33333 6.13943 4.52724 7.33333 6 7.33333Z"
      stroke="currentColor"
      strokeWidth="0.893432"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 14V12.6667C14.9995 12.0758 14.7931 11.5019 14.4142 11.0349C14.0354 10.5679 13.5062 10.2344 12.9167 10.0867"
      stroke="currentColor"
      strokeWidth="0.893432"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.9167 2.08667C11.5077 2.23354 12.0386 2.56714 12.4186 3.03488C12.7986 3.50262 13.0054 4.07789 13.0054 4.67C13.0054 5.26212 12.7986 5.83739 12.4186 6.30513C12.0386 6.77287 11.5077 7.10647 10.9167 7.25334"
      stroke="currentColor"
      strokeWidth="0.893432"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export type UsersIconProps = Omit<IconProps, "svg">;

export const UsersIcon = forwardRef<HTMLSpanElement, UsersIconProps>((props, ref) => {
  return <Icon ref={ref} svg={UsersSvg} {...props} />;
});

UsersIcon.displayName = "UsersIcon";

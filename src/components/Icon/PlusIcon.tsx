import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const PlusSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.875 0C8.35825 0 8.75 0.391751 8.75 0.875V7H14.875C15.3582 7 15.75 7.39175 15.75 7.875C15.75 8.3279 15.4059 8.70012 14.9648 8.74512L14.875 8.75H8.75V14.875C8.75 15.3582 8.35825 15.75 7.875 15.75C7.39175 15.75 7 15.3582 7 14.875V8.75H0.875C0.391751 8.75 2.57349e-07 8.35825 0 7.875C1.64594e-08 7.39175 0.391751 7 0.875 7H7V0.875C7 0.391751 7.39175 0 7.875 0Z"
      fill="currentColor"
    />
  </svg>
);

export type PlusIconProps = Omit<IconProps, "svg">;

export const PlusIcon = forwardRef<SVGSVGElement, PlusIconProps>((props, ref) => {
  return <Icon ref={ref} svg={PlusSvg} {...props} />;
});

PlusIcon.displayName = "PlusIcon";

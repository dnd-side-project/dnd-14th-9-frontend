import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const InfoSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 9V5.625M9 11.5016V11.5312M15.75 9C15.75 12.7279 12.7279 15.75 9 15.75C5.27208 15.75 2.25 12.7279 2.25 9C2.25 5.27208 5.27208 2.25 9 2.25C12.7279 2.25 15.75 5.27208 15.75 9Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export type InfoIconProps = Omit<IconProps, "svg">;

export const InfoIcon = forwardRef<HTMLSpanElement, InfoIconProps>((props, ref) => {
  return <Icon ref={ref} svg={InfoSvg} {...props} />;
});

InfoIcon.displayName = "InfoIcon";

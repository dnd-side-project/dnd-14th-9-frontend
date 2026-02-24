import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const BarGraphSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.6757 16.7705H3.22925V3.22884H6.6757V16.7705ZM11.7237 13.5487C11.7236 13.5546 11.7229 13.5606 11.7229 13.5666L11.7237 16.7705H8.13403V9.08252H11.7237V13.5487ZM16.7709 16.7705H13.182V13.7952H16.7709V16.7705ZM1.77091 17C1.77109 17.6786 2.32116 18.2287 2.99975 18.2288H17.0004C17.679 18.2287 18.2291 17.6786 18.2292 17V13.5666C18.2292 12.8878 17.6791 12.3371 17.0004 12.3369H13.182V8.85303C13.182 8.17424 12.632 7.62429 11.9532 7.62419H8.13403V2.99935C8.13386 2.32065 7.58312 1.77051 6.90438 1.77051H2.99975C2.32116 1.77068 1.77109 2.32076 1.77091 2.99935V17Z"
      fill="currentColor"
    />
  </svg>
);

export type BarGraphIconProps = Omit<IconProps, "svg">;

export const BarGraphIcon = forwardRef<HTMLSpanElement, BarGraphIconProps>((props, ref) => {
  return <Icon ref={ref} svg={BarGraphSvg} {...props} />;
});

BarGraphIcon.displayName = "BarGraphIcon";

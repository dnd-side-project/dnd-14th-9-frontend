import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

export type FrameIconProps = Omit<IconProps, "svg">;

const FrameSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M12.8395 12.6002V4.7335C12.8395 3.7335 12.4129 3.3335 11.3529 3.3335H10.6595C9.59952 3.3335 9.17285 3.7335 9.17285 4.7335V12.6002"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.50684 12.5998V8.0665C3.50684 7.0665 3.9335 6.6665 4.9935 6.6665H5.68684C6.74684 6.6665 7.1735 7.0665 7.1735 8.0665V12.5998"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.33301 12.6665H14.6663"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FrameIcon = forwardRef<HTMLSpanElement, FrameIconProps>((props, ref) => {
  return <Icon ref={ref} svg={FrameSvg} {...props} />;
});

FrameIcon.displayName = "FrameIcon";

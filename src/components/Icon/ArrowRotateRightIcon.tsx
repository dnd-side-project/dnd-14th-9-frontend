import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const ArrowRotateRightSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.06266 10.0003C4.06266 6.69982 6.65171 4.06283 9.79834 4.06283C11.8071 4.0629 13.5824 5.13444 14.6095 6.77116H13.4344C13.0317 6.77121 12.7052 7.09765 12.7052 7.50033C12.7052 7.903 13.0317 8.22944 13.4344 8.22949H16.6668C17.0695 8.22949 17.396 7.90303 17.396 7.50033V4.16699C17.396 3.76428 17.0695 3.43783 16.6668 3.43783C16.2641 3.43783 15.9377 3.76428 15.9377 4.16699V6.14453C14.6783 4.02932 12.4054 2.60456 9.79834 2.60449C5.80432 2.60449 2.60433 5.93703 2.60433 10.0003C2.60433 14.0636 5.80432 17.3962 9.79834 17.3962C13.0019 17.3961 15.6979 15.2481 16.6359 12.305C16.7581 11.9214 16.5459 11.5109 16.1623 11.3887C15.7786 11.2664 15.3682 11.4786 15.2459 11.8623C14.4873 14.2423 12.3242 15.9377 9.79834 15.9378C6.65171 15.9378 4.06266 13.3008 4.06266 10.0003Z"
      fill="currentColor"
    />
  </svg>
);

export type ArrowRotateRightIconProps = Omit<IconProps, "svg">;

export const ArrowRotateRightIcon = forwardRef<HTMLSpanElement, ArrowRotateRightIconProps>(
  (props, ref) => {
    return <Icon ref={ref} svg={ArrowRotateRightSvg} {...props} />;
  }
);

ArrowRotateRightIcon.displayName = "ArrowRotateRightIcon";

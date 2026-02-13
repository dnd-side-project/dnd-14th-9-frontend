import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const ClearSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10Z"
      fill="#33363D"
    />
    <path
      d="M12.3804 6.38037C12.7219 6.0388 13.2769 6.03908 13.6187 6.38037C13.9604 6.72208 13.9604 7.27694 13.6187 7.61865L11.2378 9.99951L13.6187 12.3804C13.9604 12.7221 13.9604 13.2769 13.6187 13.6187C13.2769 13.9604 12.7221 13.9604 12.3804 13.6187L9.99951 11.2378L7.61865 13.6187C7.27694 13.9604 6.72208 13.9604 6.38037 13.6187C6.03908 13.2769 6.0388 12.7219 6.38037 12.3804L8.76123 9.99951L6.38037 7.61865C6.03908 7.27691 6.0388 6.72194 6.38037 6.38037C6.72194 6.0388 7.27691 6.03908 7.61865 6.38037L9.99951 8.76123L12.3804 6.38037Z"
      fill="#B1B8BE"
    />
  </svg>
);

export type ClearIconProps = Omit<IconProps, "svg">;

export const ClearIcon = forwardRef<HTMLSpanElement, ClearIconProps>((props, ref) => {
  return <Icon ref={ref} svg={ClearSvg} {...props} />;
});

ClearIcon.displayName = "ClearIcon";

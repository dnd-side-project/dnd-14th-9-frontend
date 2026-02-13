import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const SearchSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_search)">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.62793 1.64893C12.2523 1.64893 15.1904 4.58706 15.1904 8.21143C15.1904 9.76064 14.6518 11.1831 13.7541 12.3057L17.7205 16.2729C18.0053 16.5577 18.0053 17.0193 17.7205 17.304C17.4358 17.5888 16.9742 17.5888 16.6895 17.304L12.7222 13.3376C11.5996 14.2353 10.1771 14.7739 8.62793 14.7739C5.00356 14.7739 2.06543 11.8358 2.06543 8.21143C2.06543 4.58706 5.00356 1.64893 8.62793 1.64893ZM8.62793 3.10726C5.80898 3.10726 3.52376 5.39247 3.52376 8.21143C3.52376 11.0304 5.80898 13.3156 8.62793 13.3156C11.4469 13.3156 13.7321 11.0304 13.7321 8.21143C13.7321 5.39247 11.4469 3.10726 8.62793 3.10726Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_search">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export type SearchIconProps = Omit<IconProps, "svg">;

export const SearchIcon = forwardRef<HTMLSpanElement, SearchIconProps>((props, ref) => {
  return <Icon ref={ref} svg={SearchSvg} {...props} />;
});

SearchIcon.displayName = "SearchIcon";

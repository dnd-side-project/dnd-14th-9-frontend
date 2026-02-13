import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

export type EditProfileIconProps = Omit<IconProps, "svg">;

const EditProfileSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_1765_2852)">
      <path
        d="M18.0011 17.7112C18.4839 17.7116 18.876 18.1033 18.8761 18.5862C18.876 19.0691 18.484 19.4608 18.0011 19.4612H12.0011C11.5179 19.4612 11.1262 19.0693 11.1261 18.5862C11.1263 18.103 11.518 17.7112 12.0011 17.7112H18.0011ZM15.4025 4.67405C16.1347 3.94206 17.3227 3.94191 18.0548 4.67405L19.1232 5.74241C19.855 6.47441 19.8546 7.66154 19.1232 8.39377L9.60663 17.9104C9.24594 18.2711 8.79538 18.5291 8.30195 18.6584L6.29025 19.1848C5.2732 19.451 4.34554 18.5241 4.61155 17.5071L5.13791 15.4953C5.26716 15.0018 5.52615 14.5514 5.88693 14.1906L15.4025 4.67405Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_1765_2852">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const EditProfileIcon = forwardRef<HTMLSpanElement, EditProfileIconProps>((props, ref) => {
  return <Icon ref={ref} svg={EditProfileSvg} {...props} />;
});

EditProfileIcon.displayName = "EditProfileIcon";

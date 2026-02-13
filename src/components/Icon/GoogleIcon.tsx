import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const GoogleSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="24" height="24" fill="white" />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M22.56 11.75C22.56 10.97 22.49 10.22 22.36 9.5H12V13.755H17.92C17.665 15.13 16.89 16.295 15.725 17.075V19.835H19.28C21.36 17.92 22.56 15.1 22.56 11.75Z"
      fill="#4285F4"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.9999 22.4998C14.9699 22.4998 17.4599 21.5148 19.2799 19.8348L15.7249 17.0748C14.7399 17.7348 13.4799 18.1248 11.9999 18.1248C9.13492 18.1248 6.70992 16.1898 5.84492 13.5898H2.16992V16.4398C3.97992 20.0348 7.69992 22.4998 11.9999 22.4998Z"
      fill="#34A853"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.845 13.5886C5.625 12.9286 5.5 12.2236 5.5 11.4986C5.5 10.7736 5.625 10.0686 5.845 9.40859V6.55859H2.17C1.425 8.04359 1 9.72359 1 11.4986C1 13.2736 1.425 14.9536 2.17 16.4386L5.845 13.5886Z"
      fill="#FBBC05"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.9999 4.875C13.6149 4.875 15.0649 5.43 16.2049 6.52L19.3599 3.365C17.4549 1.59 14.9649 0.5 11.9999 0.5C7.69992 0.5 3.97992 2.965 2.16992 6.56L5.84492 9.41C6.70992 6.81 9.13492 4.875 11.9999 4.875Z"
      fill="#EA4335"
    />
  </svg>
);

export type GoogleIconProps = Omit<IconProps, "svg">;

export const GoogleIcon = forwardRef<HTMLSpanElement, GoogleIconProps>((props, ref) => {
  return <Icon ref={ref} svg={GoogleSvg} {...props} />;
});

GoogleIcon.displayName = "GoogleIcon";

import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

export type ProfileIconProps = Omit<IconProps, "svg">;

const ProfileSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
  >
    <g clipPath="url(#clip0_1620_220)">
      <path
        d="M8.00018 9.08268C9.53947 9.08268 10.9746 9.38427 12.0477 9.96224C13.12 10.5399 13.9168 11.4519 13.9168 12.666V12.8659C13.9168 12.9962 13.9176 13.1296 13.9084 13.2422C13.8986 13.3614 13.8749 13.5085 13.799 13.6576C13.6951 13.8613 13.5288 14.0277 13.325 14.1315C13.1759 14.2074 13.029 14.2311 12.9097 14.2409C12.7971 14.2501 12.6637 14.2493 12.5334 14.2493L3.46697 14.25C3.33672 14.25 3.20389 14.2507 3.09132 14.2415C2.97198 14.2318 2.82459 14.2081 2.67531 14.1322C2.47154 14.0283 2.30523 13.8619 2.20135 13.6582C2.12547 13.5091 2.10176 13.3621 2.09197 13.2428C2.08278 13.1303 2.08351 12.9968 2.08351 12.8665V12.666C2.08351 11.452 2.87987 10.5399 3.952 9.96224C5.0251 9.38421 6.4608 9.08268 8.00018 9.08268ZM8.00018 1.75C9.7951 1.75 11.2502 3.20508 11.2502 5C11.2502 6.79492 9.7951 8.25 8.00018 8.25C6.20526 8.24999 4.75018 6.79492 4.75018 5C4.75018 3.20508 6.20526 1.75001 8.00018 1.75Z"
        fill="#8A949E"
      />
    </g>
    <defs>
      <clipPath id="clip0_1620_220">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const ProfileIcon = forwardRef<HTMLSpanElement, ProfileIconProps>((props, ref) => {
  return <Icon ref={ref} svg={ProfileSvg} {...props} />;
});

ProfileIcon.displayName = "ProfileIcon";

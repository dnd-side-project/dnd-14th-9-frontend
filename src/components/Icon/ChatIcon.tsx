import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const ChatSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 3C6.477 3 2 6.582 2 11C2 13.136 3.037 15.07 4.686 16.438C4.53 17.753 4.073 19.128 3.293 20.293C3.146 20.478 3.096 20.725 3.16 20.954C3.224 21.183 3.395 21.369 3.62 21.449C3.683 21.472 3.75 21.484 3.817 21.484C4.238 21.484 4.85 21.286 5.638 20.974C6.699 20.561 8.026 19.897 9.342 18.939C10.207 18.976 11.097 19 12 19C17.523 19 22 15.418 22 11C22 6.582 17.523 3 12 3Z"
      fill="currentColor"
    />
  </svg>
);

export type ChatIconProps = Omit<IconProps, "svg">;

export const ChatIcon = forwardRef<HTMLSpanElement, ChatIconProps>((props, ref) => {
  return <Icon ref={ref} svg={ChatSvg} {...props} />;
});

ChatIcon.displayName = "ChatIcon";

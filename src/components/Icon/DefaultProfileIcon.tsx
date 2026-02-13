import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

export type DefaultProfileIconProps = Omit<IconProps, "svg">;

const DefaultProfileSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_1765_2822)">
      <path
        d="M12 13.624C14.309 13.624 16.4617 14.0764 18.0713 14.9434C19.6797 15.8098 20.875 17.1779 20.875 18.999V19.2988C20.875 19.4942 20.8761 19.6945 20.8623 19.8633C20.8477 20.0422 20.8121 20.2627 20.6983 20.4863C20.5425 20.7919 20.2929 21.0415 19.9873 21.1973C19.7636 21.3111 19.5432 21.3467 19.3643 21.3613C19.1953 21.3751 18.9954 21.374 18.7998 21.374L5.20022 21.375C5.00483 21.375 4.80559 21.3761 4.63674 21.3623C4.45772 21.3477 4.23664 21.3122 4.01272 21.1982C3.70706 21.0425 3.4576 20.7929 3.30178 20.4873C3.18795 20.2637 3.15239 20.0432 3.13772 19.8643C3.12392 19.6954 3.12502 19.4952 3.12502 19.2998V18.999C3.12502 17.1781 4.31956 15.8098 5.92776 14.9434C7.5374 14.0763 9.69095 13.624 12 13.624ZM12 2.625C14.6924 2.62501 16.875 4.80762 16.875 7.5C16.875 10.1924 14.6924 12.375 12 12.375C9.30765 12.375 7.12502 10.1924 7.12502 7.5C7.12502 4.80762 9.30765 2.62501 12 2.625Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_1765_2822">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export const DefaultProfileIcon = forwardRef<HTMLSpanElement, DefaultProfileIconProps>(
  (props, ref) => {
    return <Icon ref={ref} svg={DefaultProfileSvg} {...props} />;
  }
);

DefaultProfileIcon.displayName = "DefaultProfileIcon";

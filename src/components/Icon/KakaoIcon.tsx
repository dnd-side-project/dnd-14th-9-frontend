import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const KakaoSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.0001 2.16797C6.47688 2.16797 2 5.62681 2 9.89273C2 12.5458 3.73157 14.8846 6.36838 16.2757L5.25893 20.3285C5.16091 20.6866 5.57047 20.9721 5.88498 20.7646L10.7482 17.5549C11.1586 17.5945 11.5757 17.6176 12.0001 17.6176C17.5228 17.6176 22 14.1589 22 9.89273C22 5.62681 17.5228 2.16797 12.0001 2.16797Z"
      fill="black"
    />
  </svg>
);

export type KakaoIconProps = Omit<IconProps, "svg">;

export const KakaoIcon = forwardRef<HTMLSpanElement, KakaoIconProps>((props, ref) => {
  return <Icon ref={ref} svg={KakaoSvg} {...props} />;
});

KakaoIcon.displayName = "KakaoIcon";

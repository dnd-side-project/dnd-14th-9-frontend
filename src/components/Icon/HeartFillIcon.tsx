import { forwardRef } from "react";

import { Icon, type IconProps } from "./Icon";

const HeartFillSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M28.016 6.44567C29.2717 6.43476 30.5174 6.67498 31.6797 7.15042C32.842 7.62597 33.8987 8.32784 34.7868 9.21585C35.6748 10.1039 36.3766 11.1606 36.8522 12.3229C37.3277 13.4853 37.5679 14.7309 37.557 15.9867C37.546 17.2424 37.2844 18.4836 36.7887 19.6374C36.2964 20.7834 35.5806 21.8187 34.6859 22.6875L34.6875 22.6892L21.0319 36.348C20.7584 36.6214 20.3867 36.7744 20 36.7744C19.6136 36.7743 19.243 36.6211 18.9697 36.348L5.3125 22.6892C3.53979 20.9157 2.54413 18.5105 2.54395 16.003C2.54395 13.4951 3.53954 11.0888 5.3125 9.31513L6.3444 10.347L5.31413 9.31513C7.08775 7.54216 9.4925 6.54502 12.0003 6.54495C14.5083 6.54495 16.9145 7.54197 18.6882 9.31513H18.6865L20 10.627L21.3135 9.31513C22.1822 8.42046 23.2193 7.70625 24.3652 7.2139C25.519 6.71829 26.7603 6.45668 28.016 6.44567Z"
      fill="currentColor"
    />
  </svg>
);

export type HeartFillIconProps = Omit<IconProps, "svg">;

export const HeartFillIcon = forwardRef<HTMLSpanElement, HeartFillIconProps>((props, ref) => {
  return <Icon ref={ref} svg={HeartFillSvg} {...props} />;
});

HeartFillIcon.displayName = "HeartFillIcon";

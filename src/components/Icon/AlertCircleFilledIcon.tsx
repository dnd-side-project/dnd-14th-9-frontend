import { Icon, type IconProps } from "./Icon";

// 채워진 원 + 느낌표(구멍). 시안 도움말 텍스트의 오류 · 경고 아이콘 (16x16 안에 13.33px 원이 1.33px 안쪽)
const AlertCircleFilledSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      transform="translate(1.333 1.333)"
      fillRule="evenodd"
      clipRule="evenodd"
      d="M 6.667 0 C 10.349 0 13.333 2.985 13.333 6.667 C 13.333 10.349 10.349 13.333 6.667 13.333 C 2.985 13.333 0 10.349 0 6.667 C 0 2.985 2.985 0 6.667 0 Z M 6.667 8.684 C 6.345 8.684 6.083 8.945 6.083 9.267 L 6.083 9.273 C 6.083 9.596 6.345 9.857 6.667 9.857 C 6.989 9.857 7.25 9.596 7.25 9.273 L 7.25 9.267 C 7.25 8.945 6.989 8.684 6.667 8.684 Z M 6.667 3.354 C 6.345 3.354 6.083 3.615 6.083 3.937 L 6.083 7 C 6.083 7.322 6.345 7.583 6.667 7.583 C 6.989 7.583 7.25 7.322 7.25 7 L 7.25 3.937 C 7.25 3.615 6.989 3.354 6.667 3.354 Z"
      fill="currentColor"
    />
  </svg>
);

export type AlertCircleFilledIconProps = Omit<IconProps, "svg">;

export function AlertCircleFilledIcon({
  ref,
  ...props
}: AlertCircleFilledIconProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return <Icon ref={ref} svg={AlertCircleFilledSvg} {...props} />;
}

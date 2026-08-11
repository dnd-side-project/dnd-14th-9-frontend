import { Icon, type IconProps } from "./Icon";

const CheckContainedSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(2 2)">
      <path
        d="M13.142 7.98299L8.875 12.25L7.42049 10.7955M10 1C5.02944 1 1 5.02944 1 10C1 14.9706 5.02944 19 10 19C14.9706 19 19 14.9706 19 10C19 5.02944 14.9706 1 10 1Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export type CheckContainedIconProps = Omit<IconProps, "svg">;

export function CheckContainedIcon({
  ref,
  ...props
}: CheckContainedIconProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return <Icon ref={ref} svg={CheckContainedSvg} {...props} />;
}

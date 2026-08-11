import { Icon, type IconProps } from "./Icon";

const InformationCircleContainedSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(2 2)">
      <path
        d="M10 10L10 14.5M10 6.66455V6.625M1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export type InformationCircleContainedIconProps = Omit<IconProps, "svg">;

export function InformationCircleContainedIcon({
  ref,
  ...props
}: InformationCircleContainedIconProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return <Icon ref={ref} svg={InformationCircleContainedSvg} {...props} />;
}

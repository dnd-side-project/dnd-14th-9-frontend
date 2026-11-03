import { Icon, type IconProps } from "./Icon";

const DurationSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13.4167 8C13.4167 5.00846 10.9915 2.58333 8 2.58333C5.00846 2.58333 2.58333 5.00846 2.58333 8C2.58333 10.9915 5.00846 13.4167 8 13.4167C10.9915 13.4167 13.4167 10.9915 13.4167 8ZM7.41667 5.61393C7.41667 5.29177 7.67783 5.0306 8 5.0306C8.32217 5.0306 8.58333 5.29177 8.58333 5.61393V8.32943L10.4342 8.94661C10.7398 9.04847 10.9051 9.37867 10.8034 9.68424C10.7015 9.98981 10.3713 10.1551 10.0658 10.0534L7.81576 9.30339C7.57756 9.22399 7.41667 9.00108 7.41667 8.75V5.61393ZM14.5833 8C14.5833 11.6359 11.6359 14.5833 8 14.5833C4.36413 14.5833 1.41667 11.6359 1.41667 8C1.41667 4.36413 4.36413 1.41667 8 1.41667C11.6359 1.41667 14.5833 4.36413 14.5833 8Z"
      fill="currentColor"
    />
  </svg>
);

export type DurationIconProps = Omit<IconProps, "svg">;

export function DurationIcon({
  ref,
  ...props
}: DurationIconProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return <Icon ref={ref} svg={DurationSvg} {...props} />;
}

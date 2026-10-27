import { Icon, type IconProps } from "./Icon";

const PauseSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.75 13.3333V2.66667C4.75 2.3445 5.01117 2.08333 5.33333 2.08333C5.6555 2.08333 5.91667 2.3445 5.91667 2.66667V13.3333C5.91667 13.6555 5.6555 13.9167 5.33333 13.9167C5.01117 13.9167 4.75 13.6555 4.75 13.3333ZM10.0833 13.3333V2.66667C10.0833 2.3445 10.3445 2.08333 10.6667 2.08333C10.9888 2.08333 11.25 2.3445 11.25 2.66667V13.3333C11.25 13.6555 10.9888 13.9167 10.6667 13.9167C10.3445 13.9167 10.0833 13.6555 10.0833 13.3333Z"
      fill="currentColor"
    />
  </svg>
);

export type PauseIconProps = Omit<IconProps, "svg">;

export function PauseIcon({
  ref,
  ...props
}: PauseIconProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return <Icon ref={ref} svg={PauseSvg} {...props} />;
}

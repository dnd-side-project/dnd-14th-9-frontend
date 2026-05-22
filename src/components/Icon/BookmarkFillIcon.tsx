import { Icon, type IconProps } from "./Icon";

export type BookmarkFillIconProps = Omit<IconProps, "svg">;

const BookmarkFillSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M16.1452 17.1279C16.1452 17.9019 15.2299 18.3117 14.6527 17.7961L9.99935 13.6392L5.34603 17.7961C4.76879 18.3117 3.85352 17.9019 3.85352 17.1279V4.16732C3.85352 2.84414 4.92617 1.77148 6.24935 1.77148H13.7493C15.0725 1.77148 16.1452 2.84414 16.1452 4.16732V17.1279Z"
      fill="currentColor"
    />
  </svg>
);

export function BookmarkFillIcon({
  ref,
  ...props
}: BookmarkFillIconProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return <Icon ref={ref} svg={BookmarkFillSvg} {...props} />;
}

import { Icon, type IconProps } from "./Icon";

export type BookmarkIconProps = Omit<IconProps, "svg">;

const BookmarkSvg = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="100%"
    height="100%"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="M14.6868 4.16732C14.6868 3.64955 14.2671 3.22982 13.7493 3.22982H6.24935C5.73158 3.22982 5.31185 3.64955 5.31185 4.16732V15.8706L9.51351 12.1182C9.7902 11.871 10.2085 11.871 10.4852 12.1182L14.6868 15.8706V4.16732ZM16.1452 17.1279C16.1452 17.9019 15.2299 18.3117 14.6527 17.7961L9.99935 13.6392L5.34603 17.7961C4.76879 18.3117 3.85352 17.9019 3.85352 17.1279V4.16732C3.85352 2.84414 4.92617 1.77148 6.24935 1.77148H13.7493C15.0725 1.77148 16.1452 2.84414 16.1452 4.16732V17.1279Z"
      fill="currentColor"
    />
  </svg>
);

export function BookmarkIcon({
  ref,
  ...props
}: BookmarkIconProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return <Icon ref={ref} svg={BookmarkSvg} {...props} />;
}

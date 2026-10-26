import { Icon, type IconProps } from "./Icon";

const ChatBubbleSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.66667 18.3333V3.33333C1.66667 2.875 1.82986 2.48264 2.15625 2.15625C2.48264 1.82986 2.875 1.66667 3.33333 1.66667H16.6667C17.125 1.66667 17.5174 1.82986 17.8438 2.15625C18.1701 2.48264 18.3333 2.875 18.3333 3.33333V13.3333C18.3333 13.7917 18.1701 14.184 17.8438 14.5104C17.5174 14.8368 17.125 15 16.6667 15H5L1.66667 18.3333ZM4.29167 13.3333H16.6667V3.33333H3.33333V14.2708L4.29167 13.3333Z"
      fill="currentColor"
    />
  </svg>
);

export type ChatBubbleIconProps = Omit<IconProps, "svg">;

export function ChatBubbleIcon({
  ref,
  ...props
}: ChatBubbleIconProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return <Icon ref={ref} svg={ChatBubbleSvg} {...props} />;
}

import { Icon, type IconProps } from "./Icon";

const AlertTriangleSvg = (
  <svg
    width="100%"
    height="100%"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g transform="translate(2 3)">
      <path
        d="M10.0006 9.90003V5.41447M10.0006 13.2248V13.2642M15.6706 17H4.3307C2.78173 17 1.47455 15.9763 1.06328 14.5757C0.88772 13.9778 1.10344 13.3551 1.43339 12.8249L7.10332 2.60102C8.43173 0.466323 11.5695 0.466326 12.8979 2.60103L18.5679 12.8249C18.8978 13.3551 19.1135 13.9778 18.938 14.5757C18.5267 15.9763 17.2195 17 15.6706 17Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

export type AlertTriangleIconProps = Omit<IconProps, "svg">;

export function AlertTriangleIcon({
  ref,
  ...props
}: AlertTriangleIconProps & { ref?: React.Ref<HTMLSpanElement> }) {
  return <Icon ref={ref} svg={AlertTriangleSvg} {...props} />;
}

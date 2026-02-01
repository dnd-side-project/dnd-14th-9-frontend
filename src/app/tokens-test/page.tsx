// ============================================================
// Semantic Background Colors
// ============================================================
const semanticBackgrounds = [
  { label: "background.white", className: "bg-background-white text-light-gray-90" },
  { label: "background.gray-subtier", className: "bg-background-gray-subtier text-light-gray-90" },
  { label: "background.gray-subtle", className: "bg-background-gray-subtle text-light-gray-90" },
  { label: "background.inverse", className: "bg-background-inverse text-light-gray-0" },
  { label: "background.dim", className: "bg-background-dim text-light-gray-0" },
];

// ============================================================
// Semantic Surface Colors
// ============================================================
const semanticSurfaces = [
  { label: "surface.white", className: "bg-surface-white text-light-gray-90" },
  { label: "surface.inverse", className: "bg-surface-inverse text-light-gray-0" },
  { label: "surface.gray-subtler", className: "bg-surface-gray-subtler text-light-gray-90" },
  { label: "surface.gray-subtle", className: "bg-surface-gray-subtle text-light-gray-90" },
  { label: "surface.disabled", className: "bg-surface-disabled text-light-gray-90" },
  { label: "surface.primary-subtler", className: "bg-surface-primary-subtler text-light-gray-90" },
  {
    label: "surface.secondary-subtler",
    className: "bg-surface-secondary-subtler text-light-gray-90",
  },
  { label: "surface.point-subtler", className: "bg-surface-point-subtler text-light-gray-90" },
  { label: "surface.danger-subtler", className: "bg-surface-danger-subtler text-light-gray-90" },
  { label: "surface.warning-subtler", className: "bg-surface-warning-subtler text-light-gray-90" },
  { label: "surface.success-subtler", className: "bg-surface-success-subtler text-light-gray-90" },
];

// ============================================================
// Border Colors
// ============================================================
const borderSamples = [
  { label: "border-inverse", className: "border-border-inverse bg-gray-90" },
  { label: "border-disabled", className: "border-border-disabled" },
  { label: "border-gray-light", className: "border-border-gray-light" },
  { label: "border-gray", className: "border-border-gray" },
  { label: "border-gray-dark", className: "border-border-gray-dark" },
  { label: "border-gray-darker", className: "border-border-gray-darker" },
  { label: "border-primary-light", className: "border-border-primary-light" },
  { label: "border-primary", className: "border-border-primary" },
  { label: "border-secondary-light", className: "border-border-secondary-light" },
  { label: "border-secondary", className: "border-border-secondary" },
  { label: "border-point-light", className: "border-border-point-light" },
  { label: "border-point", className: "border-border-point" },
  { label: "border-danger-light", className: "border-border-danger-light" },
  { label: "border-warning-light", className: "border-border-warning-light" },
  { label: "border-warning", className: "border-border-warning" },
  { label: "border-success-light", className: "border-border-success-light" },
  { label: "border-success", className: "border-border-success" },
];

// ============================================================
// Divider Colors
// ============================================================
const dividerSamples = [
  { label: "divider-gray-light", className: "border-divider-gray-light" },
  { label: "divider-gray", className: "border-divider-gray" },
  { label: "divider-gray-dark", className: "border-divider-gray-dark" },
  { label: "divider-gray-darker", className: "border-divider-gray-darker" },
  { label: "divider-inverse", className: "border-divider-inverse", bgClassName: "bg-gray-90" },
  { label: "divider-primary-light", className: "border-divider-primary-light" },
  { label: "divider-primary", className: "border-divider-primary" },
  { label: "divider-secondary-light", className: "border-divider-secondary-light" },
  { label: "divider-secondary", className: "border-divider-secondary" },
  { label: "divider-error", className: "border-divider-error" },
  { label: "divider-point", className: "border-divider-point" },
];

// ============================================================
// Primitive Gray Scale (light.gray.*)
// ============================================================
const lightGrayScale = [
  { label: "light.gray.0", className: "bg-light-gray-0 text-light-gray-90" },
  { label: "light.gray.5", className: "bg-light-gray-5 text-light-gray-90" },
  { label: "light.gray.10", className: "bg-light-gray-10 text-light-gray-90" },
  { label: "light.gray.20", className: "bg-light-gray-20 text-light-gray-90" },
  { label: "light.gray.30", className: "bg-light-gray-30 text-light-gray-90" },
  { label: "light.gray.40", className: "bg-light-gray-40 text-light-gray-90" },
  { label: "light.gray.50", className: "bg-light-gray-50 text-light-gray-0" },
  { label: "light.gray.60", className: "bg-light-gray-60 text-light-gray-0" },
  { label: "light.gray.70", className: "bg-light-gray-70 text-light-gray-0" },
  { label: "light.gray.80", className: "bg-light-gray-80 text-light-gray-0" },
  { label: "light.gray.90", className: "bg-light-gray-90 text-light-gray-0" },
  { label: "light.gray.95", className: "bg-light-gray-95 text-light-gray-0" },
  { label: "light.gray.100", className: "bg-light-gray-100 text-light-gray-0" },
];

// ============================================================
// Primitive Primary Scale (light.primary.*)
// ============================================================
const lightPrimaryScale = [
  { label: "light.primary.5", className: "bg-light-primary-5 text-light-gray-90" },
  { label: "light.primary.10", className: "bg-light-primary-10 text-light-gray-90" },
  { label: "light.primary.20", className: "bg-light-primary-20 text-light-gray-90" },
  { label: "light.primary.30", className: "bg-light-primary-30 text-light-gray-90" },
  { label: "light.primary.40", className: "bg-light-primary-40 text-light-gray-90" },
  { label: "light.primary.50", className: "bg-light-primary-50 text-light-gray-90" },
  { label: "light.primary.60", className: "bg-light-primary-60 text-light-gray-90" },
  { label: "light.primary.70", className: "bg-light-primary-70 text-light-gray-0" },
  { label: "light.primary.80", className: "bg-light-primary-80 text-light-gray-0" },
  { label: "light.primary.90", className: "bg-light-primary-90 text-light-gray-0" },
  { label: "light.primary.95", className: "bg-light-primary-95 text-light-gray-0" },
];

// ============================================================
// Primitive Secondary Scale (light.secondary.*)
// ============================================================
const lightSecondaryScale = [
  { label: "light.secondary.5", className: "bg-light-secondary-5 text-light-gray-90" },
  { label: "light.secondary.10", className: "bg-light-secondary-10 text-light-gray-90" },
  { label: "light.secondary.20", className: "bg-light-secondary-20 text-light-gray-90" },
  { label: "light.secondary.30", className: "bg-light-secondary-30 text-light-gray-90" },
  { label: "light.secondary.40", className: "bg-light-secondary-40 text-light-gray-90" },
  { label: "light.secondary.50", className: "bg-light-secondary-50 text-light-gray-90" },
  { label: "light.secondary.60", className: "bg-light-secondary-60 text-light-gray-0" },
  { label: "light.secondary.70", className: "bg-light-secondary-70 text-light-gray-0" },
  { label: "light.secondary.80", className: "bg-light-secondary-80 text-light-gray-0" },
  { label: "light.secondary.90", className: "bg-light-secondary-90 text-light-gray-0" },
  { label: "light.secondary.95", className: "bg-light-secondary-95 text-light-gray-0" },
];

// ============================================================
// Primitive Point Scale (light.point.*)
// ============================================================
const lightPointScale = [
  { label: "light.point.10", className: "bg-light-point-10 text-light-gray-90" },
  { label: "light.point.30", className: "bg-light-point-30 text-light-gray-90" },
  { label: "light.point.40", className: "bg-light-point-40 text-light-gray-90" },
  { label: "light.point.50", className: "bg-light-point-50 text-light-gray-0" },
];

// ============================================================
// Primitive Error Scale (light.error.*)
// ============================================================
const lightErrorScale = [
  { label: "light.error.5", className: "bg-light-error-5 text-light-gray-90" },
  { label: "light.error.10", className: "bg-light-error-10 text-light-gray-90" },
  { label: "light.error.20", className: "bg-light-error-20 text-light-gray-90" },
  { label: "light.error.30", className: "bg-light-error-30 text-light-gray-90" },
  { label: "light.error.40", className: "bg-light-error-40 text-light-gray-90" },
  { label: "light.error.50", className: "bg-light-error-50 text-light-gray-0" },
  { label: "light.error.60", className: "bg-light-error-60 text-light-gray-0" },
  { label: "light.error.70", className: "bg-light-error-70 text-light-gray-0" },
  { label: "light.error.80", className: "bg-light-error-80 text-light-gray-0" },
  { label: "light.error.90", className: "bg-light-error-90 text-light-gray-0" },
  { label: "light.error.95", className: "bg-light-error-95 text-light-gray-0" },
];

// ============================================================
// Primitive Warning Scale (light.warning.*)
// ============================================================
const lightWarningScale = [
  { label: "light.warning.5", className: "bg-light-warning-5 text-light-gray-90" },
  { label: "light.warning.10", className: "bg-light-warning-10 text-light-gray-90" },
  { label: "light.warning.20", className: "bg-light-warning-20 text-light-gray-90" },
  { label: "light.warning.30", className: "bg-light-warning-30 text-light-gray-90" },
  { label: "light.warning.40", className: "bg-light-warning-40 text-light-gray-90" },
  { label: "light.warning.50", className: "bg-light-warning-50 text-light-gray-90" },
  { label: "light.warning.60", className: "bg-light-warning-60 text-light-gray-90" },
  { label: "light.warning.70", className: "bg-light-warning-70 text-light-gray-0" },
  { label: "light.warning.80", className: "bg-light-warning-80 text-light-gray-0" },
  { label: "light.warning.90", className: "bg-light-warning-90 text-light-gray-0" },
  { label: "light.warning.95", className: "bg-light-warning-95 text-light-gray-0" },
];

// ============================================================
// Primitive Success Scale (light.success.*)
// ============================================================
const lightSuccessScale = [
  { label: "light.success.5", className: "bg-light-success-5 text-light-gray-90" },
  { label: "light.success.10", className: "bg-light-success-10 text-light-gray-90" },
  { label: "light.success.20", className: "bg-light-success-20 text-light-gray-90" },
  { label: "light.success.30", className: "bg-light-success-30 text-light-gray-90" },
  { label: "light.success.40", className: "bg-light-success-40 text-light-gray-90" },
  { label: "light.success.50", className: "bg-light-success-50 text-light-gray-90" },
  { label: "light.success.60", className: "bg-light-success-60 text-light-gray-90" },
  { label: "light.success.70", className: "bg-light-success-70 text-light-gray-0" },
  { label: "light.success.80", className: "bg-light-success-80 text-light-gray-0" },
  { label: "light.success.90", className: "bg-light-success-90 text-light-gray-0" },
  { label: "light.success.95", className: "bg-light-success-95 text-light-gray-0" },
];

// ============================================================
// Common Colors
// ============================================================
const commonColors = [
  { label: "light.common.white", className: "bg-light-common-white text-light-gray-90" },
  { label: "light.common.black", className: "bg-light-common-black text-light-gray-0" },
  { label: "common.white", className: "bg-common-white text-light-gray-90" },
  { label: "common.black", className: "bg-common-black text-light-gray-0" },
];

// ============================================================
// Opacity Colors (Gray/Black/White)
// ============================================================
const grayOpacityColors = [
  { label: "light.gray-opacity.5", className: "bg-light-gray-opacity-5 text-light-gray-90" },
  { label: "light.gray-opacity.10", className: "bg-light-gray-opacity-10 text-light-gray-90" },
  { label: "light.gray-opacity.20", className: "bg-light-gray-opacity-20 text-light-gray-90" },
  { label: "light.gray-opacity.30", className: "bg-light-gray-opacity-30 text-light-gray-0" },
  { label: "light.gray-opacity.40", className: "bg-light-gray-opacity-40 text-light-gray-0" },
  { label: "light.gray-opacity.50", className: "bg-light-gray-opacity-50 text-light-gray-0" },
];

const whiteOpacityColors = [
  {
    label: "light.white-opacity.5",
    className: "bg-light-white-opacity-5 text-light-gray-0",
    bgClassName: "bg-gray-90",
  },
  {
    label: "light.white-opacity.10",
    className: "bg-light-white-opacity-10 text-light-gray-0",
    bgClassName: "bg-gray-90",
  },
  {
    label: "light.white-opacity.20",
    className: "bg-light-white-opacity-20 text-light-gray-0",
    bgClassName: "bg-gray-90",
  },
  {
    label: "light.white-opacity.30",
    className: "bg-light-white-opacity-30 text-light-gray-0",
    bgClassName: "bg-gray-90",
  },
  {
    label: "light.white-opacity.40",
    className: "bg-light-white-opacity-40 text-light-gray-90",
    bgClassName: "bg-gray-90",
  },
  {
    label: "light.white-opacity.50",
    className: "bg-light-white-opacity-50 text-light-gray-90",
    bgClassName: "bg-gray-90",
  },
];

const blackOpacityColors = [
  { label: "black-opacity.5", className: "bg-black-opacity-5 text-light-gray-90" },
  { label: "black-opacity.10", className: "bg-black-opacity-10 text-light-gray-90" },
  { label: "black-opacity.20", className: "bg-black-opacity-20 text-light-gray-90" },
  { label: "black-opacity.30", className: "bg-black-opacity-30 text-light-gray-0" },
  { label: "black-opacity.40", className: "bg-black-opacity-40 text-light-gray-0" },
  { label: "black-opacity.50", className: "bg-black-opacity-50 text-light-gray-0" },
];

const whiteOpacityColors2 = [
  {
    label: "white-opacity.5",
    className: "bg-white-opacity-5 text-light-gray-0",
    bgClassName: "bg-gray-90",
  },
  {
    label: "white-opacity.10",
    className: "bg-white-opacity-10 text-light-gray-0",
    bgClassName: "bg-gray-90",
  },
  {
    label: "white-opacity.20",
    className: "bg-white-opacity-20 text-light-gray-0",
    bgClassName: "bg-gray-90",
  },
  {
    label: "white-opacity.30",
    className: "bg-white-opacity-30 text-light-gray-0",
    bgClassName: "bg-gray-90",
  },
  {
    label: "white-opacity.40",
    className: "bg-white-opacity-40 text-light-gray-90",
    bgClassName: "bg-gray-90",
  },
  {
    label: "white-opacity.50",
    className: "bg-white-opacity-50 text-light-gray-90",
    bgClassName: "bg-gray-90",
  },
];

// ============================================================
// Alias Gray Scale (gray.*)
// ============================================================
const grayScale = [
  { label: "gray.5", className: "bg-gray-5 text-light-gray-90" },
  { label: "gray.10", className: "bg-gray-10 text-light-gray-90" },
  { label: "gray.20", className: "bg-gray-20 text-light-gray-90" },
  { label: "gray.30", className: "bg-gray-30 text-light-gray-90" },
  { label: "gray.40", className: "bg-gray-40 text-light-gray-90" },
  { label: "gray.50", className: "bg-gray-50 text-light-gray-0" },
  { label: "gray.60", className: "bg-gray-60 text-light-gray-0" },
  { label: "gray.70", className: "bg-gray-70 text-light-gray-0" },
  { label: "gray.80", className: "bg-gray-80 text-light-gray-0" },
  { label: "gray.90", className: "bg-gray-90 text-light-gray-0" },
  { label: "gray.95", className: "bg-gray-95 text-light-gray-0" },
];

// ============================================================
// Alias Primary Scale (primary.*)
// ============================================================
const primaryScale = [
  { label: "primary.5", className: "bg-primary-5 text-light-gray-90" },
  { label: "primary.10", className: "bg-primary-10 text-light-gray-90" },
  { label: "primary.20", className: "bg-primary-20 text-light-gray-90" },
  { label: "primary.30", className: "bg-primary-30 text-light-gray-90" },
  { label: "primary.40", className: "bg-primary-40 text-light-gray-90" },
  { label: "primary.50", className: "bg-primary-50 text-light-gray-90" },
  { label: "primary.60", className: "bg-primary-60 text-light-gray-90" },
  { label: "primary.70", className: "bg-primary-70 text-light-gray-0" },
  { label: "primary.80", className: "bg-primary-80 text-light-gray-0" },
  { label: "primary.90", className: "bg-primary-90 text-light-gray-0" },
  { label: "primary.95", className: "bg-primary-95 text-light-gray-0" },
];

// ============================================================
// Alias Secondary Scale (secondary.*)
// ============================================================
const secondaryScale = [
  { label: "secondary.5", className: "bg-secondary-5 text-light-gray-90" },
  { label: "secondary.10", className: "bg-secondary-10 text-light-gray-90" },
  { label: "secondary.20", className: "bg-secondary-20 text-light-gray-90" },
  { label: "secondary.30", className: "bg-secondary-30 text-light-gray-90" },
  { label: "secondary.40", className: "bg-secondary-40 text-light-gray-90" },
  { label: "secondary.50", className: "bg-secondary-50 text-light-gray-90" },
  { label: "secondary.60", className: "bg-secondary-60 text-light-gray-0" },
  { label: "secondary.70", className: "bg-secondary-70 text-light-gray-0" },
  { label: "secondary.80", className: "bg-secondary-80 text-light-gray-0" },
  { label: "secondary.90", className: "bg-secondary-90 text-light-gray-0" },
  { label: "secondary.95", className: "bg-secondary-95 text-light-gray-0" },
];

// ============================================================
// Alias Point Scale (point.*)
// ============================================================
const pointScale = [
  { label: "point.30", className: "bg-point-30 text-light-gray-90" },
  { label: "point.40", className: "bg-point-40 text-light-gray-90" },
  { label: "point.50", className: "bg-point-50 text-light-gray-0" },
];

// ============================================================
// Alias Error Scale (error.*)
// ============================================================
const errorScale = [
  { label: "error.5", className: "bg-error-5 text-light-gray-90" },
  { label: "error.10", className: "bg-error-10 text-light-gray-90" },
  { label: "error.20", className: "bg-error-20 text-light-gray-90" },
  { label: "error.30", className: "bg-error-30 text-light-gray-90" },
  { label: "error.40", className: "bg-error-40 text-light-gray-90" },
  { label: "error.50", className: "bg-error-50 text-light-gray-0" },
  { label: "error.60", className: "bg-error-60 text-light-gray-0" },
  { label: "error.70", className: "bg-error-70 text-light-gray-0" },
  { label: "error.80", className: "bg-error-80 text-light-gray-0" },
  { label: "error.90", className: "bg-error-90 text-light-gray-0" },
  { label: "error.95", className: "bg-error-95 text-light-gray-0" },
];

// ============================================================
// Alias Warning Scale (warning.*)
// ============================================================
const warningScale = [
  { label: "warning.5", className: "bg-warning-5 text-light-gray-90" },
  { label: "warning.10", className: "bg-warning-10 text-light-gray-90" },
  { label: "warning.20", className: "bg-warning-20 text-light-gray-90" },
  { label: "warning.30", className: "bg-warning-30 text-light-gray-90" },
  { label: "warning.40", className: "bg-warning-40 text-light-gray-90" },
  { label: "warning.50", className: "bg-warning-50 text-light-gray-90" },
  { label: "warning.60", className: "bg-warning-60 text-light-gray-90" },
  { label: "warning.70", className: "bg-warning-70 text-light-gray-0" },
  { label: "warning.80", className: "bg-warning-80 text-light-gray-0" },
  { label: "warning.90", className: "bg-warning-90 text-light-gray-0" },
  { label: "warning.95", className: "bg-warning-95 text-light-gray-0" },
];

// ============================================================
// Alias Success Scale (success.*)
// ============================================================
const successScale = [
  { label: "success.5", className: "bg-success-5 text-light-gray-90" },
  { label: "success.10", className: "bg-success-10 text-light-gray-90" },
  { label: "success.20", className: "bg-success-20 text-light-gray-90" },
  { label: "success.30", className: "bg-success-30 text-light-gray-90" },
  { label: "success.40", className: "bg-success-40 text-light-gray-90" },
  { label: "success.50", className: "bg-success-50 text-light-gray-90" },
  { label: "success.60", className: "bg-success-60 text-light-gray-90" },
  { label: "success.70", className: "bg-success-70 text-light-gray-0" },
  { label: "success.80", className: "bg-success-80 text-light-gray-0" },
  { label: "success.90", className: "bg-success-90 text-light-gray-0" },
  { label: "success.95", className: "bg-success-95 text-light-gray-0" },
];

// ============================================================
// Spacing
// ============================================================
const spacingSamples = [
  { label: "none", className: "p-none" },
  { label: "3xs", className: "p-3xs" },
  { label: "2xs", className: "p-2xs" },
  { label: "xs", className: "p-xs" },
  { label: "sm", className: "p-sm" },
  { label: "md", className: "p-md" },
  { label: "lg", className: "p-lg" },
  { label: "xl", className: "p-xl" },
  { label: "2xl", className: "p-2xl" },
  { label: "3xl", className: "p-3xl" },
  { label: "4xl", className: "p-4xl" },
];

// ============================================================
// Gap
// ============================================================
const gapSamples = [
  { label: "none", className: "gap-none" },
  { label: "3xs", className: "gap-3xs" },
  { label: "2xs", className: "gap-2xs" },
  { label: "xs", className: "gap-xs" },
  { label: "sm", className: "gap-sm" },
  { label: "md", className: "gap-md" },
  { label: "lg", className: "gap-lg" },
  { label: "xl", className: "gap-xl" },
  { label: "2xl", className: "gap-2xl" },
  { label: "3xl", className: "gap-3xl" },
];

// ============================================================
// Border Radius
// ============================================================
const radiusSamples = [
  { label: "none", className: "rounded-none" },
  { label: "2xs", className: "rounded-2xs" },
  { label: "xs", className: "rounded-xs" },
  { label: "sm", className: "rounded-sm" },
  { label: "md", className: "rounded-md" },
  { label: "lg", className: "rounded-lg" },
  { label: "xl", className: "rounded-xl" },
  { label: "2xl", className: "rounded-2xl" },
  { label: "3xl", className: "rounded-3xl" },
  { label: "max", className: "rounded-max" },
];

// ============================================================
// Border Width
// ============================================================
const borderWidthSamples = [
  { label: "sm", className: "border-sm" },
  { label: "md", className: "border-md" },
  { label: "lg", className: "border-lg" },
];

// ============================================================
// Typography
// ============================================================
const typographySamples = [
  { label: "family: Pretendard", className: "font-[family-name:var(--typo-family-pretendard)]" },
  { label: "weight: regular (400)", className: "font-[var(--typo-weight-regular)]" },
  { label: "weight: semibold (600)", className: "font-[var(--typo-weight-semibold)]" },
  { label: "weight: bold (700)", className: "font-[var(--typo-weight-bold)]" },
];

// ============================================================
// Section Components
// ============================================================
function ColorSection({
  title,
  items,
  columns = 6,
}: {
  title: string;
  items: Array<{ label: string; className: string; bgClassName?: string }>;
  columns?: number;
}) {
  const gridCols = {
    3: "grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-5",
    6: "grid-cols-3 md:grid-cols-6",
    11: "grid-cols-4 md:grid-cols-6 lg:grid-cols-11",
  }[columns];

  return (
    <section className="gap-lg flex flex-col">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className={`gap-md grid ${gridCols}`}>
        {items.map((item) =>
          item.bgClassName ? (
            // bgClassName이 있으면 중첩 구조: 외부=배경, 내부=opacity 색상
            <div
              key={item.label}
              className={`border-border-gray-light overflow-hidden rounded-md border ${item.bgClassName}`}
            >
              <div
                className={`p-2xs flex h-16 items-center justify-center text-center text-xs font-medium ${item.className}`}
              >
                {item.label}
              </div>
            </div>
          ) : (
            <div
              key={item.label}
              className={`border-border-gray-light p-2xs flex h-16 items-center justify-center rounded-md border text-center text-xs font-medium ${item.className}`}
            >
              {item.label}
            </div>
          )
        )}
      </div>
    </section>
  );
}

function DividerSection({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; className: string; bgClassName?: string }>;
}) {
  return (
    <section className="gap-lg flex flex-col">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="gap-md grid grid-cols-2 md:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={`gap-sm p-sm flex items-center rounded-md ${item.bgClassName || ""}`}
          >
            <div className={`border-t-md h-px flex-1 ${item.className}`} />
            <span className={`text-xs ${item.bgClassName ? "text-light-gray-0" : ""}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BorderSection({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; className: string }>;
}) {
  return (
    <section className="gap-lg flex flex-col">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="gap-md grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
        {items.map((item) => (
          <div
            key={item.label}
            className={`border-md bg-surface-white flex h-16 items-center justify-center rounded-md text-xs font-medium ${item.className}`}
          >
            {item.label}
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================================================
// Main Page Component
// ============================================================
export default function TokensTestPage() {
  return (
    <div className="bg-background-white text-light-gray-90 min-h-screen">
      <div className="gap-2xl p-2xl mx-auto flex max-w-7xl flex-col">
        <header className="gap-sm flex flex-col">
          <h1 className="text-3xl font-semibold">Design Tokens Test</h1>
          <p className="text-light-gray-60">
            Comprehensive test page for all design tokens generated by Style Dictionary for Tailwind
            v4.
          </p>
        </header>

        {/* ============================================================ */}
        {/* SEMANTIC COLORS */}
        {/* ============================================================ */}
        <div className="gap-xl flex flex-col">
          <h2 className="border-border-gray-light pb-sm border-b text-2xl font-bold">
            Semantic Colors
          </h2>
          <ColorSection title="Background Colors" items={semanticBackgrounds} columns={5} />
          <ColorSection title="Surface Colors" items={semanticSurfaces} columns={6} />
        </div>

        {/* ============================================================ */}
        {/* BORDER & DIVIDER COLORS */}
        {/* ============================================================ */}
        <div className="gap-xl flex flex-col">
          <h2 className="border-border-gray-light pb-sm border-b text-2xl font-bold">
            Border & Divider Colors
          </h2>
          <BorderSection title="Border Colors" items={borderSamples} />
          <DividerSection title="Divider Colors" items={dividerSamples} />
        </div>

        {/* ============================================================ */}
        {/* PRIMITIVE COLORS (light.*) */}
        {/* ============================================================ */}
        <div className="gap-xl flex flex-col">
          <h2 className="border-border-gray-light pb-sm border-b text-2xl font-bold">
            Primitive Colors (light.*)
          </h2>
          <ColorSection title="Light Gray Scale" items={lightGrayScale} columns={6} />
          <ColorSection title="Light Primary Scale" items={lightPrimaryScale} columns={11} />
          <ColorSection title="Light Secondary Scale" items={lightSecondaryScale} columns={11} />
          <ColorSection title="Light Point Scale" items={lightPointScale} columns={4} />
          <ColorSection title="Light Error Scale" items={lightErrorScale} columns={11} />
          <ColorSection title="Light Warning Scale" items={lightWarningScale} columns={11} />
          <ColorSection title="Light Success Scale" items={lightSuccessScale} columns={11} />
          <ColorSection title="Common Colors" items={commonColors} columns={4} />
        </div>

        {/* ============================================================ */}
        {/* OPACITY COLORS */}
        {/* ============================================================ */}
        <div className="gap-xl flex flex-col">
          <h2 className="border-border-gray-light pb-sm border-b text-2xl font-bold">
            Opacity Colors
          </h2>
          <ColorSection title="Light Gray Opacity" items={grayOpacityColors} columns={6} />
          <ColorSection
            title="Light White Opacity (dark bg)"
            items={whiteOpacityColors}
            columns={6}
          />
          <ColorSection title="Black Opacity" items={blackOpacityColors} columns={6} />
          <ColorSection title="White Opacity (dark bg)" items={whiteOpacityColors2} columns={6} />
        </div>

        {/* ============================================================ */}
        {/* ALIAS COLORS */}
        {/* ============================================================ */}
        <div className="gap-xl flex flex-col">
          <h2 className="border-border-gray-light pb-sm border-b text-2xl font-bold">
            Alias Colors
          </h2>
          <ColorSection title="Gray Scale" items={grayScale} columns={11} />
          <ColorSection title="Primary Scale" items={primaryScale} columns={11} />
          <ColorSection title="Secondary Scale" items={secondaryScale} columns={11} />
          <ColorSection title="Point Scale" items={pointScale} columns={3} />
          <ColorSection title="Error Scale" items={errorScale} columns={11} />
          <ColorSection title="Warning Scale" items={warningScale} columns={11} />
          <ColorSection title="Success Scale" items={successScale} columns={11} />
        </div>

        {/* ============================================================ */}
        {/* SPACING */}
        {/* ============================================================ */}
        <div className="gap-xl flex flex-col">
          <h2 className="border-border-gray-light pb-sm border-b text-2xl font-bold">
            Spacing & Layout
          </h2>

          <section className="gap-lg flex flex-col">
            <h2 className="text-xl font-semibold">Spacing Scale (padding)</h2>
            <div className="gap-md grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
              {spacingSamples.map((item) => (
                <div key={item.label} className="border-border-gray-light rounded-md border">
                  <div className={`bg-surface-gray-subtle ${item.className}`}>
                    <div className="bg-background-white px-sm py-2xs rounded-sm text-xs font-medium">
                      p-{item.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="gap-lg flex flex-col">
            <h2 className="text-xl font-semibold">Gap Scale</h2>
            <div className="gap-md grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {gapSamples.map((item) => (
                <div key={item.label} className="border-border-gray-light p-sm rounded-md border">
                  <div className={`flex ${item.className}`}>
                    <div className="bg-primary-50 h-8 flex-1 rounded-xs" />
                    <div className="bg-primary-50 h-8 flex-1 rounded-xs" />
                    <div className="bg-primary-50 h-8 flex-1 rounded-xs" />
                  </div>
                  <p className="mt-2xs text-center text-xs font-medium">gap-{item.label}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ============================================================ */}
        {/* SHAPE (RADIUS & BORDER WIDTH) */}
        {/* ============================================================ */}
        <div className="gap-xl flex flex-col">
          <h2 className="border-border-gray-light pb-sm border-b text-2xl font-bold">
            Shape (Radius & Border Width)
          </h2>

          <section className="gap-lg flex flex-col">
            <h2 className="text-xl font-semibold">Border Radius</h2>
            <div className="gap-md grid grid-cols-2 md:grid-cols-5">
              {radiusSamples.map((item) => (
                <div
                  key={item.label}
                  className={`border-md border-border-gray-light bg-surface-white flex h-20 items-center justify-center text-xs font-medium ${item.className}`}
                >
                  rounded-{item.label}
                </div>
              ))}
            </div>
          </section>

          <section className="gap-lg flex flex-col">
            <h2 className="text-xl font-semibold">Border Width</h2>
            <div className="gap-md grid grid-cols-3">
              {borderWidthSamples.map((item) => (
                <div
                  key={item.label}
                  className={`border-border-gray-dark bg-surface-white flex h-16 items-center justify-center rounded-md text-xs font-medium ${item.className}`}
                >
                  border-{item.label}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ============================================================ */}
        {/* TYPOGRAPHY */}
        {/* ============================================================ */}
        <div className="gap-xl flex flex-col">
          <h2 className="border-border-gray-light pb-sm border-b text-2xl font-bold">Typography</h2>

          <section className="gap-lg flex flex-col">
            <h2 className="text-xl font-semibold">Font Family & Weights</h2>
            <div className="gap-md grid grid-cols-1 md:grid-cols-2">
              {typographySamples.map((item) => (
                <div
                  key={item.label}
                  className={`border-border-gray-light bg-surface-white flex h-16 items-center justify-center rounded-md border ${item.className}`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ============================================================ */}
        {/* SUMMARY */}
        {/* ============================================================ */}
        <footer className="mt-xl border-border-gray-light pt-xl border-t">
          <div className="bg-surface-gray-subtle p-lg rounded-lg">
            <h3 className="mb-sm text-lg font-semibold">Token Summary</h3>
            <ul className="gap-sm grid grid-cols-2 text-sm md:grid-cols-4">
              <li>
                <strong>Semantic Colors:</strong> Background, Surface
              </li>
              <li>
                <strong>Border/Divider:</strong> 17 borders, 11 dividers
              </li>
              <li>
                <strong>Primitive Colors:</strong> Gray, Primary, Secondary, Point, Error, Warning,
                Success
              </li>
              <li>
                <strong>Opacity Colors:</strong> Gray, White, Black opacity variants
              </li>
              <li>
                <strong>Spacing:</strong> none ~ 4xl (11 values)
              </li>
              <li>
                <strong>Gap:</strong> none ~ 3xl (10 values)
              </li>
              <li>
                <strong>Radius:</strong> none ~ max (10 values)
              </li>
              <li>
                <strong>Border Width:</strong> sm, md, lg
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </div>
  );
}

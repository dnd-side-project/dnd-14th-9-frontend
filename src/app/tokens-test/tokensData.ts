export type TokenItem = {
  label: string;
  className: string;
  bgClassName?: string;
};

// ============================================================
// Semantic Background Colors
// ============================================================
export const SEMANTIC_BACKGROUNDS: TokenItem[] = [
  { label: "background.white", className: "bg-background-white text-light-gray-90" },
  { label: "background.gray-subtier", className: "bg-background-gray-subtier text-light-gray-90" },
  { label: "background.gray-subtle", className: "bg-background-gray-subtle text-light-gray-90" },
  { label: "background.inverse", className: "bg-background-inverse text-light-gray-0" },
  { label: "background.dim", className: "bg-background-dim text-light-gray-0" },
];

// ============================================================
// Semantic Surface Colors
// ============================================================
export const SEMANTIC_SURFACES: TokenItem[] = [
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
export const BORDER_SAMPLES: TokenItem[] = [
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
export const DIVIDER_SAMPLES: TokenItem[] = [
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
export const LIGHT_GRAY_SCALE: TokenItem[] = [
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
export const LIGHT_PRIMARY_SCALE: TokenItem[] = [
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
export const LIGHT_SECONDARY_SCALE: TokenItem[] = [
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
export const LIGHT_POINT_SCALE: TokenItem[] = [
  { label: "light.point.10", className: "bg-light-point-10 text-light-gray-90" },
  { label: "light.point.30", className: "bg-light-point-30 text-light-gray-90" },
  { label: "light.point.40", className: "bg-light-point-40 text-light-gray-90" },
  { label: "light.point.50", className: "bg-light-point-50 text-light-gray-0" },
];

// ============================================================
// Primitive Error Scale (light.error.*)
// ============================================================
export const LIGHT_ERROR_SCALE: TokenItem[] = [
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
export const LIGHT_WARNING_SCALE: TokenItem[] = [
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
export const LIGHT_SUCCESS_SCALE: TokenItem[] = [
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
export const COMMON_COLORS: TokenItem[] = [
  { label: "light.common.white", className: "bg-light-common-white text-light-gray-90" },
  { label: "light.common.black", className: "bg-light-common-black text-light-gray-0" },
  { label: "common.white", className: "bg-common-white text-light-gray-90" },
  { label: "common.black", className: "bg-common-black text-light-gray-0" },
];

// ============================================================
// Opacity Colors (Gray/Black/White)
// ============================================================
export const GRAY_OPACITY_COLORS: TokenItem[] = [
  { label: "light.gray-opacity.5", className: "bg-light-gray-opacity-5 text-light-gray-90" },
  { label: "light.gray-opacity.10", className: "bg-light-gray-opacity-10 text-light-gray-90" },
  { label: "light.gray-opacity.20", className: "bg-light-gray-opacity-20 text-light-gray-90" },
  { label: "light.gray-opacity.30", className: "bg-light-gray-opacity-30 text-light-gray-0" },
  { label: "light.gray-opacity.40", className: "bg-light-gray-opacity-40 text-light-gray-0" },
  { label: "light.gray-opacity.50", className: "bg-light-gray-opacity-50 text-light-gray-0" },
];

export const WHITE_OPACITY_COLORS: TokenItem[] = [
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

export const BLACK_OPACITY_COLORS: TokenItem[] = [
  { label: "black-opacity.5", className: "bg-black-opacity-5 text-light-gray-90" },
  { label: "black-opacity.10", className: "bg-black-opacity-10 text-light-gray-90" },
  { label: "black-opacity.20", className: "bg-black-opacity-20 text-light-gray-90" },
  { label: "black-opacity.30", className: "bg-black-opacity-30 text-light-gray-0" },
  { label: "black-opacity.40", className: "bg-black-opacity-40 text-light-gray-0" },
  { label: "black-opacity.50", className: "bg-black-opacity-50 text-light-gray-0" },
];

export const WHITE_OPACITY_COLORS_2: TokenItem[] = [
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
export const GRAY_SCALE: TokenItem[] = [
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
export const PRIMARY_SCALE: TokenItem[] = [
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
export const SECONDARY_SCALE: TokenItem[] = [
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
export const POINT_SCALE: TokenItem[] = [
  { label: "point.30", className: "bg-point-30 text-light-gray-90" },
  { label: "point.40", className: "bg-point-40 text-light-gray-90" },
  { label: "point.50", className: "bg-point-50 text-light-gray-0" },
];

// ============================================================
// Alias Error Scale (error.*)
// ============================================================
export const ERROR_SCALE: TokenItem[] = [
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
export const WARNING_SCALE: TokenItem[] = [
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
export const SUCCESS_SCALE: TokenItem[] = [
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
export const SPACING_SAMPLES: TokenItem[] = [
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
export const GAP_SAMPLES: TokenItem[] = [
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
export const RADIUS_SAMPLES: TokenItem[] = [
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
export const BORDER_WIDTH_SAMPLES: TokenItem[] = [
  { label: "sm", className: "border-sm" },
  { label: "md", className: "border-md" },
  { label: "lg", className: "border-lg" },
];

// ============================================================
// Typography
// ============================================================
export const TYPOGRAPHY_SAMPLES: TokenItem[] = [
  { label: "family: Pretendard", className: "font-[family-name:var(--typo-family-pretendard)]" },
  { label: "weight: regular (400)", className: "font-[var(--typo-weight-regular)]" },
  { label: "weight: semibold (600)", className: "font-[var(--typo-weight-semibold)]" },
  { label: "weight: bold (700)", className: "font-[var(--typo-weight-bold)]" },
];

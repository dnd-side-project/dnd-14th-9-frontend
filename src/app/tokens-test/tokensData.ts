export type TokenItem = {
  label: string;
  className: string;
  bgClassName?: string;
};

// ============================================================
// Semantic Background Colors
// ============================================================
export const SEMANTIC_BACKGROUNDS: TokenItem[] = [
  { label: "background.default", className: "bg-background-default text-gray-900" },
  { label: "background.subtle", className: "bg-background-subtle text-gray-900" },
  { label: "background.subtler", className: "bg-background-subtler text-gray-900" },
  { label: "background.inverse", className: "bg-background-inverse text-common-white" },
];

// ============================================================
// Semantic Surface Colors
// ============================================================
export const SEMANTIC_SURFACES: TokenItem[] = [
  { label: "surface.default", className: "bg-surface-default text-gray-900" },
  { label: "surface.inverse", className: "bg-surface-inverse text-common-white" },
  { label: "surface.subtler", className: "bg-surface-subtler text-gray-900" },
  { label: "surface.subtle", className: "bg-surface-subtle text-gray-900" },
  { label: "surface.strong", className: "bg-surface-strong text-gray-900" },
  { label: "surface.disabled", className: "bg-surface-disabled text-common-white" },
  { label: "surface.primary-subtler", className: "bg-surface-primary-subtler text-gray-900" },
  { label: "surface.primary-subtle", className: "bg-surface-primary-subtle text-gray-900" },
  { label: "surface.primary-default", className: "bg-surface-primary-default text-gray-900" },
  { label: "surface.secondary-subtler", className: "bg-surface-secondary-subtler text-gray-900" },
  { label: "surface.secondary-subtle", className: "bg-surface-secondary-subtle text-gray-900" },
  {
    label: "surface.secondary-default",
    className: "bg-surface-secondary-default text-common-white",
  },
  {
    label: "surface.status-danger-subtler",
    className: "bg-surface-status-danger-subtler text-gray-900",
  },
  {
    label: "surface.status-warning-subtler",
    className: "bg-surface-status-warning-subtler text-gray-900",
  },
  {
    label: "surface.status-success-subtler",
    className: "bg-surface-status-success-subtler text-gray-900",
  },
];

// ============================================================
// Border Colors
// ============================================================
export const BORDER_SAMPLES: TokenItem[] = [
  { label: "border-default", className: "border-border-default", bgClassName: "bg-gray-900" },
  { label: "border-subtle", className: "border-border-subtle", bgClassName: "bg-gray-900" },
  { label: "border-strong", className: "border-border-strong", bgClassName: "bg-gray-900" },
  { label: "border-stronger", className: "border-border-stronger", bgClassName: "bg-gray-900" },
  { label: "border-inverse", className: "border-border-inverse" },
  { label: "border-disabled", className: "border-border-disabled" },
  { label: "border-gray-default", className: "border-border-gray-default" },
  { label: "border-gray-strong", className: "border-border-gray-strong" },
  { label: "border-gray-stronger", className: "border-border-gray-stronger" },
  { label: "border-primary-subtler", className: "border-border-primary-subtler" },
  { label: "border-primary-default", className: "border-border-primary-default" },
  { label: "border-secondary-subtler", className: "border-border-secondary-subtler" },
  { label: "border-secondary-default", className: "border-border-secondary-default" },
  { label: "border-error-subtler", className: "border-border-error-subtler" },
  { label: "border-error-default", className: "border-border-error-default" },
  { label: "border-warning-subtler", className: "border-border-warning-subtler" },
  { label: "border-warning-default", className: "border-border-warning-default" },
  { label: "border-success-subtler", className: "border-border-success-subtler" },
  { label: "border-success-default", className: "border-border-success-default" },
];

// ============================================================
// Divider Colors
// ============================================================
export const DIVIDER_SAMPLES: TokenItem[] = [
  { label: "divider-default", className: "border-divider-default" },
  { label: "divider-subtle", className: "border-divider-subtle" },
  { label: "divider-inverse", className: "border-divider-inverse", bgClassName: "bg-gray-900" },
];

// ============================================================
// Primitive Gray Scale
// ============================================================
export const GRAY_SCALE: TokenItem[] = [
  { label: "gray.50", className: "bg-gray-50 text-gray-900" },
  { label: "gray.100", className: "bg-gray-100 text-gray-900" },
  { label: "gray.200", className: "bg-gray-200 text-gray-900" },
  { label: "gray.300", className: "bg-gray-300 text-gray-900" },
  { label: "gray.400", className: "bg-gray-400 text-gray-900" },
  { label: "gray.500", className: "bg-gray-500 text-common-white" },
  { label: "gray.600", className: "bg-gray-600 text-common-white" },
  { label: "gray.700", className: "bg-gray-700 text-common-white" },
  { label: "gray.800", className: "bg-gray-800 text-common-white" },
  { label: "gray.900", className: "bg-gray-900 text-common-white" },
  { label: "gray.950", className: "bg-gray-950 text-common-white" },
];

// ============================================================
// Primary Scale (Green)
// ============================================================
export const GREEN_SCALE: TokenItem[] = [
  { label: "green.50", className: "bg-green-50 text-gray-900" },
  { label: "green.100", className: "bg-green-100 text-gray-900" },
  { label: "green.200", className: "bg-green-200 text-gray-900" },
  { label: "green.300", className: "bg-green-300 text-gray-900" },
  { label: "green.400", className: "bg-green-400 text-gray-900" },
  { label: "green.500", className: "bg-green-500 text-gray-900" },
  { label: "green.600", className: "bg-green-600 text-common-white" },
  { label: "green.700", className: "bg-green-700 text-common-white" },
  { label: "green.800", className: "bg-green-800 text-common-white" },
  { label: "green.900", className: "bg-green-900 text-common-white" },
  { label: "green.950", className: "bg-green-950 text-common-white" },
];

// ============================================================
// Secondary Scale (Teal)
// ============================================================
export const TEAL_SCALE: TokenItem[] = [
  { label: "teal.50", className: "bg-teal-50 text-gray-900" },
  { label: "teal.100", className: "bg-teal-100 text-gray-900" },
  { label: "teal.200", className: "bg-teal-200 text-gray-900" },
  { label: "teal.300", className: "bg-teal-300 text-gray-900" },
  { label: "teal.400", className: "bg-teal-400 text-gray-900" },
  { label: "teal.500", className: "bg-teal-500 text-gray-900" },
  { label: "teal.600", className: "bg-teal-600 text-common-white" },
  { label: "teal.700", className: "bg-teal-700 text-common-white" },
  { label: "teal.800", className: "bg-teal-800 text-common-white" },
  { label: "teal.900", className: "bg-teal-900 text-common-white" },
  { label: "teal.950", className: "bg-teal-950 text-common-white" },
];

// ============================================================
// Error Scale (Red)
// ============================================================
export const RED_SCALE: TokenItem[] = [
  { label: "red.50", className: "bg-red-50 text-gray-900" },
  { label: "red.100", className: "bg-red-100 text-gray-900" },
  { label: "red.200", className: "bg-red-200 text-gray-900" },
  { label: "red.300", className: "bg-red-300 text-gray-900" },
  { label: "red.400", className: "bg-red-400 text-gray-900" },
  { label: "red.500", className: "bg-red-500 text-common-white" },
  { label: "red.600", className: "bg-red-600 text-common-white" },
  { label: "red.700", className: "bg-red-700 text-common-white" },
  { label: "red.800", className: "bg-red-800 text-common-white" },
  { label: "red.900", className: "bg-red-900 text-common-white" },
  { label: "red.950", className: "bg-red-950 text-common-white" },
];

// ============================================================
// Warning Scale (Yellow)
// ============================================================
export const YELLOW_SCALE: TokenItem[] = [
  { label: "yellow.50", className: "bg-yellow-50 text-gray-900" },
  { label: "yellow.100", className: "bg-yellow-100 text-gray-900" },
  { label: "yellow.200", className: "bg-yellow-200 text-gray-900" },
  { label: "yellow.300", className: "bg-yellow-300 text-gray-900" },
  { label: "yellow.400", className: "bg-yellow-400 text-gray-900" },
  { label: "yellow.500", className: "bg-yellow-500 text-gray-900" },
  { label: "yellow.600", className: "bg-yellow-600 text-gray-900" },
  { label: "yellow.700", className: "bg-yellow-700 text-common-white" },
  { label: "yellow.800", className: "bg-yellow-800 text-common-white" },
  { label: "yellow.900", className: "bg-yellow-900 text-common-white" },
  { label: "yellow.950", className: "bg-yellow-950 text-common-white" },
];

// ============================================================
// Success Scale (Cyan)
// ============================================================
export const CYAN_SCALE: TokenItem[] = [
  { label: "cyan.50", className: "bg-cyan-50 text-gray-900" },
  { label: "cyan.100", className: "bg-cyan-100 text-gray-900" },
  { label: "cyan.200", className: "bg-cyan-200 text-gray-900" },
  { label: "cyan.300", className: "bg-cyan-300 text-gray-900" },
  { label: "cyan.400", className: "bg-cyan-400 text-gray-900" },
  { label: "cyan.500", className: "bg-cyan-500 text-gray-900" },
  { label: "cyan.600", className: "bg-cyan-600 text-common-white" },
  { label: "cyan.700", className: "bg-cyan-700 text-common-white" },
  { label: "cyan.800", className: "bg-cyan-800 text-common-white" },
  { label: "cyan.900", className: "bg-cyan-900 text-common-white" },
  { label: "cyan.950", className: "bg-cyan-950 text-common-white" },
];

// ============================================================
// Common Colors
// ============================================================
export const COMMON_COLORS: TokenItem[] = [
  { label: "common.white", className: "bg-common-white text-gray-900" },
  { label: "common.black", className: "bg-common-black text-common-white" },
];

// ============================================================
// Alpha Colors (Black Opacity)
// ============================================================
export const ALPHA_BLACK_COLORS: TokenItem[] = [
  { label: "alpha.black.8", className: "bg-alpha-black-8 text-gray-900" },
  { label: "alpha.black.16", className: "bg-alpha-black-16 text-gray-900" },
  { label: "alpha.black.24", className: "bg-alpha-black-24 text-gray-900" },
  { label: "alpha.black.32", className: "bg-alpha-black-32 text-common-white" },
  { label: "alpha.black.48", className: "bg-alpha-black-48 text-common-white" },
  { label: "alpha.black.64", className: "bg-alpha-black-64 text-common-white" },
  { label: "alpha.black.80", className: "bg-alpha-black-80 text-common-white" },
];

// ============================================================
// Alpha Colors (White Opacity)
// ============================================================
export const ALPHA_WHITE_COLORS: TokenItem[] = [
  {
    label: "alpha.white.8",
    className: "bg-alpha-white-8 text-common-white",
    bgClassName: "bg-gray-900",
  },
  {
    label: "alpha.white.16",
    className: "bg-alpha-white-16 text-common-white",
    bgClassName: "bg-gray-900",
  },
  {
    label: "alpha.white.24",
    className: "bg-alpha-white-24 text-common-white",
    bgClassName: "bg-gray-900",
  },
  {
    label: "alpha.white.32",
    className: "bg-alpha-white-32 text-common-white",
    bgClassName: "bg-gray-900",
  },
  {
    label: "alpha.white.48",
    className: "bg-alpha-white-48 text-gray-900",
    bgClassName: "bg-gray-900",
  },
  {
    label: "alpha.white.64",
    className: "bg-alpha-white-64 text-gray-900",
    bgClassName: "bg-gray-900",
  },
  {
    label: "alpha.white.80",
    className: "bg-alpha-white-80 text-gray-900",
    bgClassName: "bg-gray-900",
  },
];

// ============================================================
// Overlay Colors
// ============================================================
export const OVERLAY_COLORS: TokenItem[] = [
  { label: "overlay.subtle", className: "bg-overlay-subtle text-common-white" },
  { label: "overlay.default", className: "bg-overlay-default text-common-white" },
  { label: "overlay.strong", className: "bg-overlay-strong text-common-white" },
];

// ============================================================
// Text Colors
// ============================================================
export const TEXT_COLORS: TokenItem[] = [
  { label: "text.primary", className: "text-text-primary", bgClassName: "bg-common-white" },
  { label: "text.secondary", className: "text-text-secondary", bgClassName: "bg-common-white" },
  { label: "text.tertiary", className: "text-text-tertiary", bgClassName: "bg-common-white" },
  { label: "text.muted", className: "text-text-muted", bgClassName: "bg-common-white" },
  { label: "text.disabled", className: "text-text-disabled", bgClassName: "bg-common-white" },
  { label: "text.inverse", className: "text-text-inverse", bgClassName: "bg-common-white" },
  {
    label: "text.brand-default",
    className: "text-text-brand-default",
    bgClassName: "bg-common-white",
  },
  {
    label: "text.brand-subtle",
    className: "text-text-brand-subtle",
    bgClassName: "bg-common-white",
  },
  { label: "text.brand-link", className: "text-text-brand-link", bgClassName: "bg-common-white" },
  {
    label: "text.status-negative-default",
    className: "text-text-status-negative-default",
    bgClassName: "bg-common-white",
  },
  {
    label: "text.status-negative-subtle",
    className: "text-text-status-negative-subtle",
    bgClassName: "bg-common-white",
  },
  {
    label: "text.status-warning-default",
    className: "text-text-status-warning-default",
    bgClassName: "bg-common-white",
  },
  {
    label: "text.status-warning-subtle",
    className: "text-text-status-warning-subtle",
    bgClassName: "bg-common-white",
  },
  {
    label: "text.status-positive-default",
    className: "text-text-status-positive-default",
    bgClassName: "bg-common-white",
  },
  {
    label: "text.status-positive-subtle",
    className: "text-text-status-positive-subtle",
    bgClassName: "bg-common-white",
  },
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
  { label: "family: Pretendard", className: "font-pretendard" },
  { label: "weight: regular (400)", className: "font-regular" },
  { label: "weight: semibold (600)", className: "font-semibold" },
  { label: "weight: bold (700)", className: "font-bold" },
];

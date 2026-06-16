---
version: alpha
name: GAK
description: 모여서 각자 작업하는 협업 집중 플랫폼의 디자인 시스템 요약
status: active
lastRefreshed: 2026-06-15
sources:
  tokenSource: tokens/default-token.json
  generatedTokens:
    - src/styles/tokens/theme.css
    - src/styles/tokens/theme-light.css
  figmaWorkflow: docs/figma-workflow.md
colors:
  background: "var(--color-background-default)"
  foreground: "var(--color-text-primary)"
  primary: "var(--color-surface-primary-default)"
  primaryText: "var(--color-text-brand-default)"
  secondary: "var(--color-surface-secondary-default)"
  muted: "var(--color-text-muted)"
  danger: "var(--color-text-status-negative-default)"
  warning: "var(--color-text-status-warning-default)"
  success: "var(--color-text-status-positive-default)"
typography:
  body:
    fontFamily: Pretendard
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.4
  heading:
    fontFamily: Pretendard
    fontWeight: 700
    lineHeight: 1.4
  label:
    fontFamily: Pretendard
    fontSize: 0.875rem
    fontWeight: 600
rounded:
  xs: "var(--radius-xs)"
  sm: "var(--radius-sm)"
  md: "var(--radius-md)"
  lg: "var(--radius-lg)"
  max: "var(--radius-max)"
spacing:
  xs: "var(--spacing-xs)"
  sm: "var(--spacing-sm)"
  md: "var(--spacing-md)"
  lg: "var(--spacing-lg)"
  xl: "var(--spacing-xl)"
  "2xl": "var(--spacing-2xl)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "var(--color-text-inverse)"
    rounded: "{rounded.md}"
    padding: "var(--spacing-md) var(--spacing-lg)"
  badge-status:
    backgroundColor: "var(--color-alpha-white-8)"
    textColor: "var(--color-text-secondary)"
    rounded: "{rounded.max}"
    padding: "var(--spacing-2xs) var(--spacing-xs)"
  input-field:
    backgroundColor: "var(--color-surface-strong)"
    textColor: "{colors.foreground}"
    rounded: "{rounded.sm}"
    padding: "var(--spacing-md)"
  session-card:
    backgroundColor: "var(--color-surface-default)"
    rounded: "{rounded.sm}"
---

# Design

## Overview

GAK is a Korean-first “모여서 각자 작업” product: users quickly gather through a
link, set goals or todos, focus during a time-boxed session, and review results
afterward. The interface should feel focused, lightweight, collaborative, and
fast to join.

This file is the durable design-system contract for agents and contributors. It
summarizes stable visual identity, token usage, component reuse rules, and source
boundaries. Detailed Figma intake and implementation workflow lives in
[`docs/figma-workflow.md`](docs/figma-workflow.md).

## Colors

- The default product shell is dark. Use `background-default` and
  `surface-default` for base surfaces.
- Green is the primary brand/action color. Use it for primary CTAs, active
  selections, progress emphasis, and brand text.
- Teal/cyan support secondary and positive/status contexts. Red and yellow are
  reserved for negative and warning states.
- Text hierarchy should use semantic tokens before opacity or one-off colors:
  `text-primary`, `text-secondary`, `text-tertiary`, `text-muted`, and
  `text-disabled`.
- Light theme tokens exist, but dark mode is the current observed production
  default. Treat light-mode support as a product decision, not an implicit
  requirement.

## Typography

- Use Pretendard as the primary UI font. Geist Sans/Mono may remain available as
  framework fonts, but product UI copy should default to Pretendard.
- Use regular 400 for body, semibold 600 for controls/labels, and bold 700 for
  section titles or strong metrics.
- Common sizing rhythm:
  - 11-13px for metadata and compact labels,
  - 14-16px for body and controls,
  - 18-24px for section titles,
  - 32px+ only for major metrics or exceptional error/result emphasis.
- Keep Korean microcopy concise, direct, and action-oriented.

## Layout

- Use Tailwind-aligned responsive breakpoints from `src/lib/constants/breakpoints.ts`:
  mobile `<768px`, tablet `768px-1279px`, desktop `>=1280px`.
- Global page content generally centers within `max-w-7xl` / 1280px and adapts
  horizontal padding by breakpoint.
- Preserve the current home session-list tradeoff unless product/API decisions
  change: mobile shows 5 cards, tablet/desktop show 8 cards.
- Prefer tokenized spacing steps (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`,
  `4xl`) before arbitrary spacing.
- Keep session and focus flows low-friction: discovery, creation, joining,
  waiting, active session, and result review should make state transitions clear.

## Elevation & Depth

- Prefer borders and surface contrast over heavy shadows.
- Use subtle shadows for modal/onboarding surfaces only when they clarify depth
  or focus.
- Overlays should use existing overlay tokens and must preserve readable contrast
  for dialogs and modals.

## Shapes

- Small-to-medium radii are the default: `xs`, `sm`, `md`, and `lg`.
- Use pill / `max` radius for chips, badges, and tag-like controls.
- Do not introduce new radius values unless matching a confirmed Figma frame or
  proposing a reusable token update.

## Components

Reuse existing components before creating new abstractions:

- Actions: `src/components/Button/Button.tsx`, `ButtonGroup`
- Badges and chips: `ChipBadge`, `ChipGroup`, `CategoryFilterButton`
- Inputs: `src/components/Input/*`, `SearchInput`
- Pickers and filters: `Dropdown`, `Filter`, `DatePicker`
- Cards and lists: existing session/member feature components first
- Shell and feedback: `Header`, `Footer`, dialogs, `Toast`, `ErrorFallbackUI`,
  `SkeletonBlock`, `LoadingSpinner`

Extend shared components only when the new variant or state is reusable across
surfaces. Compose locally for screen-specific layout differences. Do not start a
broad component or design-system redesign as part of a single screen task.

## Do's and Don'ts

Do:

- Prefer existing tokens and generated Tailwind utilities over hard-coded values.
- Keep accessibility and correctness above visual preference.
- Preserve keyboard focus, ARIA semantics, readable contrast, and reduced-motion
  considerations.
- Use skeletons for layout-preserving async loads and retryable localized errors
  near the failed surface.
- Log only sanitized diagnostics; never log tokens, cookies, OAuth payloads, or
  personally identifiable information.
- For Figma-based UI work, follow
  [`docs/figma-workflow.md`](docs/figma-workflow.md) before implementation.

Don't:

- Edit generated token CSS (`src/styles/tokens/theme.css` or
  `theme-light.css`) by hand.
- Treat this file as a pixel-match target. Use the latest confirmed Figma frame
  for screen-specific visuals.
- Add dependencies or new design-system layers for one-off UI differences.
- Hide critical instructions, errors, or validation reasons behind color or
  motion alone.

## Source boundaries

- Full token authority remains `tokens/default-token.json`.
- Generated token CSS is derived output; regenerate it through the token pipeline
  instead of editing it directly.
- `DESIGN.md` governs product-wide design-system principles, source boundaries,
  component reuse expectations, and durable accessibility/privacy guardrails.
- A current, task-specific Figma frame governs exact screen layout and visual
  details.
- Detailed Figma intake, component/token mapping, confirmation gates, and
  implementation reporting live in [`docs/figma-workflow.md`](docs/figma-workflow.md).
- Explicit user instruction for the current task can narrow or override this
  guidance when it is safe, non-destructive, and does not weaken accessibility or
  privacy guardrails.

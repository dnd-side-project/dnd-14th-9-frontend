# Figma Workflow

## Purpose

This document defines the required workflow for Figma-driven UI implementation.
It complements [`../DESIGN.md`](../DESIGN.md): `DESIGN.md` describes the stable
design-system contract, while this file describes how to inspect a Figma target,
map it to existing repo primitives, ask for missing design-system confirmation,
and choose an implementation direction.

## Required intake before implementation

Do not implement immediately after receiving a Figma link or frame. First inspect
the target frame and enumerate, when visible:

- Figma component names
- variants
- visible states
- colors
- typography
- spacing
- radius
- elevation/depth
- icons and imagery
- responsive variants
- repeated layout patterns

Also identify whether the target appears to be:

- a final implementation target,
- an exploratory/reference-only design,
- an outdated design,
- incomplete because states or responsive variants are missing.

## Figma intake confirmation

Before choosing the implementation direction for nontrivial UI work, report the
intake and repo-mapping findings to the user. The report must separate confirmed
facts from unconfirmed items.

Use this shape:

```md
### Figma intake confirmation

I found these Figma components/variants/states:

- ...

I found these design values:

- Color: ...
- Typography: ...
- Spacing/radius/elevation: ...
- Icons/imagery: ...

I confirmed these repo matches:

- Figma ... -> `src/components/...`
- Token ... -> `tokens/default-token.json` / generated Tailwind utility ...

I could not confirm these in the repo:

- ...

Candidate additions:

- New component candidate: ...
- New variant/state candidate: ...
- Token candidate: ...
- Local-only composition candidate: ...

Before I choose the implementation direction, are any of the unconfirmed items newly added design-system components/tokens/variants that should be treated as canonical, or should I implement them as local screen-specific composition for now?
```

Wait for confirmation before finalizing the implementation direction. If the
user explicitly waives confirmation for the specific Figma task, proceed only
after reporting the Figma intake and repo mapping; document assumptions and list
all unconfirmed items in the final report.

## Repo component and token mapping

Map each Figma component to an existing repo component or token before writing UI
code. Prefer the closest current source of truth:

- Figma Button/CTA -> `src/components/Button/Button.tsx`, `ButtonGroup`
- Figma Chip/Badge/Status -> `ChipBadge`, `ChipGroup`, `CategoryFilterButton`
- Figma Input/Textarea/Search -> `src/components/Input/*`, `SearchInput`
- Figma Dropdown/Filter/Date/time -> `Dropdown`, `Filter`, `DatePicker`
- Figma Card/List/Session item -> existing session/member feature components
  before creating a shared component
- Figma Header/Footer/Dialog/Toast/Error/Loading -> existing shell, modal, toast,
  error, skeleton, or spinner components

Use this mapping format in task notes or PR summaries:

| Figma component | Repo component/token | Match level               | Action                            |
| --------------- | -------------------- | ------------------------- | --------------------------------- |
| ...             | ...                  | exact / partial / missing | reuse / extend / compose / create |

## Implementation direction decisions

After intake confirmation, choose the smallest safe implementation direction:

- **Reuse** existing shared or feature components when they already match.
- **Extend** a shared component only when the new variant/state is reusable or
  clearly belongs to that shared component.
- **Compose locally** when the difference is screen-specific layout, content, or
  arrangement.
- **Create a new component** only when existing shared or feature components
  cannot express the design without awkward coupling.
- **Propose a token update** when a repeated Figma value is canonical and not
  represented by current tokens.

## Conflict priority

When Figma, `DESIGN.md`, existing components, and tokens disagree, use this
priority order:

1. Accessibility and correctness
2. Explicit user instruction for the current task
3. Latest confirmed Figma frame for screen-specific layout and visual details
4. `DESIGN.md` for product-wide design principles and workflow constraints
5. Existing repo components and design tokens
6. Existing local implementation patterns

Classify meaningful conflicts before editing:

- **Screen-specific layout/content difference**: compose locally around existing
  components.
- **Missing reusable variant/state**: extend the shared component and update
  tests/stories.
- **Token mismatch or one-off visual value**: prefer existing tokens unless exact
  Figma parity is required; if repeated, record it as a future token candidate.
- **Accessibility conflict**: preserve accessible behavior and flag the
  design/spec conflict.
- **Outdated Figma or outdated code**: state the evidence and ask for
  confirmation before choosing a source of truth.

## Component creation boundary

- Reuse existing shared components first.
- Extend shared components only for reusable variants or states.
- Compose locally for screen-specific differences.
- Do not start a broad common component or design-system redesign as part of one
  Figma task.
- Do not add dependencies for UI behavior unless existing components and hooks
  cannot cover the need and the user explicitly accepts the dependency change.

## Verification path

Before claiming completion:

- Verify the implemented UI against the provided Figma frame.
- Confirm reused or extended components still pass relevant tests.
- Add or update Storybook stories when a shared component variant/state changes.
- Run targeted tests first, then relevant `typecheck` and `lint` checks.
- For pixel-sensitive work, use visual verification separately; `DESIGN.md`
  governs reuse and decision rules, while the approved Figma frame governs exact
  screen-specific visuals.
- Keep privacy-safe diagnostics: never log tokens, cookies, OAuth payloads, or
  personally identifiable information.

## Reporting template

Use this summary for nontrivial Figma-driven UI work:

```md
## Figma implementation report

### Intake

- Target frame/link:
- Target route/surface:
- Components/variants/states found:
- Design values found:

### Repo mapping

| Figma component | Repo component/token | Match level | Action |
| --------------- | -------------------- | ----------- | ------ |
| ...             | ...                  | ...         | ...    |

### Unconfirmed items

- ...

### Implementation direction

- Reused:
- Extended:
- Composed locally:
- Created:
- Token candidates:

### Verification

- Tests:
- Typecheck/lint:
- Visual verification:
- Known gaps:
```

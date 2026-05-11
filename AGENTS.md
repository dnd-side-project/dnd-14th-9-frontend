# Repository Guidelines

## Project Structure & Module Organization
This is a Next.js 16 + React 19 TypeScript app managed with pnpm. Application routes live in `src/app`, reusable UI in `src/components`, domain features in `src/features`, shared hooks in `src/hooks`, API/auth/utilities in `src/lib`, providers in `src/providers`, and global styles plus generated design tokens in `src/styles`. Tests are centralized under `src/test`, while Storybook stories live in `src/stories` and component-adjacent `*.stories.tsx` files. Static assets are in `public`; source design tokens are in `tokens` and `style-dictionary`.

## Build, Test, and Development Commands
- `pnpm dev`: generates/watches tokens and starts the local Next.js dev server.
- `pnpm build`: regenerates tokens and creates a production build.
- `pnpm start`: serves the production build.
- `pnpm lint` / `pnpm lint:fix`: runs ESLint, optionally applying safe fixes.
- `pnpm typecheck`: runs `tsc --noEmit`.
- `pnpm test`, `pnpm test:watch`, `pnpm test:coverage`: run Jest tests.
- `pnpm storybook` / `pnpm build-storybook`: develop or build Storybook.
- `pnpm codegen`: regenerates API code through Orval.

## Coding Style & Naming Conventions
Use TypeScript and React function components. Follow `.editorconfig`: UTF-8, LF, 2-space indentation, final newline. Prettier enforces semicolons, double quotes, trailing commas, 100-character width, and Tailwind class sorting. Prefer clear PascalCase for components, camelCase for functions/variables, and kebab-case for branch descriptions.

## Testing Guidelines
Use Jest with Testing Library for unit and component coverage. Add tests in `src/test/**` with `*.test.ts` or `*.test.tsx` names matching the feature or component under test. Run targeted tests during development, then `pnpm test`, `pnpm typecheck`, and `pnpm lint` before opening a PR.

## Commit & Pull Request Guidelines
Follow the repository workflow: Issue -> Branch -> Code -> Commit -> PR. Create branches from latest `main` using `<type>/<issue-number>-<kebab-description>`, for example `docs/258-add-repository-guidelines`. Commit messages use allowed conventional types and Korean summaries, e.g. `docs: 저장소 기여 가이드 작성`. PRs must use `.github/PULL_REQUEST_TEMPLATE.md`, summarize changes, include `@coderabbitai summary`, link `close #<issue-number>`, and add screenshots for UI changes.

## Security & Configuration Tips
Keep secrets in local env files such as `.env.local`; never commit credentials. Regenerate tokens after changes under `tokens/**`, and restart `pnpm dev` when changing Next.js config or environment files.

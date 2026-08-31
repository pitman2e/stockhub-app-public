# Stockhub-app AI Agent Guide

## Purpose
This repository is a Vite + React + TypeScript front-end app for StockHub. It uses MUI, React Router v7, React Query, Firebase authentication, and a small Redux store for UI snackbars.

<!-- intent-skills:start -->
## Skill Loading

Before editing files for a substantial task:
- Run `npx @tanstack/intent@latest list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## Primary commands
- `npm install`
- `npm run start` — local development server
- `npm run build` — production build
- `npm run serve` — preview production build
- `npm run lint` — lint all files in `src`
- `npm test` — Run tests
- `npm ts-compile` — Run Typescript compiler for type checking

## Key architecture
- `src/pages/ThemedApp.tsx` is the app root and provides MUI theme, Redux provider, and date-picker localization.
- `src/pages/App.tsx` contains the main authenticated app shell, drawer, toolbar, and React Query provider.
- `src/routes.tsx` defines the app routes and page components.
- `src/auth/firebase.ts` initializes Firebase for authentication.
- `src/pages/Login.tsx` renders the sign-in form; login state (`isLogin`/`isLoading` via `onIdTokenChanged`) is handled in `src/pages/App.tsx`.

## Data and API conventions
- API query definitions live in `src/repo/*.ts` as helper classes like `repoStocks`, `repoPortfolio`, `repoDividend`, and `repoUser`.
- These helpers use shared utilities from `src/utils/utils.ts` and React Query defaults from `reactQueryDefaults`.
- Shared TypeScript models are in `src/types/`.
- When `src/types/api.ts` or `src/types/db.ts` changes, change the `reactQueryPersistorCacheBuster` string value in `src/utils/apiClient.ts` (e.g. `"4"` -> `"5"`) to invalidate persisted query data.

## Style and implementation notes
- Prefer existing workspace TypeScript patterns and avoid introducing `any`.
- Component props interface names typically follow `I{ComponentName}Props`.
- Editing components names follow `EditForm{ComponentName}`.
- Master components that the React Router directly renders are named `M{ComponentName}`.
- Table components are named `{ComponentName}Table`.
- Shared types belong in `src/types` rather than component files where appropriate.
- Never remove comments unless it is factually wrong
- Never reformat codes unless modification is needed, new code must follow the surrounding code style
- Keep styling simple, prefer default MUI style and avoid excessive use of the MUI sx props or hardcode value.
- For all files within `src/utils`, strictly use standalone named exports (never default classes or objects) and consume them via namespace imports (e.g., `import * as utils from "./utils"`) to preserve IDE autocomplete.

## Testing
- For every source-code change, run `npx eslint <changed-file>` on the changed source files.
- Run `npm run lint` when changing ESLint configuration or making broad source changes; report existing findings separately and avoid fixing unrelated files.
- `src/tests/setup.ts` mocks most of api calls of `src/repo`. If needed, add/append (but NOT delete) mock data using from `docs/generated/mock_data_sample.md`
- `src/tests/` folder trees should follows `src`. Tests file name should be camelCased, and ends with .test.{tsx|ts}

## Documentation Index
- **Deployment** Refer to `docs/deployment.md` for build, environment, and deployment procedures.
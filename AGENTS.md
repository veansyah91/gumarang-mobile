AGENTS.md — AI Agent Guidelines for gumarang-mobile

Ringkasan singkat (2–4 baris)

- Project: React Native (Expo) + TypeScript mobile app menggunakan file-based routing (expo-router).
- Data fetching: tanstack/react-query + axios (central api client). Local state: zustand. Storage: AsyncStorage / SecureStore.
- Struktur terpusat di folder `src/` (components, hooks, services, state, storage, types, theme).

Tujuan dokumen

- Beri panduan singkat, praktis, dan high-level untuk AI coding agents (coding cepat, refactor, code review) tanpa menjabarkan implementasi detail.

Stack & library inti

- Expo / expo-router (file-based routing under `app/`).
- React 19 + React Native.
- Axios sebagai HTTP client; ada `src/services/api/client.ts` yang menyediakan interceptor, token setter, dan handler unauthorized.
- TanStack React Query (@tanstack/react-query) untuk data fetching/caching.
- Zustand untuk local/global state (store files di `src/state/` dengan suffix `-store`).
- AsyncStorage / expo-secure-store untuk persistent storage (implementasi di `src/storage`).
- react-native-reanimated, react-native-safe-area-context, react-native-screens.
- eslint + prettier + TypeScript for linting/formatting/typecheck.

Struktur & konvensi file (high-level)

- Root app routing: `app/` (expo-router). Gunakan pola route groups seperti yang ada (mis. `(auth)`, `(app)`).
- UI reusable components: `src/components/ui/*` — gunakan untuk primitives (Button, Input, Screen, Header, Text, Badge, dll).
- Domain components: `src/components/*` — komponen layar / partial yang spesifik fitur.
- API layer: `src/services/api/*` — `client.ts` sebagai single axios instance; per-resource modules (auth.ts, member.ts, catalog.ts).
- Background services / utilities: `src/services/*` (contoh: notifications, sync).
- Hooks: `src/hooks/*` — custom hooks named `use-*` (kebab-case filenames like `use-auth.ts`).
- State: `src/state/*` — zustand stores, file names end with `-store` (e.g. `auth-store.ts`).
- Storage: `src/storage/*` — abstractions over AsyncStorage / SecureStore for session, cache, drafts.
- Types: `src/types/*` — shared TypeScript types and interfaces.
- Theme/tokens: `src/theme/tokens.ts` — central design tokens.
- Utils: `src/utils/*` — small helpers (env, date, currency, errors).

File & identifier naming conventions (observed)

- Filenames: kebab-case for TS/TSX files (e.g. `member-certificate-list.tsx`).
- Hooks: prefix `use-` (kebab-case filename), default export or named hook function matching file name is acceptable.
- Components: kebab-case filenames, PascalCase React component names inside files.
- Stores: use suffix `-store` for zustand stores.
- Types: singular nouns in `src/types` (e.g. `user.ts`, `auth.ts`).

Pola integrasi backend (high-level)

- Central axios instance (`apiClient`) with baseURL from env helpers; request/response interceptors used.
- Token management: token set via exported helper (e.g. `setApiAccessToken`) and unauthorized flow via `registerUnauthorizedHandler`.
- Error normalization: API errors are converted to AppError via `toAppError` (`src/utils/errors.ts`) — prefer throwing/returning this wrapper so UI shows friendly messages.
- Public endpoints: some endpoints are treated as public (example checks for `/v1/home` and `/v1/catalog/public` in client).

State & data-fetching rules (Do's)

- Use React Query for remote data fetching, caching and mutation. Keep optimistic updates and query invalidation consistent.
- Use zustand for client-only/global ephemeral state (auth tokens, UI state). Keep heavy normalized domain data in server via react-query.
- Persist only what's necessary in `src/storage/*` abstractions (session, drafts, cache) — avoid duplicating server source-of-truth.

UI & styling

- Use central tokens from `src/theme/tokens.ts` for colors/spacing/typography.
- Prefer small reusable UI primitives in `src/components/ui/*` instead of ad-hoc inline styles across screens.
- Keep component files focused: small presentational components in `components/ui`, larger feature screens in `app/` or `components/`.

Error handling

- Normalize errors using `toAppError` and avoid leaking raw Axios errors to UI.
- Follow existing pattern: response interceptor maps 401 to an `unauthorized` AppError and triggers the registered handler.

Do's & Don'ts (short)

- Do: Follow existing folder layout and naming (kebab-case, use-\*, -store suffix).
- Do: Use central `apiClient` and `toAppError` for network calls and error handling.
- Do: Use React Query for server state; use zustand for local state.
- Don't: Add new global state without clear reason — prefer react-query for server data.
- Don't: Directly access AsyncStorage/secure store across many places — use `src/storage/*` wrappers.
- Don't: Break file-based routing conventions; prefer adding routes under `app/` and leverage expo-router groups.

Testing / lint / build

- Project has `eslint`, `prettier`, and `tsc --noEmit` typecheck scripts. Keep changes passing `npm run lint` and `npm run typecheck`.
- Use `expo` scripts for running and building (`expo start`, `expo run:android`, `eas build` profiles present).

Commit & branching convention (observed)

- Repo shows mixed commit messages (some `fix:` scoped, many plain messages). No strict enforced convention found.
- Recommendation for AI agents: Prefer Conventional Commits (e.g. `fix:`, `feat:`, `chore:`, `docs:`) for clarity, unless repository maintainers indicate otherwise.

When to ask for human review

- Significant UX changes, navigation/route structure changes, or user authentication flows should get human review.
- Any changes touching security (secure-store, google services files, keystore) must be reviewed and secrets must never be committed.

Quick checklist for AI edits

- Match existing filename conventions (kebab-case).
- Update or reuse `src/services/api/client.ts` for HTTP behavior; call `setApiAccessToken` after auth changes.
- Use `toAppError` for error normalization in catch blocks.
- Add new UI elements into `src/components/ui` if reusable; otherwise add screen components under `app/` or `src/components`.
- Run `npm run lint` and `npm run typecheck` before proposing PR.

Notes

- This document is intentionally high-level. Do not change project layout conventions without explicit consent from maintainers.
- To enable Copilot Chat/Agent mode to read this file, ensure the VS Code setting `chat.useAgentsMdFile` is set to true (manual step). Copilot CLI/agents already pick up AGENTS.md automatically.

-- End of AGENTS.md

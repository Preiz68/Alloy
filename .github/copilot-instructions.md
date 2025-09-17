### Project snapshot

- Framework: Next.js (app router). See `app/layout.tsx`, `app/page.tsx`.
- Auth & backend: Firebase (auth, firestore, storage) initialized in `lib/firebase.ts`.
- Forms & validation: `react-hook-form` + `zod` schemas in `schemas/`.
- Styling: Tailwind (see `postcss.config.mjs` and `globals.css`).

### How to run (developer workflows)

- Local dev: `npm run dev` (calls `next dev`) — serves at http://localhost:3000.
- Build: `npm run build` then `npm run start` for production preview.
- Lint: `npm run lint` (uses Next/Eslint config).

Note: Node, npm and Next.js versions are governed by `package.json`. Ensure env vars for Firebase are present (NEXT_PUBLIC_COALLIANCE_FIREBASE_*). See `lib/firebase.ts` for specific names.

### Key patterns & conventions for code edits

- Path aliases: `@/*` maps to project root (see `tsconfig.json`). Use `@/components/...` or `@/lib/...` when adding imports.
- Components live in `components/` and are used directly in `app/*` pages (example: `app/page.tsx` imports `Hero`, `Features`, `CallToAction`).
- Form validation lives in `schemas/` (e.g. `signUpSchema`, `profileSchema`). Prefer reusing these Zod schemas when creating or updating forms.
- Global providers and shared behavior: `app/layout.tsx` mounts `ToastContainer` — use `react-toastify` for notifications for consistency.
- Firebase SDK: `lib/firebase.ts` uses `getApps()` guard to avoid re-initialization. Use `auth`, `db`, `storage`, `googleProvider`, `githubProvider` exported from that file.

### Common edits you'll be asked to make (and how to do them)

- Add a new route/page: create `app/<route>/page.tsx` (export default React component). For nested routes like auth flows, mirror existing structure `app/(auth)/signin/page.tsx`.
- Add a component: put in `components/` and import with `@/components/<Name>`; add associated CSS in `globals.css` or use Tailwind classes inline.
- Add server-side code: prefer Next.js app router patterns (use `export const runtime = 'edge'` or server components when necessary). If environment requires Firebase admin, note there is no admin SDK configured in repo.

### Environment & secrets

- Required env vars (used in `lib/firebase.ts`):
  - `NEXT_PUBLIC_COALLIANCE_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_COALLIANCE_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_COALLIANCE_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_COALLIANCE_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_COALLIANCE_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_COALLIANCE_FIREBASE_APP_ID`

Store them in `.env.local` (not committed). The app expects these values on the client (NEXT_PUBLIC prefix).

### Tests, CI, and debugging

- There are no test scripts in `package.json`. When adding tests prefer lightweight Jest or React Testing Library and wire `npm test` script.
- For runtime debugging: run `npm run dev` and inspect browser console / network. Server logs appear in terminal from Next.js.

### Integration points & external dependencies

- Firebase (client SDK) — primary integration for auth, Firestore, and storage (see `lib/firebase.ts`).
- react-hook-form + zod — forms use these for validation (`schemas/` + components under `app/profile-setup` and `app/(auth)`).
- Third-party UI libs: `react-select`, `react-toastify`, `react-icons`. Keep their usage consistent (see `components/CountrySelect.tsx`, `components/TechInterestSelect.tsx`).

### Helpful examples (copy/paste safe snippets)

- Import firebase exports:

  import { auth, db, googleProvider } from '@/lib/firebase';

- Use an existing zod schema for form typing:

  import { signUpSchema, signUpFormData } from '@/schemas/signupSchema';

  // use with react-hook-form resolver

### What NOT to change without confirmation

- Do not change environment variable names in `lib/firebase.ts` — they are referenced across the app and expected to be public-prefixed.
- Avoid reconfiguring the Next.js major version (package.json pins Next 15) — upgrading may require migration work.

### Where to look next

- `app/` — routes and pages
- `components/` — UI building blocks
- `lib/firebase.ts` — Firebase integration
- `schemas/` — zod validation rules
- `package.json` and `tsconfig.json` — scripts and path aliases

If anything here is unclear or you want the file merged differently (preserve older content), tell me which sections to expand or what CI/build details you can provide and I'll iterate.

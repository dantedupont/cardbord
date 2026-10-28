# cardbord — notes for Claude sessions

Expo SDK 53 + Expo Router 5 + Firebase JS SDK (Auth, Firestore). TypeScript, strict mode.
Roadmap: `docs/dev-plan.md`. Running feature/UX notes: `docs/dev-notes.md`.

## Commands

- `npm ci` then `npx tsc --noEmit` and `npm run lint -- --max-warnings=0` before every push (CI runs the same).
- The app cannot be run on a device here. Firebase config comes from `EXPO_PUBLIC_*` env vars that are not in the repo.
- Full bundle compile check (static render needs a Firebase API key present, any value works):
  `EXPO_PUBLIC_FIREBASE_API_KEY=placeholder EXPO_PUBLIC_FIREBASE_PROJECT_ID=x EXPO_PUBLIC_FIREBASE_APP_ID=1:1:web:1 npx expo export --platform web --output-dir dist`
  then delete `dist/`.

## Conventions

- Screens live in `app/` (file-based routing). Shared UI in `components/`, shared types in `types/`.
- The rating modal is global: call `showModal(game, onRate, existingRating?)` from `context/ModalContext.tsx`.
  `onRate` receives `(rating, datePlayed, review?, favorited?)`; save with `setDoc(..., { merge: true })` and keep `createdAt`.
- Ratings are stored at `users/{uid}/ratings/{gameId}`; game docs are keyed by BoardGameGeek id.
- Hide a tab without removing the route with `href: null` (see `app/(tabs)/_layout.tsx`).
- Styles are currently hardcoded hex colors; a theme-token refactor (PS1 palette + dark mode) is planned in Phase 5.
- Do not commit `.env`, `serviceAccountKey.json`, or seed data (gitignored).

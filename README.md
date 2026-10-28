# cardbord

A mobile app for logging, rating, and reviewing board games, with a social
layer (friends, feed) on the roadmap. Think Letterboxd / Beli for board games.

Built with [Expo](https://expo.dev) (SDK 53, Expo Router) and Firebase
(Auth + Firestore). The `games` collection is seeded from BoardGameGeek data.

## Project status

See [`docs/dev-plan.md`](docs/dev-plan.md) for the phased roadmap and
[`docs/dev-notes.md`](docs/dev-notes.md) for the running UX/feature notes.

- **Phase 1 (auth & profile setup):** done
- **Phase 2 (rating & logging loop):** done
- **Phase 3 (profile & discovery):** in progress
- **Phase 4 (social):** not started
- **Phase 5 (polish):** not started

## Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Create a `.env` file in the project root (it is gitignored). The app reads
   its Firebase web config and Google OAuth client IDs from these variables:

   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   EXPO_PUBLIC_FIREBASE_APP_ID=
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=
   EXPO_PUBLIC_IOS_CLIENT_ID=
   EXPO_PUBLIC_ANDROID_CLIENT_ID=
   EXPO_PUBLIC_EXPO_GO_IOS_CLIENT_ID=
   ```

3. Start the dev server and open the app in a development build

   ```bash
   npm start            # local network
   npm run start:tunnel # when the phone and laptop are on different networks
   ```

   The project uses `expo-dev-client`, so run it in a development build rather
   than Expo Go. Build one with `eas build --profile development --platform ios`
   (or `npx expo run:ios --device` for a local build). A new build is only
   needed when native dependencies change; JS changes load over the dev server.

## Checks

```bash
npx tsc --noEmit   # typecheck
npm run lint       # eslint (expo config)
```

Both run in CI on every push and pull request (`.github/workflows/ci.yml`).

## Layout

```
app/
  _layout.tsx        root stack; routes to login / onboarding / profile by auth state
  (auth)/            login, signup, forgot-password
  (tabs)/            onboarding (hidden after completion), profile
  game/[id].tsx      game detail page
  diary.tsx          chronological log of plays
  my-ratings.tsx     all rated games
  settings.tsx       sign out, delete account
components/          RatingModal, StarRating, MeepleAvatar, ...
context/             ModalContext (global rating modal)
types/               shared TypeScript types (rating data)
firebase.js          Firebase app / auth / firestore init
public/              Firebase Hosting (privacy policy)
docs/                dev plan and notes
```

## Firestore data model

```
users/{uid}                      username, email, avatarUrl, hasCompletedOnboarding, createdAt
users/{uid}/ratings/{gameId}     rating (0.5–5 in half stars), datePlayed, review, favorited,
                                 createdAt, updatedAt
usernames/{usernameLower}        { uid }   (uniqueness lookup)
games/{bggId}                    name, yearPublished, minPlayers, maxPlayers, playTime,
                                 imageUrl, usersRated
```

Security rules are managed in the Firebase console for now; `firebase.json`
expects them at `firestore.rules` if you want to version them here.

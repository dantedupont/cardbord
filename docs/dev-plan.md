Phase 1: Foundation - Finalizing User Setup
This phase focuses on creating a secure, robust, and user-friendly authentication and profile creation flow.
1. Forgot Password Flow: Implement the "forgot password" functionality on the login screen.
2. Sign Up UX & Security:
    * Live Username Check: Check if a username is taken as the user types, providing instant feedback.
    * Show Password Toggle: Add an icon to the password input to let users see what they're typing.
    * Email Verification: After sign-up, send a verification email to the user.
3. Legal & Compliance:
    * Create the static pages for your Terms of Service & Privacy Policy.
    * Add the "I agree" checkbox and links to your sign-up screen.

Phase 2: The Core Loop - Rating & Logging
This phase implements the absolute core feature of the app: rating and logging a played game.
1. Revamp Onboarding Screen:
    * Rebuild the UI into a carousel style, showing one game at a time.
    * Implement the "infinite scroll" logic to continuously fetch new games as the user swipes.
    * Add the blurred game box art as the background for each card.
2. Enhance the Rating Modal:
    * Add a "Date Played" picker.
    * Add a multi-line "Review" text area. (Reviews will require email verification)
3. Create the "Diary" View: Build the screen that shows a chronological list of all logged plays, displaying the game, rating, and date played.
4. Create the "My Reviews" View: Build the screen that shows a list of all games for which the user has written a review.

Phase 3: Profile & Discovery
With the core loop in place, this phase focuses on displaying that data to the user and allowing them to discover games.
1. Build the Search Tab: Create the main search screen with a search bar and implement the logic to search the games collection.
2. Enhance the Profile Screen:
    * Display Top 5 Games: Query the user's ratings and display their top 5 rated games on their profile.
    * Logged Games Library: Create a view of all games the user has logged, with an option to toggle between a simple list and a grid of box art icons.
    * Clickable Ratings: Make the items in the "My Ratings" list navigate to the corresponding game detail page.
3. Enhance the Game Page:
    * Add a prominent "Log/Review" button that opens the rating modal.
    * Add a section to display reviews for that game from other users.

Phase 4: Social & Community
Now that the solo experience is complete, you can build the social network on top of it.
1. Follow System: Create the backend logic for users to follow each other, and add "Follow/Unfollow" buttons to profile pages.
2. Friends Lists: On the profile screen, add views to show a user's "Following" and "Followers" lists.
3. Tagging Friends:
    * Update the Rating Modal to allow users to tag friends they are following in a logged play.
4. Home Feed: Build the main home feed screen, showing a timeline of recent activity (ratings, reviews, logged plays) from followed users.

Phase 5: Polish & Future Growth
These are features that make the app feel complete and ready for a wider audience.
1. UI Polish:
    * Implement your chosen PS1-style color scheme.
    * Add a Dark Mode toggle and theme support.
2. Future Profile Features:
    * Implement the custom profile picture upload flow (once you upgrade your Firebase plan).
    * Add a button to let users re-roll their Meeple avatar.
3. Advanced BGG Integration:
    * Implement a Cloud Function to fetch game credits (designers, artists) and full descriptions from the BGG API.
    * Add the feature where tapping a designer's name shows all their other games.
4. Trending/Discovery: Add a section to the home feed for "Trending Games" based on recent user activity.

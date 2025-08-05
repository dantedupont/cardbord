# Implementation Plan

- [x] 1. Enhance the rating data model and storage

  - Update the rating storage logic to include datePlayed and review fields
  - Modify the throttledSaveRating function to accept additional parameters
  - Create TypeScript interfaces for the enhanced rating data structure
  - _Requirements: 2.1, 2.4_

- [ ] 2. Enhance the RatingModal component with new fields

  - [x] 2.1 Add date picker functionality to RatingModal

    - Install and configure date picker component for cross-platform support
    - Add date state management and default to current date
    - Integrate date picker UI into the modal layout
    - _Requirements: 2.1_

  - [ ] 2.2 Add review text area to RatingModal

    - Create multi-line TextInput component with character limit
    - Add email verification check to conditionally enable/disable review field
    - Implement review text state management and validation
    - _Requirements: 2.2, 2.3_

  - [ ] 2.3 Update RatingModal save functionality
    - Modify the onRate callback to accept rating, date, and review parameters
    - Update the save button logic to collect all form data
    - Add form validation before saving
    - _Requirements: 2.4, 2.5_

- [ ] 3. Transform onboarding screen into carousel format

  - [ ] 3.1 Implement horizontal FlatList with pagination

    - Replace current vertical list with horizontal FlatList
    - Configure snap-to-interval and pagination behavior
    - Add smooth scrolling animations between cards
    - _Requirements: 1.1, 1.2_

  - [ ] 3.2 Add blurred background image to game cards

    - Install expo-blur package if not already available
    - Create GameCard component with blurred background image
    - Implement fallback for games without images
    - _Requirements: 1.4_

  - [ ] 3.3 Implement infinite scroll functionality
    - Add logic to detect when user approaches end of loaded games
    - Create fetchMoreGames function to load additional games in batches
    - Implement loading states for new game fetches
    - _Requirements: 1.3_

- [ ] 4. Create the Diary screen for chronological play history

  - [ ] 4.1 Create DiaryScreen component structure

    - Create new screen file at app/diary.tsx
    - Set up navigation and screen header configuration
    - Create basic component structure with loading states
    - _Requirements: 3.1_

  - [ ] 4.2 Implement diary data fetching logic

    - Create function to fetch all user ratings with game details
    - Implement data sorting by datePlayed in descending order
    - Add error handling and loading states
    - _Requirements: 3.4_

  - [ ] 4.3 Create DiaryEntry component for individual entries

    - Design and implement card layout for diary entries
    - Display game image, name, rating, and date played
    - Handle missing game data gracefully
    - _Requirements: 3.2, 3.3_

  - [ ] 4.4 Add empty state and navigation
    - Create empty state component with encouraging message
    - Add navigation link from profile screen to diary
    - Implement pull-to-refresh functionality
    - _Requirements: 3.5_

- [ ] 5. Create the Reviews screen for written reviews

  - [ ] 5.1 Create ReviewsScreen component structure

    - Create new screen file at app/my-reviews.tsx
    - Set up navigation and screen header configuration
    - Create basic component structure with loading states
    - _Requirements: 4.1_

  - [ ] 5.2 Implement reviews data fetching logic

    - Create function to fetch only ratings that include review text
    - Filter out ratings without reviews during data processing
    - Add error handling and loading states
    - _Requirements: 4.4_

  - [ ] 5.3 Create ReviewEntry component for individual reviews

    - Design and implement expandable card layout for reviews
    - Display game image, name, rating, review text, and date
    - Add character count display for reviews
    - _Requirements: 4.2, 4.3_

  - [ ] 5.4 Add empty state and navigation
    - Create empty state component encouraging users to write reviews
    - Add navigation link from profile screen to reviews
    - Implement pull-to-refresh functionality
    - _Requirements: 4.5_

- [ ] 6. Update navigation and integrate new screens

  - Add diary and reviews navigation options to profile screen
  - Update tab navigation if needed for new screens
  - Ensure proper back navigation and header configurations
  - Test navigation flow between all screens
  - _Requirements: 3.1, 4.1_

- [ ] 7. Update onboarding screen to use enhanced rating modal
  - Modify the existing onboarding screen to pass enhanced rating callback
  - Update the throttledSaveRating function call to include new parameters
  - Test the complete onboarding flow with new rating data
  - _Requirements: 1.5, 2.4_

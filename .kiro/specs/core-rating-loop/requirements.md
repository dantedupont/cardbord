# Requirements Document

## Introduction

This feature implements the core functionality of the board game rating app by enhancing the onboarding experience and adding comprehensive rating and logging capabilities. The feature transforms the current simple onboarding screen into a carousel-style interface with infinite scroll, enhances the rating modal with additional fields, and creates new views for users to track their gaming history and reviews.

## Requirements

### Requirement 1

**User Story:** As a user, I want to browse games in a carousel format during onboarding, so that I can easily discover and rate games one at a time.

#### Acceptance Criteria

1. WHEN the user accesses the onboarding screen THEN the system SHALL display games in a carousel format showing one game at a time
2. WHEN the user swipes left or right THEN the system SHALL navigate to the next or previous game in the carousel
3. WHEN the user reaches near the end of the loaded games THEN the system SHALL automatically fetch and load additional games from the database
4. WHEN displaying each game card THEN the system SHALL show the game's box art as a blurred background image
5. WHEN the user taps on a game card THEN the system SHALL open the enhanced rating modal

### Requirement 2

**User Story:** As a user, I want to log additional details when rating a game, so that I can track when I played it and write reviews.

#### Acceptance Criteria

1. WHEN the user opens the rating modal THEN the system SHALL display a date picker for "Date Played" defaulting to today's date
2. WHEN the user opens the rating modal THEN the system SHALL display a multi-line text area for writing a review
3. WHEN the user attempts to write a review without email verification THEN the system SHALL disable the review field and show a verification message
4. WHEN the user saves a rating THEN the system SHALL store the rating, date played, and review (if provided) in the database
5. WHEN the user saves a rating with a review THEN the system SHALL only save the review if the user's email is verified

### Requirement 3

**User Story:** As a user, I want to view a chronological list of all my logged plays, so that I can track my gaming history.

#### Acceptance Criteria

1. WHEN the user navigates to the diary view THEN the system SHALL display all logged plays in chronological order (most recent first)
2. WHEN displaying each diary entry THEN the system SHALL show the game name, user rating, and date played
3. WHEN displaying each diary entry THEN the system SHALL show the game's box art image
4. WHEN the diary view loads THEN the system SHALL fetch all user ratings with associated game details from the database
5. WHEN the diary is empty THEN the system SHALL display an appropriate empty state message

### Requirement 4

**User Story:** As a user, I want to view all games for which I have written reviews, so that I can easily find and manage my written reviews.

#### Acceptance Criteria

1. WHEN the user navigates to the reviews view THEN the system SHALL display only games for which the user has written reviews
2. WHEN displaying each review entry THEN the system SHALL show the game name, user rating, review text, and date
3. WHEN displaying each review entry THEN the system SHALL show the game's box art image
4. WHEN the reviews view loads THEN the system SHALL fetch only user ratings that include review text
5. WHEN the reviews list is empty THEN the system SHALL display an appropriate empty state message encouraging the user to write reviews
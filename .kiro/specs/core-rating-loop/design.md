# Design Document

## Overview

This design implements the core rating and logging functionality for the board game app by transforming the onboarding experience into a carousel-style interface, enhancing the rating modal with additional fields, and creating new views for tracking gaming history. The design focuses on improving user engagement through better visual presentation and comprehensive data capture.

## Architecture

### Component Structure
```
OnboardingScreen (Enhanced)
├── GameCarousel
│   ├── GameCard (with blurred background)
│   └── InfiniteScrollLogic
├── EnhancedRatingModal
│   ├── DatePicker
│   ├── ReviewTextArea
│   └── EmailVerificationCheck
└── NavigationControls

DiaryScreen (New)
├── ChronologicalGameList
└── GamePlayEntry

ReviewsScreen (New)
├── ReviewsList
└── ReviewEntry
```

### Data Flow
1. **Onboarding**: Carousel fetches games in batches, displays with blurred backgrounds
2. **Rating**: Enhanced modal captures rating, date, and review data
3. **Storage**: Data stored in user's ratings subcollection with expanded schema
4. **Retrieval**: Diary and Reviews screens query and display user's logged data

## Components and Interfaces

### Enhanced Onboarding Screen

**GameCarousel Component**
- Uses React Native's `FlatList` with horizontal scrolling and pagination
- Implements infinite scroll by detecting when user approaches end of list
- Each card displays game with blurred box art background using `expo-blur`
- Smooth transitions between cards with snap-to-interval behavior

**Data Fetching Strategy**
- Initial load: Fetch 20 games ordered by `usersRated` descending
- Infinite scroll: Fetch additional 20 games when user reaches last 5 items
- Cache management: Store fetched games in component state to avoid refetching
- Loading states: Show skeleton cards while fetching new games

### Enhanced Rating Modal

**New Fields**
```typescript
interface RatingData {
  rating: number;
  datePlayed: Date;
  review?: string; // Optional, requires email verification
  createdAt: Date;
  gameId: string;
}
```

**Date Picker Integration**
- Uses React Native's built-in DatePickerIOS/DatePickerAndroid
- Defaults to current date
- Allows selection of past dates only
- Formats date for display and storage

**Review Text Area**
- Multi-line TextInput with character limit (500 characters)
- Conditional rendering based on email verification status
- Placeholder text encourages thoughtful reviews
- Auto-resize based on content

**Email Verification Check**
- Reads `user.emailVerified` from Firebase Auth
- Disables review field if not verified
- Shows inline message with verification prompt
- Links to resend verification email functionality

### Diary Screen

**Data Structure**
```typescript
interface DiaryEntry {
  gameId: string;
  gameName: string;
  gameImageUrl?: string;
  rating: number;
  datePlayed: Date;
  review?: string;
  createdAt: Date;
}
```

**Implementation**
- Fetches all user ratings with associated game details
- Sorts entries by `datePlayed` descending (most recent first)
- Uses FlatList for performance with large datasets
- Implements pull-to-refresh functionality
- Shows loading skeleton while fetching data

**UI Design**
- Card-based layout with game image, name, rating, and date
- Consistent styling with existing app components
- Empty state with encouraging message and link to onboarding

### Reviews Screen

**Data Filtering**
- Queries user ratings where `review` field exists and is not empty
- Fetches associated game details for each reviewed game
- Sorts by review creation date descending

**UI Components**
- Expandable cards showing game info and review text
- Character count indicator for reviews
- Edit functionality for existing reviews (future enhancement)
- Share review functionality (future enhancement)

## Data Models

### Enhanced Rating Document
```typescript
// Collection: users/{userId}/ratings/{gameId}
interface UserRating {
  rating: number;           // 1-10 scale
  datePlayed: Date;         // When the game was played
  review?: string;          // Optional review text (max 500 chars)
  createdAt: Date;          // When rating was created
  updatedAt?: Date;         // When rating was last modified
}
```

### Game Document (Reference)
```typescript
// Collection: games/{gameId}
interface Game {
  id: string;
  name: string;
  imageUrl?: string;
  usersRated: number;
  averageRating?: number;
  // ... other game properties
}
```

## Error Handling

### Network Errors
- Implement retry logic for failed API calls
- Show user-friendly error messages
- Cache data locally when possible
- Graceful degradation when images fail to load

### Data Validation
- Validate rating values (1-10 range)
- Sanitize review text input
- Ensure date played is not in the future
- Handle missing game data gracefully

### User Experience
- Loading states for all async operations
- Optimistic updates for rating submissions
- Offline support for viewing cached data
- Error boundaries to prevent app crashes

## Testing Strategy

### Unit Tests
- Component rendering with various props
- Data transformation functions
- Date formatting utilities
- Input validation logic

### Integration Tests
- Firebase data operations
- Navigation between screens
- Modal interactions
- Infinite scroll behavior

### User Acceptance Tests
- Complete rating flow from onboarding to diary
- Email verification workflow
- Carousel navigation and infinite scroll
- Data persistence across app sessions

### Performance Tests
- Large dataset rendering (1000+ ratings)
- Image loading and caching
- Memory usage during infinite scroll
- Database query optimization
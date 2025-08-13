// Enhanced rating data interfaces based on design document

export interface UserRating {
  rating: number;           // 1-10 scale
  datePlayed: Date;         // When the game was played
  review?: string;          // Optional review text (max 500 chars)
  favorited?: boolean;      // Whether the game is favorited (heart button)
  createdAt: Date;          // When rating was created
  updatedAt?: Date;         // When rating was last modified
}

export interface RatingData {
  rating: number;
  datePlayed: Date;
  review?: string; // Optional, requires email verification
  favorited?: boolean; // Whether the game is favorited
  createdAt: Date;
  gameId: string;
}

export interface DiaryEntry {
  gameId: string;
  gameName: string;
  gameImageUrl?: string;
  rating: number;
  datePlayed: Date;
  review?: string;
  favorited?: boolean;
  createdAt: Date;
}

// Enhanced callback type for rating modal
export type OnRateCallback = (rating: number, datePlayed: Date, review?: string, favorited?: boolean) => void;
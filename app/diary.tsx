import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { auth, db } from "../firebase";
import { UserRating } from "../types/rating";

type DiaryEntry = {
  gameId: string;
  gameName: string;
  gameImageUrl?: string;
  rating: number;
  datePlayed: Date;
  review?: string;
  createdAt: Date;
};

export default function DiaryScreen() {
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const convertToDate = (timestamp: any): Date => {
    if (timestamp && typeof timestamp.toDate === "function") {
      return timestamp.toDate();
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return new Date(timestamp);
  };

  const renderStarRating = (rating: number): string => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    let display = "★".repeat(fullStars);

    if (hasHalfStar) {
      display += "½";
    }

    return display;
  };

  const fetchDiaryEntries = async (userId: string) => {
    try {
      setError(null);

      // Fetch all user ratings
      const ratingsRef = collection(db, "users", userId, "ratings");
      const ratingsQuery = query(ratingsRef, orderBy("datePlayed", "desc"));
      const ratingsSnapshot = await getDocs(ratingsQuery);

      if (ratingsSnapshot.empty) {
        setDiaryEntries([]);
        setLoading(false);
        return;
      }

      // Get game details for each rating
      const diaryEntriesPromises = ratingsSnapshot.docs.map(
        async (ratingDoc) => {
          const ratingData = ratingDoc.data() as UserRating;
          const gameId = ratingDoc.id;

          try {
            // Fetch game details
            const gameDocRef = doc(db, "games", gameId);
            const gameDoc = await getDoc(gameDocRef);

            if (gameDoc.exists()) {
              const gameData = gameDoc.data();
              return {
                gameId,
                gameName: gameData.name || "Unknown Game",
                gameImageUrl: gameData.imageUrl,
                rating: ratingData.rating,
                datePlayed: convertToDate(ratingData.datePlayed),
                review: ratingData.review,
                createdAt: convertToDate(ratingData.createdAt),
              } as DiaryEntry;
            } else {
              // Handle case where game document doesn't exist
              return {
                gameId,
                gameName: "Unknown Game",
                gameImageUrl: undefined,
                rating: ratingData.rating,
                datePlayed: convertToDate(ratingData.datePlayed),
                review: ratingData.review,
                createdAt: convertToDate(ratingData.createdAt),
              } as DiaryEntry;
            }
          } catch (gameError) {
            console.error(`Error fetching game ${gameId}:`, gameError);
            // Return entry with unknown game data
            return {
              gameId,
              gameName: "Unknown Game",
              gameImageUrl: undefined,
              rating: ratingData.rating,
              datePlayed: convertToDate(ratingData.datePlayed),
              review: ratingData.review,
              createdAt: convertToDate(ratingData.createdAt),
            } as DiaryEntry;
          }
        }
      );

      const diaryEntries = await Promise.all(diaryEntriesPromises);

      // Sort by datePlayed in descending order (most recent first)
      const sortedEntries = diaryEntries.sort(
        (a, b) => b.datePlayed.getTime() - a.datePlayed.getTime()
      );

      setDiaryEntries(sortedEntries);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching diary entries:", error);
      setError("Failed to load diary entries. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setLoading(true);
        try {
          await fetchDiaryEntries(user.uid);
        } catch (err) {
          console.error("Error fetching diary entries:", err);
          setError("Failed to load diary entries.");
          setLoading(false);
        }
      } else {
        setDiaryEntries([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRefresh = async () => {
    if (!auth.currentUser) return;

    setRefreshing(true);
    try {
      await fetchDiaryEntries(auth.currentUser.uid);
    } catch (error) {
      console.error("Error refreshing diary:", error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your gaming diary...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable
          style={styles.retryButton}
          onPress={() => {
            if (auth.currentUser) {
              setError(null);
              setLoading(true);
              fetchDiaryEntries(auth.currentUser.uid);
            }
          }}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </Pressable>
      </View>
    );
  }

  if (diaryEntries.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>🎲</Text>
        <Text style={styles.emptyTitle}>Your Gaming Diary is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Start rating games to track your gaming journey! Each game you rate
          will appear here with the date you played it.
        </Text>
        <Pressable
          style={styles.actionButton}
          onPress={() => router.push("/onboarding")}
        >
          <Text style={styles.actionButtonText}>Rate Some Games</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={diaryEntries}
        keyExtractor={(item) => `${item.gameId}-${item.datePlayed.getTime()}`}
        renderItem={({ item }) => (
          <View style={styles.diaryEntry}>
            <View style={styles.entryHeader}>
              <Text style={styles.gameName}>{item.gameName}</Text>
              <Text style={styles.dateText}>
                {item.datePlayed.toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
            <Text style={styles.starRating}>
              {renderStarRating(item.rating)}
            </Text>
          </View>
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
  },
  errorIcon: {
    fontSize: 48,
    textAlign: "center",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 64,
    textAlign: "center",
    marginBottom: 24,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  listContainer: {
    padding: 20,
  },
  diaryEntry: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  gameName: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
    flex: 1,
    marginRight: 12,
  },
  dateText: {
    fontSize: 14,
    color: "#6c757d",
  },
  starRating: {
    fontSize: 18,
    color: "#FFD700",
    letterSpacing: 2,
  },
});

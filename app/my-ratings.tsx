import { Stack } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { auth, db } from '../firebase';

// Define the types for our data
type RatedGame = {
  id: string;
  name: string;
  userRating: number;
  imageUrl?: string;
};

export default function MyRatingsScreen() {
  const [ratedGames, setRatedGames] = useState<RatedGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state to ensure we have a user
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchRatedGames(user.uid);
      } else {
        setLoading(false);
        setRatedGames([]); // Clear games if user logs out
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const fetchRatedGames = async (userId: string) => {
    setLoading(true);
    try {
      // 1. Fetch all of the user's rating documents
      const ratingsQuery = query(
        collection(db, 'users', userId, 'ratings')
      );
      const ratingsSnapshot = await getDocs(ratingsQuery);
      const userRatings = ratingsSnapshot.docs.map(doc => ({
        gameId: doc.id,
        rating: doc.data().rating,
      }));

      // 2. For each rating, fetch the full game details
      const gamePromises = userRatings.map(rating => 
        getDoc(doc(db, 'games', rating.gameId))
      );
      const gameDocs = await Promise.all(gamePromises);

      // 3. Merge the game details with the user's rating
      const games: RatedGame[] = gameDocs.map((gameDoc, index) => {
        const gameData = gameDoc.data();
        return {
          id: gameDoc.id,
          name: gameData?.name || 'Unknown Game',
          imageUrl: gameData?.imageUrl,
          userRating: userRatings[index].rating,
        };
      });

      setRatedGames(games);

    } catch (error) {
      console.error("Error fetching rated games:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'My Ratings', headerBackTitle: 'Back'  }} />
      <FlatList
        data={ratedGames}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.gameItem}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.gameImage} />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
            <View style={styles.gameTextContainer}>
              <Text style={styles.gameName}>{item.name}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>{item.userRating.toFixed(1)}</Text>
            </View>
          </View>
        )}
        ListHeaderComponent={<Text style={styles.title}>All Rated Games</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>You haven&apos;t rated any games yet.</Text>}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 50,
    fontSize: 16,
  },
  gameItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  gameImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  imagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
    backgroundColor: '#e9ecef',
  },
  gameTextContainer: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ratingBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

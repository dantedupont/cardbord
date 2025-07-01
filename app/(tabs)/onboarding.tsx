import { collection, doc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase'; // Adjust path if needed

import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useModal } from '../context/ModalContext';

// Define a type for our game object
type Game = {
  id: string;
  name: string;
  usersRated: number;
  imageUrl?: string;
  userRating?: number; 
};

export default function OnboardingScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showModal } = useModal();

  // Fetch the top 5 games when the component mounts
  useEffect(() => {
    const fetchTopGames = async () => {
      try {
        const gamesRef = collection(db, 'games');
        const topGamesQuery = query(gamesRef, orderBy('usersRated', 'desc'), limit(5));
        const querySnapshot = await getDocs(topGamesQuery);

        if (querySnapshot.empty) {
          setError("No games found in the database.");
        } else {
          const topGamesData: Game[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Game));
          setGames(topGamesData);
        }
      } catch (err) {
        console.error("Firestore fetch failed:", err);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopGames();
  }, []);

  const handleSaveRating = async (gameId: string, rating: number) => {
    if (!auth.currentUser) return;
    const { uid } = auth.currentUser;

    try {
      const ratingDocRef = doc(db, 'user_ratings', `${uid}_${gameId}`);
      await setDoc(ratingDocRef, {
        userId: uid,
        gameId: gameId,
        rating: rating,
        createdAt: new Date(),
      });

      // Update the local state to show the new rating in the UI instantly
      setGames(prevGames =>
        prevGames.map(g =>
          g.id === gameId ? { ...g, userRating: rating } : g
        )
      );
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rate a Few Games</Text>
      <Text style={styles.subtitle}>Tap a game to give it a score.</Text>
      
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          // --- UPDATED: onPress now calls showModal with the game and the save handler ---
          <Pressable onPress={() => showModal(item, (rating) => handleSaveRating(item.id, rating))} style={styles.gameItem}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.gameImage} />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
            <View style={styles.gameTextContainer}>
              <Text style={styles.gameName}>{item.name}</Text>
            </View>
            {item.userRating != null && (
              <View style={styles.ratingBadge}>
                <Text style={styles.ratingText}>{item.userRating.toFixed(1)}</Text>
              </View>
            )}
          </Pressable>
        )}
        style={styles.list}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  list: {
    width: '100%',
    paddingHorizontal: 20,
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

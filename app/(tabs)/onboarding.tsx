import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc } from 'firebase/firestore';
import throttle from 'lodash/throttle';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useModal } from '../context/ModalContext';

type Game = {
  id: string;
  name: string;
  usersRated: number;
  imageUrl?: string;
  userRating?: number | null; 
};

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export default function OnboardingScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showModal } = useModal();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid } = user;
        setLoading(true);
        try {
          // --- NEW: Caching Logic ---
          const cachedGamesJSON = await AsyncStorage.getItem('topGames');
          const cachedTimestampJSON = await AsyncStorage.getItem('topGamesTimestamp');
          let topGamesData: Game[] = [];

          if (cachedGamesJSON && cachedTimestampJSON) {
            const timestamp = JSON.parse(cachedTimestampJSON);
            const isCacheValid = (Date.now() - timestamp) < CACHE_DURATION;
            if (isCacheValid) {
              console.log("Loading top games from cache.");
              topGamesData = JSON.parse(cachedGamesJSON);
            }
          }

          // If cache is invalid or doesn't exist, fetch from Firestore
          if (topGamesData.length === 0) {
            console.log("Fetching top games from Firestore...");
            const gamesRef = collection(db, 'games');
            const topGamesQuery = query(gamesRef, orderBy('usersRated', 'desc'), limit(5));
            const gamesSnapshot = await getDocs(topGamesQuery);
            topGamesData = gamesSnapshot.docs.map(doc => ({
              ...(doc.data() as Game),
              id: doc.id,
            }));
            // Update the cache
            await AsyncStorage.setItem('topGames', JSON.stringify(topGamesData));
            await AsyncStorage.setItem('topGamesTimestamp', JSON.stringify(Date.now()));
          }
    
          // --- Fetch user-specific ratings (this is always done fresh) ---
          const ratingPromises = topGamesData.map(game =>
            getDoc(doc(db, 'users', uid, 'ratings', game.id))
          );
          const ratingDocs = await Promise.all(ratingPromises);
          const ratingsMap = new Map<string, number>();
          ratingDocs.forEach((docSnap, index) => {
            if (docSnap.exists()) {
              ratingsMap.set(topGamesData[index].id, docSnap.data().rating);
            }
          });
    
          // Merge ratings into the game data
          const mergedGames = topGamesData.map(game => ({
            ...game,
            userRating: ratingsMap.get(game.id) ?? null,
          }));
    
          setGames(mergedGames);
        } catch (err) {
          console.error("Error fetching games or ratings:", err);
          setError("Failed to fetch data.");
        } finally {
          setLoading(false);
        }
      } else {
        setGames([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);
  
  const throttledSaveRating = throttle(async (gameId: string, rating: number) => {
    if (!auth.currentUser) return;
    const { uid } = auth.currentUser;

    try {
      const ratingDocRef = doc(db, 'users', uid, 'ratings', gameId);
      await setDoc(ratingDocRef, {
        rating: rating,
        createdAt: new Date(),
      });

      setGames(prevGames =>
        prevGames.map(g =>
          g.id === gameId ? { ...g, userRating: rating } : g
        )
      );
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  }, 1000);

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
          <Pressable onPress={() => showModal(item, (rating) => throttledSaveRating(item.id, rating))} style={styles.gameItem}>
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

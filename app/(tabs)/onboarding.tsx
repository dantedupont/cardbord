import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, startAfter, updateDoc } from 'firebase/firestore';
import throttle from 'lodash/throttle';
import { useEffect, useState } from 'react';
import { auth, db } from '../../firebase';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { ActivityIndicator, Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useModal } from '../../context/ModalContext';
import { UserRating } from '../../types/rating';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.8;
const CARD_SPACING = 20;

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
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreGames, setHasMoreGames] = useState(true);
  const { showModal } = useModal();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const { uid } = user;
        setLoading(true);
        try {
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
            const topGamesQuery = query(gamesRef, orderBy('usersRated', 'desc'), limit(10));
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
              const ratingData = docSnap.data() as UserRating;
              ratingsMap.set(topGamesData[index].id, ratingData.rating);
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

  const fetchMoreGames = async () => {
    if (!auth.currentUser || loadingMore || !hasMoreGames) return;
    
    setLoadingMore(true);
    try {
      const { uid } = auth.currentUser;
      const gamesRef = collection(db, 'games');
      
      // Get the last game document for pagination
      const lastGame = games[games.length - 1];
      const lastGameDoc = await getDoc(doc(db, 'games', lastGame.id));
      
      // Query for next batch of games
      const moreGamesQuery = query(
        gamesRef, 
        orderBy('usersRated', 'desc'), 
        startAfter(lastGameDoc),
        limit(10)
      );
      
      const moreGamesSnapshot = await getDocs(moreGamesQuery);
      
      if (moreGamesSnapshot.empty) {
        setHasMoreGames(false);
        setLoadingMore(false);
        return;
      }
      
      const newGames = moreGamesSnapshot.docs.map(doc => ({
        ...(doc.data() as Game),
        id: doc.id,
      }));
      
      // Fetch user ratings for new games
      const ratingPromises = newGames.map(game =>
        getDoc(doc(db, 'users', uid, 'ratings', game.id))
      );
      const ratingDocs = await Promise.all(ratingPromises);
      const ratingsMap = new Map<string, number>();
      ratingDocs.forEach((docSnap, index) => {
        if (docSnap.exists()) {
          const ratingData = docSnap.data() as UserRating;
          ratingsMap.set(newGames[index].id, ratingData.rating);
        }
      });

      // Merge ratings into game data
      const newGamesWithRatings = newGames.map(game => ({
        ...game,
        userRating: ratingsMap.get(game.id) ?? null,
      }));

      setGames(prevGames => [...prevGames, ...newGamesWithRatings]);
    } catch (error) {
      console.error("Error fetching more games:", error);
    } finally {
      setLoadingMore(false);
    }
  };
  
  const throttledSaveRating = throttle(async (gameId: string, rating: number, datePlayed: Date = new Date(), review?: string, favorited?: boolean) => {
    if (!auth.currentUser) return;
    const { uid } = auth.currentUser;

    try {
      const ratingDocRef = doc(db, 'users', uid, 'ratings', gameId);
      const ratingData: UserRating = {
        rating: rating,
        datePlayed: datePlayed,
        review: review,
        favorited: favorited,
        createdAt: new Date(),
      };
      
      await setDoc(ratingDocRef, ratingData);

      setGames(prevGames =>
        prevGames.map(g =>
          g.id === gameId ? { ...g, userRating: rating } : g
        )
      );
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  }, 1000);
  const handleDone = async () => {
    if (!auth.currentUser) return;
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      // Set the flag in the user's profile to true
      await updateDoc(userDocRef, {
        hasCompletedOnboarding: true,
      });
      // Navigate to the profile screen after updating the flag
      router.replace('/profile');
    } catch (error) {
      console.error("Error completing onboarding:", error);
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

  const currentGame = games[currentGameIndex];

  return (
    <View style={styles.container}>
      {/* Blurred Background */}
      <View style={styles.backgroundContainer}>
        {currentGame?.imageUrl ? (
          <>
            <Image 
              source={{ uri: currentGame.imageUrl }} 
              style={styles.backgroundImage}
              blurRadius={0}
            />
            <BlurView intensity={80} style={styles.blurOverlay} />
          </>
        ) : (
          <View style={[styles.backgroundImage, { backgroundColor: '#f0f0f0' }]} />
        )}

      </View>
      
      <View style={styles.centeredContent}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Rate a Few Games</Text>
        </View>
        
        <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => showModal(item, (rating) => throttledSaveRating(item.id, rating, new Date(), undefined, false))} style={styles.gameCard}>
            <View style={styles.floatingCover}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.gameImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>🎲</Text>
                </View>
              )}
            </View>
            <View style={styles.titleBar}>
              <Text style={styles.gameName} numberOfLines={2}>{item.name}</Text>
              {item.userRating != null && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>{item.userRating.toFixed(1)}</Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + (CARD_SPACING * 2)}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContainer}
        style={styles.carousel}
        onScroll={(event) => {
          const scrollX = event.nativeEvent.contentOffset.x;
          const cardWidth = CARD_WIDTH + (CARD_SPACING * 2);
          const index = Math.round(scrollX / cardWidth);
          setCurrentGameIndex(Math.max(0, Math.min(index, games.length - 1)));
        }}
        scrollEventThrottle={16}
        onEndReached={fetchMoreGames}
        onEndReachedThreshold={0.5}
      />
      
      {loadingMore && (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.loadingMoreText}>Loading more games...</Text>
        </View>
      )}
      </View>
      <Pressable style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>Done</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 120, // Space for the Done button
    zIndex: 1,
  },
  titleContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
    width: CARD_WIDTH * 0.85,
    alignSelf: 'center',
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
  },
  carousel: {
    flexGrow: 0,
    height: 450,
    marginBottom: 100,
  },
  carouselContainer: {
    paddingLeft: (SCREEN_WIDTH - CARD_WIDTH) / 2,
    paddingRight: (SCREEN_WIDTH - CARD_WIDTH) / 2,
  },
  gameCard: {
    width: CARD_WIDTH,
    height: 420,
    marginRight: CARD_SPACING * 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  floatingCover: {
    width: CARD_WIDTH * 0.85,
    height: 320,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    marginBottom: 16,
  },
  gameImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.5,
  },
  titleBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: CARD_WIDTH * 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  ratingText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  doneButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    marginHorizontal: 40,
    marginTop: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
});

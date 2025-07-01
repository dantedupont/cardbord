import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../firebase'; // Adjust path if needed

// --- NEW: Import Image component ---
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';

// --- UPDATED: Add optional imageUrl to the type ---
type Game = {
  id: string;
  name: string;
  usersRated: number;
  imageUrl?: string; // It's optional because not all games will have it yet
};

export default function OnboardingSanityCheck() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopGames = async () => {
      try {
        const gamesRef = collection(db, 'games');
        const topGamesQuery = query(
          gamesRef,
          orderBy('usersRated', 'desc'),
          limit(5)
        );

        const querySnapshot = await getDocs(topGamesQuery);

        if (querySnapshot.empty) {
          setError("No games found in the database.");
        } else {
          const topGamesData: Game[] = [];
          querySnapshot.forEach((doc) => {
            topGamesData.push({ id: doc.id, ...doc.data() } as Game);
          });
          setGames(topGamesData);
        }
      } catch (err) {
        console.error("Firestore fetch failed:", err);
        setError("Failed to fetch data. Check your Firestore rules and connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopGames();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.statusText}>Connecting to Firestore...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error</Text>
        <Text style={styles.statusText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.successText}>Success! Fetched Top 5 Games.</Text>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        // --- UPDATED: renderItem now includes the Image ---
        renderItem={({ item }) => (
          <View style={styles.gameItem}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.gameImage} />
            ) : (
              <View style={styles.imagePlaceholder} />
            )}
            <View style={styles.gameTextContainer}>
              <Text style={styles.gameName}>{item.name}</Text>
              <Text style={styles.gameInfo}>Ratings: {item.usersRated}</Text>
            </View>
          </View>
        )}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    backgroundColor: '#f8f9fa',
  },
  statusText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 20,
  },
  list: {
    width: '100%',
    paddingHorizontal: 20,
  },
  gameItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    borderColor: '#eee',
    borderWidth: 1,
    // --- NEW: Use flexDirection to place image and text side-by-side ---
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  // --- NEW: Styles for the image and its container ---
  gameImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 15,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 15,
    backgroundColor: '#e9ecef',
  },
  gameTextContainer: {
    flex: 1, // Allows text to take up remaining space
  },
  gameName: {
    fontSize: 18,
    fontWeight: '600',
  },
  gameInfo: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
});

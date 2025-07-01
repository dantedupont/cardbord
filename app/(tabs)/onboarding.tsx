import { collection, getDocs, limit, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../firebase';

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';



// --- NEW: Define a type for our game object for better type safety ---
type Game = {
  id: string;
  name: string;
  // Add other game properties here if needed
};

export default function OnboardingSanityCheck() {
  // --- FIX: Explicitly type the state to allow for string or null ---
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // This async function will run once when the component mounts.
    const fetchOneGame = async () => {
      try {
        // 1. Create a very simple query to get just one document from the 'games' collection.
        const gamesRef = collection(db, 'games');
        const sanityCheckQuery = query(gamesRef, limit(1));

        // 2. Execute the query.
        const querySnapshot = await getDocs(sanityCheckQuery);

        // 3. Check if we got any results.
        if (querySnapshot.empty) {
          setError("No games found in the database.");
        } else {
          // 4. If we got a result, grab the very first document.
          const firstGameDoc = querySnapshot.docs[0];
          // 5. Set its data in our state so we can display it.
          setGame({ id: firstGameDoc.id, ...firstGameDoc.data() } as Game);
        }
      } catch (err) {
        console.error("Firestore fetch failed:", err);
        setError("Failed to fetch data. Check your Firestore rules and connection.");
      } finally {
        // 6. Whether it succeeded or failed, we're done loading.
        setLoading(false);
      }
    };

    fetchOneGame();
  }, []); // The empty array ensures this effect runs only once.

  // --- UI Rendering ---

  // While the data is being fetched, show a loading spinner.
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.statusText}>Connecting to Firestore...</Text>
      </View>
    );
  }

  // If there was an error, display it.
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error</Text>
        <Text style={styles.statusText}>{error}</Text>
      </View>
    );
  }

  // If the fetch was successful, display the game's name.
  return (
    <View style={styles.container}>
      <Text style={styles.successText}>Success! Connected to Firestore.</Text>
      <Text style={styles.gameTitle}>Fetched Game:</Text>
      <Text style={styles.gameName}>{game?.name}</Text>
      <Text style={styles.gameId}>(ID: {game?.id})</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  gameTitle: {
    fontSize: 18,
    color: '#6c757d',
  },
  gameName: {
    fontSize: 22,
    fontWeight: '600',
    color: '#212529',
    marginTop: 4,
  },
  gameId: {
    fontSize: 14,
    color: '#adb5bd',
    marginTop: 2,
  },
});

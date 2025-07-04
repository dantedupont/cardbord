import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../../firebase'; // Adjust path if needed

// Define a type for our game data
type Game = {
  id: string;
  name: string;
  yearPublished: number;
  minPlayers: number;
  maxPlayers: number;
  playTime: number;
  imageUrl?: string;
};

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isImageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchGame = async () => {
      setLoading(true);
      try {
        const gameDocRef = doc(db, 'games', id);
        const gameDoc = await getDoc(gameDocRef);

        if (gameDoc.exists()) {
          setGame({ id: gameDoc.id, ...gameDoc.data() } as Game);
        } else {
          console.log("No such game!");
        }
      } catch (error) {
        console.error("Error fetching game:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!game) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Game not found.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ title: game.name, headerBackTitle: 'Back' }} />
        
        <View style={styles.headerContainer}>
          <Pressable onPress={() => game.imageUrl && setImageModalVisible(true)}>
            <View style={styles.imageContainer}>
              {game.imageUrl ? (
                <Image source={{ uri: game.imageUrl }} style={styles.gameImage} resizeMode="contain" />
              ) : (
                <View style={styles.imagePlaceholder} />
              )}
            </View>
          </Pressable>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{game.name}</Text>
            <Text style={styles.year}>({game.yearPublished})</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoBox}>
                <Ionicons name="people-outline" size={20} color="#495057" />
                <Text style={styles.infoText}>{game.minPlayers} - {game.maxPlayers}</Text>
              </View>
              <View style={styles.infoBox}>
                <Ionicons name="time-outline" size={20} color="#495057" />
                <Text style={styles.infoText}>{game.playTime} min</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>
              No description available yet.
            </Text>
          </View>

          <View style={styles.reviewsContainer}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <Text style={styles.placeholderText}>User reviews will be displayed here.</Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={isImageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setImageModalVisible(false)}>
          <Image source={{ uri: game.imageUrl }} style={styles.fullSizeImage} resizeMode="contain" />
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  imageContainer: {
    width: 120,
    height: 120,
    marginRight: 20,
  },
  gameImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#e9ecef',
  },
  headerTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
  },
  year: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  contentContainer: {
    padding: 20,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#343a40',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
  },
  reviewsContainer: {
    // Styles for the future reviews section
  },
  placeholderText: {
    color: '#adb5bd',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullSizeImage: {
    width: '90%',
    height: '90%',
  },
});

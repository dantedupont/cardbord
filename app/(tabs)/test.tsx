// Filename: e.g., app/(tabs)/onboarding.tsx
// The test harness now opens a modal to test the StarRating component.

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// Import your new RatingModal component
import RatingModal from '../components/RatingModal'; // Adjust path if needed

export default function StarRatingTestScreen() {
  const [currentRating, setCurrentRating] = useState(0);
  // --- NEW: State to control the modal's visibility ---
  const [isModalVisible, setModalVisible] = useState(false);

  const handleRatingChange = (rating: number) => {
    console.log("Final rating saved:", rating);
    setCurrentRating(rating);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rating Modal Test</Text>

      {/* This button will open the modal */}
      <Pressable style={styles.openButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.openButtonText}>Rate Gloomhaven</Text>
      </Pressable>

      <Text style={styles.infoText}>
        Last saved rating: {currentRating.toFixed(1)}
      </Text>

      {/* Render the RatingModal */}
      <RatingModal
        visible={isModalVisible}
        onClose={() => setModalVisible(false)}
        onRate={handleRatingChange}
        gameTitle="Gloomhaven"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 32,
  },
  openButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  openButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  infoText: {
    marginTop: 24,
    fontSize: 16,
    color: '#6b7280',
  },
});

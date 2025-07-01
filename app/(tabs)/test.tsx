// Filename: e.g., app/(tabs)/onboarding.tsx
// The test harness for the StarRating component, using standard StyleSheet.

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// Import your StarRating component
import StarRating from '../../components/StarRating'; // Adjust path if needed

export default function StarRatingTestScreen() {
  const [currentRating, setCurrentRating] = useState(0);

  const handleRatingChange = (rating: number) => {
    console.log("New rating:", rating);
    setCurrentRating(rating);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Star Rating Test</Text>
      <Text style={styles.subtitle}>
        Tap or drag on the stars below.
      </Text>

      <StarRating onRatingChange={handleRatingChange} />

      <Text style={styles.ratingValue}>
        {currentRating.toFixed(1)} 
      </Text>
      <Text style={styles.ratingTotal}>
        / 5.0
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#4b5563',
    marginBottom: 32,
  },
  ratingValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginTop: 32,
  },
  ratingTotal: {
    fontSize: 18,
    color: '#6b7280',
  },
});

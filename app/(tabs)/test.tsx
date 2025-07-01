// Filename: e.g., app/(tabs)/onboarding.js
// This is a simple test harness to display and test the StarRating component.

import React, { useState } from 'react';
import { Text, View } from 'react-native';

import StarRating from '../components/StarRating'; // Adjust path if needed

export default function StarRatingTestScreen() {
  const [currentRating, setCurrentRating] = useState(0);
  const handleRatingChange = (rating: number) => {
    console.log("New rating:", rating);
    setCurrentRating(rating);
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      
      <Text className="text-2xl font-bold mb-4">Star Rating Test</Text>
      
      <Text className="text-lg text-gray-600 mb-8">
        Tap or drag on the stars below.
      </Text>

      {/* Render the StarRating component */}
      <StarRating onRatingChange={handleRatingChange} />

      {/* Display the current rating value */}
      <Text className="text-5xl font-bold mt-8">
        {currentRating.toFixed(1)} 
      </Text>
      <Text className="text-lg text-gray-500">
        / 5.0
      </Text>

    </View>
  );
}

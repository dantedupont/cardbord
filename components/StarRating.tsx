import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useRef, useState } from 'react';
import { GestureResponderEvent, PanResponder, StyleSheet, View } from 'react-native';

const STAR_COUNT = 5;
const STAR_SIZE = 60;

type StarRatingProps = {
  onRatingChange: (rating: number) => void;
};

const StarRating: React.FC<StarRatingProps> = ({ onRatingChange }) => {
  const [rating, setRating] = useState<number>(0);
  const [tempRating, setTempRating] = useState<number>(0);
  const lastHapticRating = useRef<number>(0);

  const calculateRating = (xPosition: number): number => {
    const starWidth = STAR_SIZE;
    let rawRating = xPosition / starWidth;
    
    if (rawRating < 0) rawRating = 0;
    if (rawRating > STAR_COUNT) rawRating = STAR_COUNT;

    return Math.floor(rawRating * 2 + 0.5) / 2;
  };

  const triggerHaptic = (newRating: number) => {
    // Only trigger if the new rating is different from the last one that caused a vibration.
    if (newRating !== lastHapticRating.current) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Update the ref to the new rating.
      lastHapticRating.current = newRating;
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const newRating = calculateRating(evt.nativeEvent.locationX);
        setTempRating(newRating);
        triggerHaptic(newRating);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const newRating = calculateRating(evt.nativeEvent.locationX);
        setTempRating(newRating);
        triggerHaptic(newRating);
      },
      onPanResponderRelease: (evt: GestureResponderEvent) => {
        const finalRating = calculateRating(evt.nativeEvent.locationX);
        setRating(finalRating);
        setTempRating(finalRating);
        onRatingChange(finalRating);
        // Reset the haptic tracker on release
        lastHapticRating.current = finalRating;
      },
    })
  ).current;

  return (
    <View
      style={styles.container}
      {...panResponder.panHandlers}
    >
      {[...Array(STAR_COUNT)].map((_, index) => {
        const starNumber = index + 1;
        let iconName: 'star' | 'star-half-sharp' | 'star-outline' = 'star-outline';
        
        if (tempRating >= starNumber) {
          iconName = 'star';
        } else if (tempRating >= starNumber - 0.5) {
          iconName = 'star-half-sharp';
        }

        return (
          <Ionicons
            key={starNumber}
            name={iconName}
            size={STAR_SIZE}
            color={tempRating >= starNumber - 0.5 ? '#FFD700' : '#d3d3d3'}
            pointerEvents="none"
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StarRating;

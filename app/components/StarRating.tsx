import { Ionicons } from '@expo/vector-icons';
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        updateRating(evt.nativeEvent.locationX);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        updateRating(evt.nativeEvent.locationX);
      },
      onPanResponderRelease: () => {
        setRating(tempRating);
        onRatingChange(tempRating);
      },
    })
  ).current;

  const updateRating = (xPosition: number) => {
    const starWidth = STAR_SIZE;
    
    let rawRating = xPosition / starWidth;
    
    if (rawRating < 0) rawRating = 0;
    if (rawRating > STAR_COUNT) rawRating = STAR_COUNT;

    const newRating = Math.floor(rawRating * 2 + 0.5) / 2;
    setTempRating(newRating);
  };

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
            // This makes the icon "invisible" to touches, so the touch event
            // is registered by the parent View, giving us the correct locationX.
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

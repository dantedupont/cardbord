import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { GestureResponderEvent, PanResponder, PanResponderGestureState, View } from 'react-native';

const STAR_COUNT = 5;
const STAR_SIZE = 40;

type StarRatingProps = {
  onRatingChange: (rating: number) => void;
};

type StarContainerRef = View & {
  xPosition?: number;
};

const StarRating: React.FC<StarRatingProps> = ({ onRatingChange }) => {
  const [rating, setRating] = useState<number>(0);
  const [tempRating, setTempRating] = useState<number>(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        updateRating(gestureState.x0);
      },
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        updateRating(gestureState.moveX);
      },
      onPanResponderRelease: () => {
        setRating(tempRating);
        onRatingChange(tempRating);
      },
    })
  ).current;

  const updateRating = (xPosition: number) => {
    const viewX = (starContainerRef.current as StarContainerRef)?.xPosition;
    if (viewX === undefined) return;

    const starWidth = STAR_SIZE;
    let rawRating = (xPosition - viewX) / starWidth;
    
    if (rawRating < 0) rawRating = 0;
    if (rawRating > STAR_COUNT) rawRating = STAR_COUNT;

    const newRating = Math.round(rawRating * 2) / 2;
    setTempRating(newRating);
  };

  const starContainerRef = useRef<StarContainerRef | null>(null);

  return (
    <View
      ref={starContainerRef}
      className="flex-row items-center justify-center"
      {...panResponder.panHandlers}
      onLayout={(event) => {
        if (starContainerRef.current) {
          starContainerRef.current.xPosition = event.nativeEvent.layout.x;
        }
      }}
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
            color={tempRating >= starNumber - 0.5 ? '#facc15' : '#d1d5db'} // yellow-400 and gray-300
          />
        );
      })}
    </View>
  );
};

export default StarRating;

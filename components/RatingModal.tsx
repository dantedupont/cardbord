import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import StarRating from "./StarRating";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const UPWARD_DRAG_LIMIT = -40;

type RatingModalProps = {
  visible: boolean;
  onClose: () => void;
  onRate: (rating: number, datePlayed: Date) => void;
  gameTitle: string;
  imageUrl?: string;
};

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onRate,
  gameTitle,
  imageUrl,
}) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [datePlayed, setDatePlayed] = useState(new Date());

  const panelPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset form state when modal opens
      setSelectedRating(0);
      setDatePlayed(new Date());

      Animated.parallel([
        Animated.spring(panelPosition, {
          toValue: 0,
          bounciness: 2,
          useNativeDriver: true,
        }),
        Animated.timing(imageOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, panelPosition, imageOpacity]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(panelPosition, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(imageOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > 10,
      onPanResponderMove: (_, gestureState) => {
        const { dy } = gestureState;
        const newY = dy < 0 ? dy * 0.5 : dy;
        const finalY = Math.max(newY, UPWARD_DRAG_LIMIT);
        panelPosition.setValue(finalY);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          handleClose();
        } else {
          Animated.spring(panelPosition, {
            toValue: 0,
            bounciness: 2,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSave = () => {
    onRate(selectedRating, datePlayed);
    handleClose();
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.modalContainer}>
      <Pressable style={styles.overlay} onPress={handleClose} />

      <View style={styles.imageContainer}>
        {imageUrl && (
          <Animated.Image
            source={{ uri: imageUrl }}
            style={[styles.floatingImage, { opacity: imageOpacity }]}
            resizeMode="contain"
          />
        )}
      </View>

      <Animated.View
        style={[
          styles.panelContainer,
          { transform: [{ translateY: panelPosition }] },
        ]}
      >
        {/* --- FIX: The panResponder is now attached to this handle ONLY --- */}
        <View {...panResponder.panHandlers} style={styles.dragHandle}>
          <View style={styles.grabber} />
        </View>
        <Text style={styles.title}>{gameTitle}</Text>
        
        <View style={styles.controlsRow}>
          <View style={styles.dateSection}>
            <Text style={styles.dateLabel}>Date Played</Text>
            <DateTimePicker
              value={datePlayed}
              mode="date"
              display={Platform.OS === 'ios' ? 'compact' : 'default'}
              onChange={(_, selectedDate?: Date) => {
                if (selectedDate) {
                  setDatePlayed(selectedDate);
                }
              }}
              maximumDate={new Date()}
              style={styles.nativeDatePicker}
            />
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.favoriteSection}>
            <Text style={styles.favoriteLabel}>Favorite</Text>
            {/* Favorite button will be added here later */}
          </View>
        </View>

        <View style={styles.starsContainer}>
          <StarRating onRatingChange={handleRatingChange} />
        </View>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Rating</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  imageContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 150,
    justifyContent: "center",
    alignItems: "center",
    pointerEvents: "none",
  },
  floatingImage: {
    width: 200,
    height: 200,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  panelContainer: {
    position: "absolute",
    bottom: -40,
    left: 0,
    right: 0,
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  // --- NEW: A dedicated touch area for the drag gesture ---
  dragHandle: {
    width: 100,
    paddingTop: 12,
    paddingBottom: 20,
    alignItems: "center",
  },
  grabber: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#ccc",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 24,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  dateSection: {
    flex: 1,
    alignItems: "center",
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  nativeDatePicker: {
    width: 140,
    height: Platform.OS === 'ios' ? 40 : 50,
  },
  divider: {
    width: 1,
    height: 60,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  favoriteSection: {
    flex: 1,
    alignItems: "center",
  },
  favoriteLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  starsContainer: {
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 50,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RatingModal;

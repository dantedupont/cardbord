import DateTimePicker from "@react-native-community/datetimepicker";
import { onAuthStateChanged, User } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  Keyboard,
  PanResponder,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { auth } from "../firebase";
import StarRating from "./StarRating";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const UPWARD_DRAG_LIMIT = -40;

type RatingModalProps = {
  visible: boolean;
  onClose: () => void;
  onRate: (rating: number, datePlayed: Date) => void;
  gameTitle: string;
  imageUrl?: string;
  yearPublished?: number;
};

const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
  onRate,
  gameTitle,
  imageUrl,
  yearPublished,
}) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [datePlayed, setDatePlayed] = useState(new Date());
  const [reviewText, setReviewText] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [isReviewFocused, setIsReviewFocused] = useState(false);

  const panelPosition = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', 
      (event) => {
        // Use keyboard animation duration and easing for smooth sync
        const duration = event?.duration || 250;
        
        Animated.timing(panelPosition, {
          toValue: -150,
          duration: duration,
          useNativeDriver: true,
        }).start();
      }
    );

    const keyboardHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event) => {
        // Use keyboard animation duration for smooth sync
        const duration = event?.duration || 250;
        
        Animated.timing(panelPosition, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }).start();
      }
    );

    return () => {
      keyboardShowListener?.remove();
      keyboardHideListener?.remove();
    };
  }, [panelPosition]);

  useEffect(() => {
    if (visible) {
      // Reset form state when modal opens
      setSelectedRating(0);
      setDatePlayed(new Date());
      setReviewText("");
      setIsReviewFocused(false);

      Animated.spring(panelPosition, {
        toValue: 0,
        bounciness: 2,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, panelPosition]);

  const handleClose = () => {
    Animated.timing(panelPosition, {
      toValue: SCREEN_HEIGHT,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
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



      <Animated.View
        style={[
          styles.panelContainer,
          { transform: [{ translateY: panelPosition }] },
        ]}
      >
        {/* Draggable area covering drag handle and title */}
        <View {...panResponder.panHandlers} style={styles.draggableTopSection}>
          <View style={styles.dragHandle}>
            <View style={styles.grabber} />
          </View>
          <View style={styles.titleContainer}>
            {imageUrl && (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.titleImage} 
                resizeMode="cover"
              />
            )}
            <Text style={styles.title}>
              {gameTitle}
              {yearPublished && (
                <Text style={styles.yearText}> ({yearPublished})</Text>
              )}
            </Text>
          </View>
        </View>
          
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

        <View style={styles.reviewSection}>
          <Text style={styles.reviewLabel}>Write a Review</Text>
          {user?.emailVerified ? (
            <>
              <TextInput
                style={[
                  styles.reviewInput,
                  isReviewFocused ? styles.reviewInputExpanded : styles.reviewInputCollapsed
                ]}
                placeholder="Share your thoughts about this game..."
                value={reviewText}
                onChangeText={(text) => {
                  if (text.length <= 500) {
                    setReviewText(text);
                  }
                }}
                multiline={true}
                numberOfLines={isReviewFocused ? 4 : 1}
                maxLength={500}
                textAlignVertical="top"
                onFocus={() => setIsReviewFocused(true)}
                onBlur={() => setIsReviewFocused(false)}
                returnKeyType="done"
                blurOnSubmit={true}
              />
              <Text style={styles.characterCount}>
                {reviewText.length}/500 characters
              </Text>
            </>
          ) : (
            <View style={styles.verificationMessage}>
              <Text style={styles.verificationText}>
                Please verify your email to write reviews
              </Text>
            </View>
          )}
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
  // --- NEW: Expanded draggable area covering the entire top section ---
  draggableTopSection: {
    width: '100%',
    alignItems: 'center',
  },
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
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  titleImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    position: 'absolute',
    left: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  yearText: {
    fontSize: 18,
    fontWeight: "normal",
    color: "#6c757d",
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
    marginBottom: 24,
  },
  reviewSection: {
    width: '100%',
    marginBottom: 24,
  },
  reviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  reviewInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  reviewInputCollapsed: {
    minHeight: 44,
    maxHeight: 44,
  },
  reviewInputExpanded: {
    minHeight: 100,
    maxHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 4,
  },
  verificationMessage: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  verificationText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
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

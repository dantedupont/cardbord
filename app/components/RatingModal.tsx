import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import StarRating from './StarRating'; // Import the StarRating component

type RatingModalProps = {
  visible: boolean;
  onClose: () => void;
  onRate: (rating: number) => void;
  gameTitle: string;
};

const RatingModal: React.FC<RatingModalProps> = ({ visible, onClose, onRate, gameTitle }) => {
  let selectedRating = 0;

  const handleRatingChange = (rating: number) => {
    selectedRating = rating;
  };

  const handleSave = () => {
    onRate(selectedRating);
    onClose(); // Close the modal after saving
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Text style={styles.title}>{gameTitle}</Text>
          <Text style={styles.subtitle}>Select your rating</Text>
          
          <View style={styles.starsContainer}>
            <StarRating onRatingChange={handleRatingChange} />
          </View>

          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Rating</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  container: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 40, // Extra padding at the bottom
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 24,
  },
  starsContainer: {
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 50,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RatingModal;

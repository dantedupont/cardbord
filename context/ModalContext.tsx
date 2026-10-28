import React, { createContext, ReactNode, useContext, useState } from 'react';
import RatingModal from '../components/RatingModal';
import { ExistingRating, OnRateCallback } from '../types/rating';

// Define a type for the game object
type Game = {
  id: string;
  name: string;
  imageUrl?: string;
  yearPublished?: number;
};

// Define the shape of our context's state and functions
type ModalContextType = {
  // showModal accepts the save callback and, optionally, the user's existing rating to edit
  showModal: (game: Game, onRate: OnRateCallback, existingRating?: ExistingRating) => void;
  hideModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

// Create a custom hook for easy access to the context
export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

// The provider component that will wrap our app
export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  // State to hold the current onRate callback
  const [onRateCallback, setOnRateCallback] = useState<{ fn: OnRateCallback } | null>(null);
  const [existingRating, setExistingRating] = useState<ExistingRating | undefined>(undefined);

  const showModal = (game: Game, onRate: OnRateCallback, existing?: ExistingRating) => {
    setSelectedGame(game);
    // Store the callback function in a way that avoids stale closures
    setOnRateCallback({ fn: onRate });
    setExistingRating(existing);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedGame(null);
    setOnRateCallback(null);
    setExistingRating(undefined);
  };

  const value = { showModal, hideModal };

  return (
    <ModalContext.Provider value={value}>
      {children}
      
      {/* Render the modal globally here */}
      {selectedGame && onRateCallback && (
        <RatingModal
          visible={modalVisible}
          onClose={hideModal}
          onRate={onRateCallback.fn}
          gameTitle={selectedGame.name}
          imageUrl={selectedGame.imageUrl}
          yearPublished={selectedGame.yearPublished}
          existingRating={existingRating}
        />
      )}
    </ModalContext.Provider>
  );
};

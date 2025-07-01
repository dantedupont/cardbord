import React, { createContext, ReactNode, useContext, useState } from 'react';
import RatingModal from '../../components/RatingModal';

// Define a type for the game object
type Game = {
  id: string;
  name: string;
  imageUrl?: string;
};

type OnRateCallback = (rating: number) => void;

// Define the shape of our context's state and functions
type ModalContextType = {
  showModal: (game: Game, onRate: OnRateCallback) => void;
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
  // --- NEW: State to hold the current onRate callback ---
  const [onRateCallback, setOnRateCallback] = useState<OnRateCallback | null>(null);

  const showModal = (game: Game, onRate: OnRateCallback) => {
    setSelectedGame(game);
    setOnRateCallback(() => onRate);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    setSelectedGame(null);
    setOnRateCallback(null);
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
          onRate={onRateCallback}
          gameTitle={selectedGame.name}
          imageUrl={selectedGame.imageUrl}
        />
      )}
    </ModalContext.Provider>
  );
};

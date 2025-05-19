// components/FlashcardModal.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import ImportFromFile from './ImportFile';
import GeneratePrompt from './GeneratePrompt';

interface FlashcardModalProps {
  visible: boolean;
  onClose: () => void;
}

const FlashcardModal: React.FC<FlashcardModalProps> = ({ visible, onClose }) => {
  const [currentScreen, setCurrentScreen] = useState<'main' | 'import' | 'generate'>('main');

  const renderMainScreen = () => (
    <View style={styles.modalContent}>
      <View style={styles.modalHeader}>
        <View style={styles.headerLeft}>
          <Ionicons name="folder" size={24} color="#4A86E8" />
          <Text style={styles.modalTitle}>New Flashcards</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={24} color="#666" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => setCurrentScreen('generate')}
      >
        <View style={styles.optionIconContainer}>
          <View style={styles.searchIconCircle}>
            <Feather name="search" size={20} color="#4A86E8" />
          </View>
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>Generate with Prompt</Text>
          <Text style={styles.optionDescription}>
            Just describe what you want to learn and we'll turn it into flashcards.
          </Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.optionCard}
        onPress={() => setCurrentScreen('import')}
      >
        <View style={styles.optionIconContainer}>
          <Image 
            source={require('../../assets/folder-icon.png')} 
            style={styles.folderIcon}
          />
        </View>
        <View style={styles.optionTextContainer}>
          <Text style={styles.optionTitle}>Import from File</Text>
          <Text style={styles.optionDescription}>
            Upload a PDF, PPT, or text file and we'll convert it to flashcards.
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {currentScreen === 'main' && renderMainScreen()}
          {currentScreen === 'import' && (
            <ImportFromFile onBack={() => setCurrentScreen('main')} onClose={onClose} />
          )}
          {currentScreen === 'generate' && (
            <GeneratePrompt onBack={() => setCurrentScreen('main')} onClose={onClose} />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A86E8',
    marginLeft: 8,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E1E3E6',
  },
  optionIconContainer: {
    marginRight: 16,
    justifyContent: 'center',
  },
  searchIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F1FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  folderIcon: {
    width: 40,
    height: 40,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A86E8',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
});

export default FlashcardModal;
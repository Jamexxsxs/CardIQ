// components/ImportFromFileScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput,
  ScrollView,
  Image
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface ImportFromFileScreenProps {
  onBack: () => void;
  onClose: () => void;
}

const ImportFile: React.FC<ImportFromFileScreenProps> = ({ onBack, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [cardCount, setCardCount] = useState(15);

  const handleSave = () => {
    // Implement save functionality
    console.log('Saving flashcard set:', { title, description, category, cardCount });
    onClose();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Feather name="arrow-left" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attach File</Text>
        <View style={styles.fileUploadContainer}>
          <Image 
            source={require('../../assets/folder-icon.png')} 
            style={styles.folderIcon}
          />
          <Text style={styles.uploadText}>
            Upload a PDF, PPT, or text file and we'll convert it to flashcards.
          </Text>
          <TouchableOpacity style={styles.browseButton}>
            <Text style={styles.browseButtonText}>Browse Files</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set Information</Text>
        
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Algebra Fundamentals"
          value={title}
          onChangeText={setTitle}
        />
        
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Brief description of this flashcard set"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
        
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity style={styles.selectInput}>
          <Text style={styles.selectText}>
            {category || 'Select Category'}
          </Text>
          <Feather name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
        
        <Text style={styles.label}>Number of Cards to Generate</Text>
        <View style={styles.cardCountContainer}>
          {[5, 10, 15, 20, 25].map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.cardCountButton,
                cardCount === count && styles.cardCountButtonActive
              ]}
              onPress={() => setCardCount(count)}
            >
              <Text
                style={[
                  styles.cardCountText,
                  cardCount === count && styles.cardCountTextActive
                ]}
              >
                {count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  fileUploadContainer: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CCC',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  folderIcon: {
    width: 60,
    height: 60,
    marginBottom: 16,
  },
  uploadText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  browseButton: {
    backgroundColor: '#4A86E8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  browseButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E1E3E6',
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    color: '#4A86E8',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E3E6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: '#E1E3E6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    color: '#666',
  },
  cardCountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardCountButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E1E3E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardCountButtonActive: {
    backgroundColor: '#4A86E8',
    borderColor: '#4A86E8',
  },
  cardCountText: {
    color: '#666',
  },
  cardCountTextActive: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#4A86E8',
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ImportFile;
"use client"

import type React from "react"
import { useContext, useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, ActivityIndicator } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useCategoryTable } from "../../hooks/useCategoryTable"
import { useCardTable } from "../../hooks/useCardTable"
import { AuthContext } from "../../App"

const GeneratePrompt: React.FC = () => {
  const navigation = useNavigation()
  const { userId } = useContext(AuthContext);
  const { refresh } = useCategoryTable(userId);
  const { generateCardsFromPrompt } = useCardTable(userId);
  const [prompt, setPrompt] = useState("")
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cardCount, setCardCount] = useState(15)
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      const rows = await refresh();
      setCategories(rows);
    };

    loadCategories();
  }, []);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("Please enter a prompt.");
      return;
    }

    if (!category) {
      alert("Please select a category.");
      return;
    }

    try {
      setIsGenerating(true);
      console.log("Generating flashcards:", { prompt, category, cardCount });
      const { topic_id } = await generateCardsFromPrompt(prompt, category as any, cardCount);
      navigation.navigate("FlashcardDetail", { id: topic_id });
    } catch (error) {
      console.error("Error generating flashcards:", error);
      alert("Failed to generate flashcards. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generate with Prompt</Text>

          <Text style={styles.label}>Prompt</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe what you want to learn about..."
            value={prompt}
            onChangeText={setPrompt}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            editable={!isGenerating}
          />

          <Text style={styles.promptTip}>
            Example: "Create flashcards about the solar system, including facts about each planet."
          </Text>

          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => !isGenerating && setShowDropdown(!showDropdown)}
            disabled={isGenerating}
          >
            <Text style={styles.selectText}>
              {category ? categories.find(c => c.id === category)?.name : 'Select Category'}
            </Text>
            <Feather name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>

          {showDropdown && !isGenerating && (
            <View style={styles.dropdown}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setCategory(cat.id);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>Number of Cards to Generate</Text>
          <View style={styles.cardCountContainer}>
            {[5, 10, 15, 20, 25].map((count) => (
              <TouchableOpacity
                key={count}
                style={[
                  styles.cardCountButton,
                  cardCount === count && styles.cardCountButtonActive,
                  isGenerating && styles.cardCountButtonDisabled
                ]}
                onPress={() => !isGenerating && setCardCount(count)}
                disabled={isGenerating}
              >
                <Text style={[
                  styles.cardCountText, 
                  cardCount === count && styles.cardCountTextActive,
                  isGenerating && styles.cardCountTextDisabled
                ]}>{count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.generateButton, (isGenerating || !prompt.trim() || !category) && styles.generateButtonDisabled]} 
          onPress={handleGenerate}
          disabled={isGenerating || !prompt.trim() || !category}
        >
          <Text style={styles.generateButtonText}>
            {isGenerating ? "Generating..." : "Generate Flashcards"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Loading Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={isGenerating}
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#4A86E8" />
            <Text style={styles.modalText}>Generating flashcards...</Text>
            <Text style={styles.modalSubtext}>This may take a few moments</Text>
          </View>
        </View>
      </Modal>
    </>
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
    backgroundColor: "#F0F2F5",
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
    minHeight: 120,
  },
  promptTip: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
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
  cardCountButtonDisabled: {
    opacity: 0.5,
  },
  cardCountText: {
    color: "#666",
  },
  cardCountTextActive: {
    color: 'white',
  },
  cardCountTextDisabled: {
    opacity: 0.5,
  },
  generateButton: {
    backgroundColor: '#4A86E8',
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.7,
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E1E3E6',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: 'white',
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E3E6',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  modalSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default GeneratePrompt;
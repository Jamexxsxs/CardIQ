"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"

const GeneratePrompt: React.FC = () => {
  const navigation = useNavigation()
  const [prompt, setPrompt] = useState("")
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [cardCount, setCardCount] = useState(15)

  const handleGenerate = () => {
    // Implement generate functionality
    console.log("Generating flashcards:", { prompt, title, category, cardCount })
    navigation.goBack()
  }

  return (
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
        />

        <Text style={styles.promptTip}>
          Example: "Create flashcards about the solar system, including facts about each planet."
        </Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Solar System Facts"
          value={title}
          onChangeText={setTitle}
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
              <Text style={[styles.cardCountText, cardCount === count && styles.cardCountTextActive]}>{count}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.generateButton} onPress={handleGenerate}>
        <Text style={styles.generateButtonText}>Generate</Text>
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
  cardCountText: {
    color: "#666",
  },
  cardCountTextActive: {
    color: 'white',
  },
  generateButton: {
    backgroundColor: '#4A86E8',
    margin: 16,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  generateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GeneratePrompt;

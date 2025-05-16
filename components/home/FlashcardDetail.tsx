// FlashcardDetail.jsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FlashcardDetail {
  id: string;
  title: string;
  category: string;
  cardCount: number;
  description: string;
}

const flashcardDetails: Record<string, FlashcardDetail> = {
  "1": {
    id: "1",
    title: "Arithmetic",
    category: "MATHEMATICS",
    cardCount: 15,
    description: "Arithmetic is a branch of mathematics that consists of the study of numbers, especially the properties of the traditional operations on them—addition, subtraction, multiplication, division, exponentiation, and extraction of roots.",
  },
  "2": {
    id: "2",
    title: "Algebra",
    category: "MATHEMATICS",
    cardCount: 25,
    description: "Algebra is a branch of mathematics that deals with symbols and the rules for manipulating them.",
  },
  "3": {
    id: "3",
    title: "Geometry",
    category: "MATHEMATICS",
    cardCount: 25,
    description: "Geometry is a branch of mathematics that studies the sizes, shapes, positions, and dimensions of things.",
  },
  "4": {
    id: "4",
    title: "Calculus",
    category: "MATHEMATICS",
    cardCount: 15,
    description: "Calculus is the mathematical study of continuous change, in the same way that geometry is the study of shape and algebra is the study of generalizations of arithmetic operations.",
  },
  "5": {
    id: "5",
    title: "Countries",
    category: "GEOGRAPHY",
    cardCount: 20,
    description: "Learn about different countries around the world, their locations, capitals, and key facts.",
  },
  "6": {
    id: "6",
    title: "Capitals",
    category: "GEOGRAPHY",
    cardCount: 18,
    description: "Study the capital cities of countries around the world.",
  },
  "7": {
    id: "7",
    title: "World War II",
    category: "HISTORY",
    cardCount: 30,
    description: "Learn about the major events, figures, and impacts of World War II (1939-1945).",
  },
  "8": {
    id: "8",
    title: "Ancient Egypt",
    category: "HISTORY",
    cardCount: 22,
    description: "Explore the civilization, culture, and achievements of Ancient Egypt.",
  },
  "9": {
    id: "9",
    title: "Mechanics",
    category: "PHYSICS",
    cardCount: 25,
    description: "Study the branch of physics concerned with the motion of objects and their response to forces.",
  },
  "10": {
    id: "10",
    title: "Thermodynamics",
    category: "PHYSICS",
    cardCount: 20,
    description: "Learn about the branch of physics that deals with heat, work, and temperature, and their relation to energy and entropy.",
  },
};

// Related flashcards mapping
const relatedFlashcards = {
  "1": ["3", "2"], // Arithmetic related to Geometry and Algebra
  "2": ["1", "3"], // Algebra related to Arithmetic and Geometry
  "3": ["2", "1"], // Geometry related to Algebra and Arithmetic
  "4": ["2", "3"], // Calculus related to Algebra and Geometry
  "5": ["6"], // Countries related to Capitals
  "6": ["5"], // Capitals related to Countries
  "7": ["8"], // World War II related to Ancient Egypt (for simplicity)
  "8": ["7"], // Ancient Egypt related to World War II (for simplicity)
  "9": ["10"], // Mechanics related to Thermodynamics
  "10": ["9"], // Thermodynamics related to Mechanics
};

const FlashcardDetail = ({ route, navigation }) => {
  const { id } = route.params;
  
  const flashcard = flashcardDetails[id];
  const related = relatedFlashcards[id] || [];

  if (!flashcard) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Flashcard not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton}>
          <Feather name="more-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{flashcard.title}</Text>
        <Text style={styles.category}>{flashcard.cardCount} Cards · {flashcard.category}</Text>
        <Text style={styles.description}>{flashcard.description}</Text>

        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related</Text>
          <View style={styles.relatedCards}>
            {related.map(relatedId => (
              <TouchableOpacity 
                key={relatedId}
                style={styles.relatedCard}
                onPress={() => navigation.replace('FlashcardDetail', { id: relatedId })}
              >
                <Text style={styles.relatedCardTitle}>
                  {flashcardDetails[relatedId]?.title || "Related Card"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>START</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F09E54',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 24,
    marginBottom: 40,
  },
  relatedSection: {
    marginTop: 'auto',
    marginBottom: 24,
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  relatedCards: {
    flexDirection: 'row',
    gap: 12,
  },
  relatedCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: 120,
    height: 80,
    justifyContent: 'center',
  },
  relatedCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F09E54',
  },
  startButton: {
    backgroundColor: '#578FCA',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default FlashcardDetail;
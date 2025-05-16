// CategoryContent.jsx
import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Flashcard {
  id: string;
  title: string;
  cardCount: number;
  duration: string;
  progress: number;
}

const flashcards: Record<string, Flashcard[]> = {
  "1": [
    {
      id: "1",
      title: "Arithmetic",
      cardCount: 15,
      duration: "10min",
      progress: 25,
    },
    {
      id: "2",
      title: "Algebra",
      cardCount: 25,
      duration: "15min",
      progress: 50,
    },
    {
      id: "3",
      title: "Geometry",
      cardCount: 25,
      duration: "15min",
      progress: 50,
    },
    {
      id: "4",
      title: "Calculus",
      cardCount: 15,
      duration: "10min",
      progress: 25,
    },
  ],
  "2": [
    {
      id: "5",
      title: "Countries",
      cardCount: 20,
      duration: "12min",
      progress: 30,
    },
    {
      id: "6",
      title: "Capitals",
      cardCount: 18,
      duration: "10min",
      progress: 40,
    },
  ],
  "3": [
    {
      id: "7",
      title: "World War II",
      cardCount: 30,
      duration: "20min",
      progress: 15,
    },
    {
      id: "8",
      title: "Ancient Egypt",
      cardCount: 22,
      duration: "15min",
      progress: 60,
    },
  ],
  "4": [
    {
      id: "9",
      title: "Mechanics",
      cardCount: 25,
      duration: "18min",
      progress: 35,
    },
    {
      id: "10",
      title: "Thermodynamics",
      cardCount: 20,
      duration: "15min",
      progress: 45,
    },
  ],
};

// Map of category titles
const categoryTitles = {
  "1": "Mathematics",
  "2": "Geography",
  "3": "History",
  "4": "Physics",
};

const CategoryContent = ({ route, navigation }) => {
  const { id, title } = route.params;
  
  const categoryFlashcards = flashcards[id] || [];
  const categoryTitle = title || categoryTitles[id] || "Category";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{categoryTitle}</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
            <Feather name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today</Text>
          <View style={styles.cardsGrid}>
            {categoryFlashcards.slice(0, 2).map((flashcard) => (
              <TouchableOpacity
                key={flashcard.id}
                style={styles.flashcardCard}
                onPress={() => navigation.navigate('FlashcardDetail', { id: flashcard.id })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.cardIcon}>√x</Text>
                  </View>
                  <TouchableOpacity>
                    <Feather name="more-vertical" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardTitle}>{flashcard.title}</Text>
                <Text style={styles.cardSubtitle}>...</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardCount}>{flashcard.cardCount} Cards</Text>
                  <Text style={styles.cardDuration}>{flashcard.duration}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${flashcard.progress}%` }]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yesterday</Text>
          <View style={styles.cardsGrid}>
            {categoryFlashcards.slice(2).map((flashcard) => (
              <TouchableOpacity
                key={flashcard.id}
                style={styles.flashcardCard}
                onPress={() => navigation.navigate('FlashcardDetail', { id: flashcard.id })}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.cardIcon}>√x</Text>
                  </View>
                  <TouchableOpacity>
                    <Feather name="more-vertical" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.cardTitle}>{flashcard.title}</Text>
                <Text style={styles.cardSubtitle}>...</Text>
                <View style={styles.cardFooter}>
                  <Text style={styles.cardCount}>{flashcard.cardCount} Cards</Text>
                  <Text style={styles.cardDuration}>{flashcard.duration}</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { width: `${flashcard.progress}%` }]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  flashcardCard: {
    width: '47%',
    backgroundColor: '#F09E54',
    borderRadius: 16,
    padding: 16,
    minHeight: 160,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  cardTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: 'white',
    opacity: 0.8,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardCount: {
    color: 'white',
    fontSize: 12,
  },
  cardDuration: {
    color: 'white',
    fontSize: 12,
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
  },
});

export default CategoryContent;
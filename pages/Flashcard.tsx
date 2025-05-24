"use client"

import type React from "react"
import { useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import FlashcardModal from "../components/flashcard/FlashcardModal"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { useCallback } from "react"

export interface FlashcardItem {
  id: string
  question: string
  answer: string
}

export interface FlashcardSet {
  [key: string]: FlashcardItem[]
}

// Sample flashcard data
const flashcards: FlashcardSet = {
  "biology-1": [
    {
      id: "b1",
      question: "What are the characteristics of mammals?",
      answer:
        "Mammals are characterized by the presence of hair or fur, mammary glands, three middle ear bones, and a neocortex region in the brain.",
    },
    {
      id: "b2",
      question: "What is the difference between warm-blooded and cold-blooded animals?",
      answer:
        "Warm-blooded animals (endotherms) can maintain a constant body temperature regardless of environmental conditions, while cold-blooded animals (ectotherms) rely on external heat sources to regulate their body temperature.",
    },
    {
      id: "b3",
      question: "What is the process of photosynthesis?",
      answer:
        "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with carbon dioxide and water, generating oxygen as a byproduct.",
    },
  ],
  "math-1": [
    {
      id: "m1",
      question: "What is the quadratic formula?",
      answer: "For a quadratic equation ax² + bx + c = 0, the solutions are given by x = (-b ± √(b² - 4ac)) / 2a",
    },
    {
      id: "m2",
      question: "What is the Pythagorean theorem?",
      answer:
        "In a right triangle, the square of the length of the hypotenuse equals the sum of the squares of the lengths of the other two sides: a² + b² = c²",
    },
    {
      id: "m3",
      question: "What is a logarithm?",
      answer:
        "A logarithm is the power to which a number must be raised to get another number. For example, the logarithm of 100 to the base 10 is 2, because 10² = 100.",
    },
  ],
}

const Flashcard: React.FC = () => {
  const [flashcardModalVisible, setFlashcardModalVisible] = useState(false)
  const navigation = useNavigation()

  // Use useFocusEffect to show modal every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      // Small delay to ensure component is fully focused
      const timer = setTimeout(() => {
        setFlashcardModalVisible(true)
      }, 100)

      return () => clearTimeout(timer)
    }, []),
  )

  const handleSelectOption = (type: "generate" | "import") => {
    setFlashcardModalVisible(false)

    // Small delay to ensure modal is closed before navigation
    setTimeout(() => {
      if (type === "generate") {
        navigation.navigate("GeneratePrompt" as never)
      } else if (type === "import") {
        navigation.navigate("ImportFile" as never)
      }
    }, 300)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create New Flashcard</Text>
      <View style={styles.content}>
        <Text>Flashcard creation form will go here</Text>
      </View>

      <FlashcardModal
        visible={flashcardModalVisible}
        onClose={() => setFlashcardModalVisible(false)}
        onSelectOption={handleSelectOption}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})

export default Flashcard

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

  const handleCloseModal = () => {
    setFlashcardModalVisible(false)

    // Navigate back to home screen when modal is closed without selection
    setTimeout(() => {
      navigation.navigate("HomeStack" as never)
    }, 300)
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create New Flashcard</Text>
      <View style={styles.content}>
      </View>

      <FlashcardModal visible={flashcardModalVisible} onClose={handleCloseModal} onSelectOption={handleSelectOption} />
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

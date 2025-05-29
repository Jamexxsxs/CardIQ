"use client"

import { useContext, useEffect, useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Feather, AntDesign } from "@expo/vector-icons"
import { useCardTable } from "../../hooks/useCardTable"
import { useCategoryTable } from "../../hooks/useCategoryTable"
import { useTopicTable } from "../../hooks/useTopicTable"
import { AuthContext } from "../../App"

const { width } = Dimensions.get("window")

// Define types for feedback data
interface FeedbackItem {
  message: string
  isCorrect: boolean | null
  userAnswer: string
  timestamp: string
}

interface FeedbackData {
  [cardIndex: string]: FeedbackItem
}

const CardFlow = ({ route, navigation }) => {
  const { topicId, topicTitle, categoryId } = route.params
  const { userId } = useContext(AuthContext)
  const { cards, loading, fetchCardsByTopic } = useCardTable(userId)
  const { getSpecificCategory } = useCategoryTable(userId)
  const { getSpecificTopic } = useTopicTable(userId)

  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState("")
  const [showAnswer, setShowAnswer] = useState(false)
  const [startTime] = useState(new Date())
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set())
  const [category, setCategory] = useState<any>(null)
  const [topic, setTopic] = useState<any>(null)
  // Track if the answer has been revealed for the current card
  const [revealedCards, setRevealedCards] = useState<Set<number>>(new Set())
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null)
  // Store feedback data for each card
  const [cardFeedbackData, setCardFeedbackData] = useState<FeedbackData>({})

  // Animation values
  const [flipAnimation] = useState(new Animated.Value(0))
  const [isFlipping, setIsFlipping] = useState(false)

  // Storage keys
  const getStorageKey = (key: string) => `cardflow_${topicId}_${key}`

  // Load data from AsyncStorage
  const loadStoredData = async () => {
    try {
      const storedRevealedCards = await AsyncStorage.getItem(getStorageKey("revealedCards"))
      const storedFeedbackData = await AsyncStorage.getItem(getStorageKey("feedbackData"))
      const storedCurrentIndex = await AsyncStorage.getItem(getStorageKey("currentIndex"))
      const storedCompletedCards = await AsyncStorage.getItem(getStorageKey("completedCards"))

      if (storedRevealedCards) {
        setRevealedCards(new Set(JSON.parse(storedRevealedCards)))
      }

      if (storedFeedbackData) {
        setCardFeedbackData(JSON.parse(storedFeedbackData))
      }

      if (storedCurrentIndex) {
        setCurrentCardIndex(Number.parseInt(storedCurrentIndex))
      }

      if (storedCompletedCards) {
        setCompletedCards(new Set(JSON.parse(storedCompletedCards)))
      }
    } catch (error) {
      console.error("Error loading stored data:", error)
    }
  }

  // Save data to AsyncStorage
  const saveToStorage = async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(getStorageKey(key), JSON.stringify(data))
    } catch (error) {
      console.error("Error saving to storage:", error)
    }
  }

  // Clear all stored data for this topic
  const clearStoredData = async () => {
    try {
      await AsyncStorage.multiRemove([
        getStorageKey("revealedCards"),
        getStorageKey("feedbackData"),
        getStorageKey("currentIndex"),
        getStorageKey("completedCards"),
      ])
    } catch (error) {
      console.error("Error clearing stored data:", error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      await fetchCardsByTopic(Number.parseInt(topicId))

      // Get topic data to find category
      const topicData = await getSpecificTopic(Number.parseInt(topicId))
      setTopic(topicData)

      if (topicData) {
        // Get category data for color
        const categoryData = await getSpecificCategory(topicData.category_id)
        setCategory(categoryData)
      }

      // Load stored data after cards are loaded
      await loadStoredData()
    }

    loadData()
  }, [topicId])

  // Update feedback message when card changes
  useEffect(() => {
    const currentCardFeedback = cardFeedbackData[currentCardIndex]
    if (currentCardFeedback) {
      setFeedbackMessage(currentCardFeedback.message)
      setIsAnswerCorrect(currentCardFeedback.isCorrect)
    } else {
      setFeedbackMessage("")
      setIsAnswerCorrect(null)
    }
  }, [currentCardIndex, cardFeedbackData])

  useEffect(() => {
    saveToStorage("currentIndex", currentCardIndex)
  }, [currentCardIndex])

  const currentCard = cards[currentCardIndex]
  const totalCards = cards.length
  const progressPercentage = totalCards > 0 ? ((currentCardIndex + 1) / totalCards) * 100 : 0

  const isCurrentCardRevealed = revealedCards.has(currentCardIndex)

  const getEstimatedTime = () => {
    if (!totalCards) return "0min"
    return `${Math.ceil(totalCards * 0.5)}min`
  }

  const generateFeedbackMessage = () => {
    if (!userAnswer.trim()) {
      return {
        message: "You can do it next time! 💪",
        isCorrect: null,
      }
    }

    const userAnswerLower = userAnswer.toLowerCase().trim()
    const correctAnswerLower = currentCard.answer.toLowerCase().trim()

    // Check if answers match (you can make this more sophisticated)
    const isCorrect =
      userAnswerLower === correctAnswerLower ||
      correctAnswerLower.includes(userAnswerLower) ||
      userAnswerLower.includes(correctAnswerLower)

    let message
    if (isCorrect) {
      const correctMessages = [
        "Excellent work! You nailed it! 🎉",
        "Perfect! You're on fire! 🔥",
        "Outstanding! Keep it up! ⭐",
        "Brilliant! You got it right! 💡",
        "Amazing! You're doing great! 🚀",
      ]
      message = correctMessages[Math.floor(Math.random() * correctMessages.length)]
    } else {
      const encouragingMessages = [
        "Close one! You're learning! 📚",
        "Good effort! Keep practicing! 💪",
        "Nice try! You'll get it next time! 🎯",
        "Don't worry, learning takes time! 🌱",
        "Keep going! You're improving! 📈",
      ]
      message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
    }

    return {
      message,
      isCorrect,
    }
  }

  const flipCard = () => {
    if (isFlipping) return

    setIsFlipping(true)

    Animated.timing(flipAnimation, {
      toValue: showAnswer ? 0 : 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setShowAnswer(!showAnswer)
      setIsFlipping(false)

      if (!showAnswer) {
        const newCompletedCards = new Set([...completedCards, currentCardIndex])
        const newRevealedCards = new Set([...revealedCards, currentCardIndex])

        setCompletedCards(newCompletedCards)
        setRevealedCards(newRevealedCards)

        // Save to storage
        saveToStorage("completedCards", Array.from(newCompletedCards))
        saveToStorage("revealedCards", Array.from(newRevealedCards))

        // Generate feedback message only if it hasn't been generated yet for this card
        if (!cardFeedbackData[currentCardIndex]) {
          const feedback = generateFeedbackMessage()
          const newFeedbackData = {
            ...cardFeedbackData,
            [currentCardIndex]: {
              message: feedback.message,
              isCorrect: feedback.isCorrect,
              userAnswer: userAnswer,
              timestamp: new Date().toISOString(),
            },
          }

          setCardFeedbackData(newFeedbackData)
          setFeedbackMessage(feedback.message)
          setIsAnswerCorrect(feedback.isCorrect)

          saveToStorage("feedbackData", newFeedbackData)
        }
      }
    })
  }

  
  const handleRevealOrNext = () => {
    if (!isCurrentCardRevealed) {
      flipCard()
    } else {
      handleNext()
    }
  }

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex((prev) => prev + 1)
      setUserAnswer("")
      setShowAnswer(false)
      flipAnimation.setValue(0)
    } else {
      navigation.navigate("CompleteCard", {
        topicId,
        topicTitle,
        categoryId,
        feedbackData: cardFeedbackData,
        totalCards,
        completedCards: Array.from(completedCards),
        revealedCards: Array.from(revealedCards),
      })
    }
  }

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex((prev) => prev - 1)
      setUserAnswer("")
      setShowAnswer(false)
      flipAnimation.setValue(0)
    }
  }

  const renderProgressBar = () => {
    const categoryColor = category?.color || "#F09E54"

    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${progressPercentage}%`,
                backgroundColor: categoryColor,
              },
            ]}
          />
        </View>
      </View>
    )
  }

  // Front side of the card (question)
  const frontInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  })

  // Back side of the card (answer)
  const backInterpolate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  })

  if (loading || !currentCard) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading flashcards...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const categoryColor = category?.color || "#F09E54"

  const flashcardBase = {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 20,
    padding: 30,
    justifyContent: "center",
    alignItems: "center",
    backfaceVisibility: "hidden",
    ...(!isFlipping && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    }),
  }

  const cardFrontStyles = {
    ...flashcardBase,
    backgroundColor: "#fff",
  }

  const cardBackStyles = {
    ...flashcardBase,
    backgroundColor: categoryColor,
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={async () => {
                // Clear stored data when going back
                await clearStoredData()
                navigation.goBack()
              }}
            >
              <Feather name="arrow-left" size={20} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">{topicTitle}</Text>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Your Progress</Text>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressText, { color: categoryColor }]}>
                {currentCardIndex + 1} out of {totalCards} Cards
              </Text>
              <Text style={styles.timeText}>{getEstimatedTime()}</Text>
            </View>
            {renderProgressBar()}
          </View>

          {/* Flashcard with flip animation */}
          <View style={styles.cardContainer}>
            <TouchableOpacity style={styles.cardTouchable} onPress={flipCard} disabled={isFlipping}>
              {/* Front side (Question) */}
              <Animated.View style={[cardFrontStyles, { transform: [{ rotateY: frontInterpolate }] }]}>
                <Text style={styles.questionText}>{currentCard.question}</Text>
                <Text style={styles.tapHint}>Tap to reveal answer</Text>
              </Animated.View>

              {/* Back side (Answer) */}
              <Animated.View
                style={[
                  cardBackStyles,
                  {
                    transform: [{ rotateY: backInterpolate }],
                  },
                ]}
              >
                <Text style={styles.answerText}>{currentCard.answer}</Text>
                <Text style={styles.tapHint}>Tap to show question</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Input Section - Only show if the card hasn't been revealed yet */}
          <View style={styles.inputSection}>
            {!isCurrentCardRevealed && (
              <TextInput
                style={styles.answerInput}
                placeholder="Type your answer..."
                placeholderTextColor="#999"
                value={userAnswer}
                onChangeText={setUserAnswer}
              />
            )}
             {isCurrentCardRevealed && (
              <TouchableOpacity style={styles.revealButton} onPress={flipCard}>
                <AntDesign name="heart" size={20} color={showAnswer ? categoryColor : "#999"} />
                <Text style={[styles.revealText, { color: showAnswer ? categoryColor : "#999" }]}>
                  {showAnswer ? "Show Question" : "Reveal"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Feedback Section */}
          {feedbackMessage && isCurrentCardRevealed && (
            <View style={styles.feedbackSection}>
              <View
                style={[
                  styles.feedbackContainer,
                  {
                    backgroundColor:
                      isAnswerCorrect === true ? "#E8F5E8" : isAnswerCorrect === false ? "#FFF0F0" : "#F0F8FF",
                    borderLeftColor:
                      isAnswerCorrect === true ? "#4CAF50" : isAnswerCorrect === false ? "#F44336" : "#5B9BD5",
                  },
                ]}
              >
                
                <View style={styles.feedbackContent}>
                  <View style={styles.feedbackHeader}>
                    {isAnswerCorrect === true && <Feather name="check-circle" size={20} color="#4CAF50" />}
                    {isAnswerCorrect === false && <Feather name="x-circle" size={20} color="#F44336" />}
                    {isAnswerCorrect === null && <Feather name="info" size={20} color="#5B9BD5" />}
                    <Text
                      style={[
                        styles.feedbackText,
                        {
                          color: isAnswerCorrect === true ? "#2E7D32" : isAnswerCorrect === false ? "#C62828" : "#333",
                        },
                      ]}
                    >
                      {feedbackMessage}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Navigation Buttons */}
            <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton, { opacity: currentCardIndex === 0 ? 0.5 : 1 }]}
              onPress={handlePrevious}
              disabled={currentCardIndex === 0}
            >
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={handleRevealOrNext}>
              <Text style={styles.nextButtonText}>
                {!isCurrentCardRevealed ? "Reveal" : currentCardIndex === totalCards - 1 ? "Finish" : "Next"}
              </Text>
              {isCurrentCardRevealed && currentCardIndex < totalCards - 1 && (
                <Feather name="arrow-right" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
    width: 300,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressLabel: {
    fontSize: 14,
    color: "#999",
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressText: {
    fontSize: 18,
    fontWeight: "600",
  },
  timeText: {
    fontSize: 14,
    color: "#999",
  },
  progressBarContainer: {
    marginBottom: 16,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  cardContainer: {
    height: 300,
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -30,
    marginBottom: 5,
  },
  cardTouchable: {
    height: 250,
  },
  questionText: {
    fontSize: 24,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 20,
  },
  answerText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 20,
  },
  tapHint: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    fontStyle: "italic",
  },
  inputSection: {
    paddingHorizontal: 20,
    marginTop: -90,
  },
  answerInput: {
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  revealButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginTop: -10,
    marginBottom: 8,
  },
  revealText: {
    fontSize: 16,
    fontWeight: "500",
  },
  navigationButtons: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 12,
  },
  navButton: {
    borderRadius: 12,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 56,
  },
  prevButton: {
    backgroundColor: "#E57373",
    width: 80,
  },
  nextButton: {
    backgroundColor: "#5B9BD5",
    flex: 1,
    flexDirection: "row",
    gap: 8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  feedbackSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  feedbackContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8FF",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#5B9BD5",
  },
  logoContainer: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  logoImage: {
    width: 24,
    height: 24,
  },
  feedbackContent: {
    flex: 1,
  },
  feedbackHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  feedbackText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
})

export default CardFlow

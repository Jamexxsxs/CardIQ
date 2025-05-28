"use client"

import { useContext, useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { Feather } from "@expo/vector-icons"
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

interface QuestionData {
  cardIndex: number
  question: string
  answer: string
  userAnswer: string
  feedback: string
}

interface QuestionGroups {
  correct: QuestionData[]
  incorrect: QuestionData[]
  noAnswer: QuestionData[]
}

interface RouteParams {
  topicId: string
  topicTitle: string
  categoryId: string
  feedbackData: FeedbackData
  totalCards: number
  completedCards: number[]
  revealedCards: number[]
}

const CompleteCard = ({ route, navigation }) => {
  const { topicId, topicTitle, categoryId, feedbackData, totalCards, completedCards, revealedCards } =
    route.params as RouteParams
  const { userId } = useContext(AuthContext)
  const { cards, loading, fetchCardsByTopic } = useCardTable(userId)
  const { getSpecificCategory } = useCategoryTable(userId)
  const { getSpecificTopic } = useTopicTable(userId)

  const [category, setCategory] = useState<any>(null)
  const [topic, setTopic] = useState<any>(null)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})

  // Storage keys
  const getStorageKey = (key: string) => `cardflow_${topicId}_${key}`

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
    }

    loadData()
  }, [topicId])

  // Calculate performance statistics
  const calculateStats = () => {
    let correct = 0
    let incorrect = 0
    let noAnswer = 0

    Object.values(feedbackData || {}).forEach((feedback: FeedbackItem) => {
      if (feedback.isCorrect === true) {
        correct++
      } else if (feedback.isCorrect === false) {
        incorrect++
      } else {
        noAnswer++
      }
    })

    return { correct, incorrect, noAnswer, total: correct + incorrect + noAnswer }
  }

  // Group questions by result type
  const groupQuestionsByResult = (): QuestionGroups => {
    const groups: QuestionGroups = {
      correct: [],
      incorrect: [],
      noAnswer: [],
    }

    Object.entries(feedbackData || {}).forEach(([cardIndex, feedback]: [string, FeedbackItem]) => {
      const card = cards[Number.parseInt(cardIndex)]
      if (card) {
        const questionData: QuestionData = {
          cardIndex: Number.parseInt(cardIndex),
          question: card.question,
          answer: card.answer,
          userAnswer: feedback.userAnswer,
          feedback: feedback.message,
        }

        if (feedback.isCorrect === true) {
          groups.correct.push(questionData)
        } else if (feedback.isCorrect === false) {
          groups.incorrect.push(questionData)
        } else {
          groups.noAnswer.push(questionData)
        }
      }
    })

    return groups
  }

  const stats = calculateStats()
  const questionGroups = groupQuestionsByResult()
  const categoryColor = category?.color || "#F09E54"

  const handlePlayAgain = async () => {
    // Clear stored data and navigate back to CardFlow
    await clearStoredData()
    navigation.navigate("CardFlow", {
      topicId,
      topicTitle,
      categoryId,
    })
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const renderQuestionItem = (questionData: QuestionData, color: string) => (
    <View key={questionData.cardIndex} style={styles.questionItem}>
      <View style={[styles.questionIndicator, { backgroundColor: color }]} />
      <View style={styles.questionContent}>
        <Text style={styles.questionText}>{questionData.question}</Text>
        <Text style={styles.answerText}>Answer: {questionData.answer}</Text>
        {questionData.userAnswer && <Text style={styles.userAnswerText}>Your answer: {questionData.userAnswer}</Text>}
      </View>
    </View>
  )

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        
        <View style={styles.celebrationSection}>
          <Text style={styles.celebrationTitle}>Way to go!</Text>
          <Text style={styles.celebrationTitle}>You're on a roll! 🎉</Text>
        </View>

        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>How you're doing</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressLabel}>Score</Text>
              <Text style={styles.progressScore}>
                {stats.correct} out of {stats.total}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: stats.total > 0 ? `${(stats.correct / stats.total) * 100}%` : "0%",
                      backgroundColor: "#4DC591",
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Performance Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Performance Stats</Text>
          <View style={styles.statsContainer}>
      
            <View style={[styles.statCard, styles.correctCard]}>
              <Text style={styles.statNumber}>{stats.correct}</Text>
              <Text style={styles.statLabel}>Correct</Text>
                <View style={styles.decorativeShape}>
                </View>
            </View>
          
            <View style={[styles.statCard, styles.incorrectCard]}>
              <Text style={styles.statNumber}>{stats.incorrect}</Text>
              <Text style={styles.statLabel}>Incorrect</Text>
                <View style={styles.decorativeShape}>
                </View>
            </View>

            <View style={[styles.statCard, styles.skipCard]}>
              <Text style={styles.statNumber}> {questionGroups.noAnswer.length} </Text>
              <Text style={styles.statLabel}>Skipped</Text>
                <View style={styles.decorativeShape}>
                </View>
            </View>
          
          </View>
        </View>


        {/* Play Again Button */}
        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={handlePlayAgain}
        >
          <Text style={styles.playAgainText}>Play Again</Text>
        </TouchableOpacity>

        {/* Review Questions */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Review Questions</Text>

          {/* Correct Questions */}
          {questionGroups.correct.length > 0 && (
            <View style={styles.reviewGroup}>
              <TouchableOpacity style={styles.reviewHeader} onPress={() => toggleSection("correct")}>
                <View style={styles.reviewHeaderContent}>
                  <View style={[styles.reviewIndicator, { backgroundColor: "#4CAF50" }]} />
                  <Text style={styles.reviewTitle}>{questionGroups.correct.length} Correct Questions</Text>
                </View>
                <Feather name={expandedSections.correct ? "chevron-up" : "chevron-down"} size={20} color="#666" />
              </TouchableOpacity>
              {expandedSections.correct && (
                <View style={styles.reviewContent}>
                  {questionGroups.correct.map((question) => renderQuestionItem(question, "#4CAF50"))}
                </View>
              )}
            </View>
          )}

          {/* Incorrect Questions */}
          {questionGroups.incorrect.length > 0 && (
            <View style={styles.reviewGroup}>
              <TouchableOpacity style={styles.reviewHeader} onPress={() => toggleSection("incorrect")}>
                <View style={styles.reviewHeaderContent}>
                  <View style={[styles.reviewIndicator, { backgroundColor: "#F44336" }]} />
                  <Text style={styles.reviewTitle}>{questionGroups.incorrect.length} Incorrect Questions</Text>
                </View>
                <Feather name={expandedSections.incorrect ? "chevron-up" : "chevron-down"} size={20} color="#666" />
              </TouchableOpacity>
              {expandedSections.incorrect && (
                <View style={styles.reviewContent}>
                  {questionGroups.incorrect.map((question) => renderQuestionItem(question, "#F44336"))}
                </View>
              )}
            </View>
          )}

          {/* No Answer Questions */}
          {questionGroups.noAnswer.length > 0 && (
            <View style={styles.reviewGroup}>
              <TouchableOpacity style={styles.reviewHeader} onPress={() => toggleSection("noAnswer")}>
                <View style={styles.reviewHeaderContent}>
                  <View style={[styles.reviewIndicator, { backgroundColor: "#FF9800" }]} />
                  <Text style={styles.reviewTitle}>{questionGroups.noAnswer.length} Skipped Questions</Text>
                </View>
                <Feather name={expandedSections.noAnswer ? "chevron-up" : "chevron-down"} size={20} color="#666" />
              </TouchableOpacity>
              {expandedSections.noAnswer && (
                <View style={styles.reviewContent}>
                  {questionGroups.noAnswer.map((question) => renderQuestionItem(question, "#FF9800"))}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
    marginTop: 20,
  },
  celebrationSection: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  celebrationTitle: {
    fontSize: 30,
    fontWeight: "medium",
    color: "#578FCA",
  },
  celebrationSubtitle: {
    fontSize: 18,
    color: "#666",
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  
  progressCard: {
    backgroundColor: "#BAE9D5",
    borderRadius: 15,
    padding: 20,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 16,
    color: "#4DC591",
    fontWeight: "500",
  },
  progressScore: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4DC591",
  },
  progressBarContainer: {
    marginBottom: 4,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: "rgba(77, 197, 145, 0.3)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    overflow: 'hidden'
  },
  correctCard: {
    backgroundColor: "#4DC591",
  },
  incorrectCard: {
    backgroundColor: "#CB5355",
  },
  skipCard: {
    backgroundColor: "#F09E54",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
  },
  playAgainButton: {
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#578FCA"
  },
  playAgainText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewSection: {
    paddingHorizontal: 20,
  },
  reviewGroup: {
    marginBottom: 15,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    overflow: "hidden",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  reviewHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 12,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  reviewContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  questionItem: {
    flexDirection: "row",
    marginBottom: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
  },
  questionIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  questionContent: {
    flex: 1,
  },
  questionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 4,
  },
  answerText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  userAnswerText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
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
  decorativeShape: {
    position: "absolute",
    right: -25,
    top: -30,
    width: 70,
    height: 70,
    borderRadius: 50,
    backgroundColor: "#000000",
    opacity: 0.2,
    zIndex: -9999,
  }
})

export default CompleteCard

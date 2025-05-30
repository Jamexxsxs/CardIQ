"use client"

import type React from "react"
import { useContext, useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useTopicTable } from "../../hooks/useTopicTable"
import { AuthContext } from "../../App"
import { useNavigation } from "@react-navigation/native"

interface Activity {
  id: string | number
  subject: string
  chapter: string
  cardCount: number
  date: string
  color: string
}

// Function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

interface ActivityCardProps {
  activity: Activity
  onPress?: () => void
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
  onDelete: (id: string | number) => void
}


const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress, openMenuId, setOpenMenuId, onDelete }) => {
  const isMenuOpen = openMenuId === activity.id.toString()

  const handleDeletePress = () => {
    Alert.alert("Delete Flashcard", `Are you sure you want to delete "${activity.chapter}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          onDelete(activity.id)
          setOpenMenuId(null)
        },
      },
    ])
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: activity.color }]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.subject}>{activity.subject}</Text>
           <TouchableOpacity
            style={styles.menuButton}
            onPress={(e) => {
              e.stopPropagation()
              setOpenMenuId(isMenuOpen ? null : activity.id.toString())
            }}
          >
            <Feather name="more-vertical" size={20} color="#fff" />
          </TouchableOpacity>

                    {isMenuOpen && (
            <View style={styles.menuContainer}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeletePress}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.decorativeShape} />
        </View>
        <Text style={styles.chapter}>{activity.chapter}</Text>
        <View style={styles.footer}>
          <Text style={styles.cardCount}>{activity.cardCount} Cards</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.date}>{activity.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

interface RecentlyAddedSectionProps {
  refreshKey?: number
}

const RecentlyAddedSection: React.FC<RecentlyAddedSectionProps> = ({ refreshKey }) => {
  const navigation = useNavigation()
  const { userId } = useContext(AuthContext)
  const { getRecentlyAdded, deleteTopic} = useTopicTable(userId)
  const [recentlyAdded, setRecentlyAdded] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  
  const fetchRecentlyAdded = async () => {
    try {
      setLoading(true)
      const activities = await getRecentlyAdded()

      console.log("Recently added:", activities)

      // Map database results to Activity interface
      const mappedActivities: Activity[] = activities.map((item) => ({
        id: item.id || Math.random().toString(),
        subject: item.category_name || "Uncategorized",
        chapter: item.title || "No title",
        cardCount: item.card_count || 0,
        date: formatDate(item.added_datetime),
        color: item.color || "#8F98FF",
      }))

      setRecentlyAdded(mappedActivities)
    } catch (error) {
      console.error("Error fetching recently added:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log("RecentlyAddedSection rendering with userId:", userId, "refreshKey:", refreshKey)
    fetchRecentlyAdded()
  }, [refreshKey])

  const handleDeleteTopic = async (id: string | number) => {
    try {
      await deleteTopic(Number(id))
      await fetchRecentlyAdded()
    } catch (error) {
      console.error("Error deleting topic:", error)
    }
  }

  if (recentlyAdded.length === 0) {
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recently added flashcards found</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.activitiesContainer}>
        {recentlyAdded.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onPress={() => navigation.navigate("FlashcardDetail", { id: activity.id })}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
            onDelete={handleDeleteTopic}
          />
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333333",
  },
  activitiesContainer: {
    gap: 16,
  },
  container: {
    borderRadius: 16,
    overflow: "hidden",
  },
  content: {
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  subject: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  menuButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  chapter: {
    fontSize: 16,
    color: "white",
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardCount: {
    fontSize: 14,
    color: "white",
  },
  separator: {
    color: "white",
    marginHorizontal: 8,
  },
  date: {
    fontSize: 14,
    color: "white",
  },
  decorativeShape: {
    position: "absolute",
    right: -25,
    top: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#000000",
    opacity: 0.5,
  },
  loadingContainer: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
  },
  emptyText: {
    color: "#666",
    fontSize: 16,
  },
  menuContainer: {
    position: "absolute",
    top: 20,
    right: 8,
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  deleteButton: {
    backgroundColor: "#E53935",
    paddingVertical: 9,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
})

export default RecentlyAddedSection

"use client"

import type React from "react"
import { useContext, useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTopicTable } from "../../hooks/useTopicTable"
import { AuthContext } from "../../App"
import { useNavigation } from "@react-navigation/native"

export interface Activity {
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
    <TouchableOpacity style={[styles.activityCard, { backgroundColor: activity.color }]} onPress={onPress}>
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.subjectTitle}>{activity.subject}</Text>
          <Text style={styles.chapterTitle}>{activity.chapter}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardCount}>{activity.cardCount} Cards</Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.date}>{activity.date}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={(e) => {
            e.stopPropagation()
            setOpenMenuId(isMenuOpen ? null : activity.id.toString())
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="white" />
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
    </TouchableOpacity>
  )
}

interface RecentActivitySectionProps {
  refreshKey?: number
}

const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({ refreshKey }) => {
  const navigation = useNavigation()
  const { userId } = useContext(AuthContext)
  const { getRecentActivity, deleteTopic, refresh } = useTopicTable(userId)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setLoading(true)
        const activities = await getRecentActivity()

        console.log(activities)

        const mappedActivities: Activity[] = activities.map((item) => ({
          id: item.id || Math.random().toString(),
          subject: item.category_name || "Uncategorized",
          chapter: item.title || "No title",
          cardCount: item.card_count || 0,
          date: formatDate(item.activity_datetime),
          color: item.color || "#8F98FF",
        }))

        setRecentActivities(mappedActivities)
      } catch (error) {
        console.error("Error fetching recent activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentActivities()
  }, [userId, refreshKey])

  const handleDeleteTopic = async (id: string | number) => {
    try {
      await deleteTopic(Number(id))
      const activities = await getRecentActivity()
      const mappedActivities: Activity[] = activities.map((item) => ({
        id: item.id || Math.random().toString(),
        subject: item.category_name || "Uncategorized",
        chapter: item.title || "No title",
        cardCount: item.card_count || 0,
        date: formatDate(item.activity_datetime),
        color: item.color || "#8F98FF",
      }))
      setRecentActivities(mappedActivities)
    } catch (error) {
      console.error("Error deleting topic:", error)
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8F98FF" />
        </View>
      </View>
    )
  }

  if (recentActivities.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recent activities found</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activitiesContainer}>
        {recentActivities.map((activity) => (
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
  container: {
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
  activityCard: {
    borderRadius: 16,
    padding: 16,
    overflow: "hidden",
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subjectTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 4,
  },
  chapterTitle: {
    color: "white",
    fontSize: 16,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardCount: {
    color: "white",
    fontSize: 14,
  },
  separator: {
    color: "white",
    marginHorizontal: 8,
  },
  date: {
    color: "white",
    fontSize: 14,
  },
  menuButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
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
    top: 14,
    right: 5,
    backgroundColor: "transparent",
    padding: 8,
    borderRadius: 8,
    zIndex: 10,
  },
  deleteButton: {
    backgroundColor: "#E53935",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  deleteButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
  },
})

export default RecentActivitySection

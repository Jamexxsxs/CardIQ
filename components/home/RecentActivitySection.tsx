import React, { act, useContext, useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTopicTable } from "../../hooks/useTopicTable" 
import { AuthContext } from "../../App";


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
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

interface ActivityCardProps {
  activity: Activity
  onPress?: () => void
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress }) => {
  return (
    <TouchableOpacity 
      style={[styles.activityCard, { backgroundColor: activity.color }]}
      onPress={onPress}
    >
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
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="white" />
        </TouchableOpacity>
        <View style={styles.decorativeShape} />
      </View>
    </TouchableOpacity>
  )
}

const RecentActivitySection: React.FC = () => {
  const { userId } = useContext(AuthContext);
  const { getRecentActivity, refresh } = useTopicTable(userId)
  const [recentActivities, setRecentActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        setLoading(true);
        const activities = await getRecentActivity();

        console.log(activities)

        // Map database results to Activity interface
        const mappedActivities: Activity[] = activities.map(item => ({
          id: item.id || Math.random().toString(),
          subject: item.category_name || "Uncategorized",
          chapter: item.title || "No title",
          cardCount: item.card_count || 0,
          date: formatDate(item.added_datetime), 
          color: item.color || "#8F98FF"
        }));

        setRecentActivities(mappedActivities);
      } catch (error) {
        console.error("Error fetching recent activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivities();
  }, [userId]);


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
            onPress={() => console.log(`Activity ${activity.id} pressed`)}
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
    position: 'absolute',
    right: -25,
    top: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000000',
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
  }
})

export default RecentActivitySection
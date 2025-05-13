import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
export interface Activity {
  id: string
  subject: string
  chapter: string
  cardCount: number
  date: string
  color: string
}

// Sample recent activities data
const recentActivities: Activity[] = [
  {
    id: "1",
    subject: "Biology",
    chapter: "Chapter 3: Animal Kingdom",
    cardCount: 15,
    date: "Friday, March 28 2025",
    color: "#4DC591",
  },
  {
    id: "2",
    subject: "Mathematics",
    chapter: "Algebra",
    cardCount: 15,
    date: "Friday, March 28 2025",
    color: "#F09E54",
  },
  {
    id: "3",
    subject: "Geography",
    chapter: "Chapter 1",
    cardCount: 15,
    date: "Friday, March 28 2025",
    color: "#8F98FF",
  },
]

interface ActivityCardProps {
  activity: Activity
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  return (
    <TouchableOpacity style={[styles.activityCard, { backgroundColor: activity.color }]}>
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
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <View style={styles.activitiesContainer}>
        {recentActivities.map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
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
})

export default RecentActivitySection

"use client"

import { useContext, useState, useCallback, useEffect } from "react"
import { StyleSheet, View, Text, Image, TouchableOpacity, ScrollView, Alert, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import StatsCard from "../components/profile/StatsCard"
import RecentlyAddedSection from "../components/profile/RecentlyAddedCard"
import { AuthContext } from "../App"
import { resetDatabase } from "../utils/dbUtils"
import { useTopicTable } from "../hooks/useTopicTable"
import { useCategoryTable } from "../hooks/useCategoryTable"
import { useUserTable } from "../hooks/useUserTable"

const Profile = () => {
  const { logout, currentUser } = useContext(AuthContext)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const {
    getCurrentStreak,
    getTotalTopicCount,
    getReviewedThisWeekCount
  } = useTopicTable(currentUser?.id)  
  const { getTotalCategoryCount } = useCategoryTable(currentUser?.id)
  const { updateUserStreak } = useUserTable()
  const [currentStreak, setCurrentStreak] = useState(0)
  const [totalTopics, setTotalTopics] = useState(0)
  const [reviewedThisWeek, setReviewedThisWeek] = useState(0)
  const [totalCategories, setTotalCategories] = useState(0)


  const onRefresh = useCallback(() => {
    const refreshData = async () => {
      setRefreshing(true)
      setRefreshKey((prev) => prev + 1)
      await Promise.all([fetchStreak(), fetchStats()])
      setRefreshing(false)
    }
    refreshData()
  }, [])

  const fetchStreak = async () => {
    const streak = await getCurrentStreak();
    setCurrentStreak(streak);

    if (currentUser && streak > (currentUser.long_streak || 0)) {
      const updated = await updateUserStreak(currentUser.id, streak);
      if (updated) {
        currentUser.long_streak = streak;
        setRefreshKey((prev) => prev + 1);
      }
    }
  };

  const fetchStats = async () => {
    const [total, reviewed, categories] = await Promise.all([
      getTotalTopicCount(),
      getReviewedThisWeekCount(),
      getTotalCategoryCount()
    ])
    setTotalTopics(total)
    setReviewedThisWeek(reviewed)
    setTotalCategories(categories)
  }

  useEffect(() => {
    fetchStreak()
    fetchStats()
  }, [refreshKey])

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          console.log("User logged out")
          logout()
        },
        style: "destructive",
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image source={require("../assets/logo.png")} style={styles.profileImage} />
          </View>
          <Text style={styles.username}>{currentUser?.username || "User"}</Text>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              Alert.alert(
                "Reset Database",
                "Are you sure you want to reset the database? This action cannot be undone.",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Reset",
                    style: "destructive",
                    onPress: async () => {
                      await resetDatabase()
                      Alert.alert("Database has been reset.")
                    },
                  },
                ],
              )
            }}
          >
            <Feather name="trash-2" size={20} color="#FF3B30" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Progress and Stats</Text>

          <View style={styles.streakCard}>
            <View style={styles.streakInfo}>
              <Feather name="info" size={24} color="#FF6B00" style={styles.streakIcon} />
              <View>
                <Text style={styles.streakTitle}>Current Streak</Text>
                <Text style={styles.streakSubtitle}>Don't Break it!</Text>
              </View>
            </View>
            <Text style={styles.streakDays}>
              <Text style={styles.streakNumber}>{currentStreak}</Text> days
            </Text>
          </View>

          <View style={styles.statsRow}>
            <StatsCard
              title="No. of Categories"
              value={totalCategories.toString()}
              backgroundColor="#ECF3FF"
              textColor="#4A86E8"
            />            
            <StatsCard 
              title="No. of Topics"
              value={totalTopics.toString()} 
              backgroundColor="#ECF3FF" 
              textColor="#4A86E8" 
            />
          </View>

          <View style={styles.statsRow}>
            <StatsCard
              title="Topics Reviewed"
              value={reviewedThisWeek.toString()}
              subtitle="this week"
              backgroundColor="#ECF3FF"
              textColor="#4A86E8"
            />
            <StatsCard
              title="Longest Streak"
              value={currentUser?.long_streak}
              subtitle="days"
              backgroundColor="#ECF3FF"
              textColor="#4A86E8"
            />
          </View>
        </View>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recently Added</Text>
          <View style={styles.recentlyAddedContainer}>
            <RecentlyAddedSection refreshKey={refreshKey} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    position: "relative",
  },
  profileImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#4A86E8",
    marginRight: 16,
  },
  profileImage: {
    width: 56,
    height: 56,
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  streakCard: {
    backgroundColor: "#FFF5EB",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  streakInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakIcon: {
    marginRight: 12,
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  streakSubtitle: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  streakDays: {
    fontSize: 16,
    color: "#666",
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B00",
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  recentlyAddedContainer: {
    gap: 16,
  },
})

export default Profile
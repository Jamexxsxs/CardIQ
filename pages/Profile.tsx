import type React from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Share2, LogOut, Flame } from "lucide-react-native"
import { useNavigation } from "@react-navigation/native"
import type { NativeStackNavigationProp } from "@react-navigation/native-stack"
import StatsCard from "../components/profile/StatsCard"
import RecentlyAddedCard from "../components/profile/RecentlyAddedCard"

type RootStackParamList = {
  Welcome: undefined
}

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>

const recentlyAdded = [
  {
    id: "1",
    subject: "Biology",
    chapter: "Chapter 3: Animal Kingdom",
    cardCount: 15,
    date: "Friday, March 28 2025",
    color: "#27AE60",
  },
  {
    id: "2",
    subject: "Mathematics",
    chapter: "Algebra",
    cardCount: 15,
    date: "Friday, March 28 2025",
    color: "#F5A623",
  },
  {
    id: "3",
    subject: "Biology",
    chapter: "Chapter 4: Plant Kingdom",
    cardCount: 12,
    date: "Thursday, March 27 2025",
    color: "#9B59B6",
  },
]

const Profile: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>()

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          // Here you would clear any auth tokens or user data
          // For example: await AsyncStorage.removeItem('userToken');

          // Navigate to Welcome screen
          navigation.reset({
            index: 0,
            routes: [{ name: "Welcome" }],
          })
        },
        style: "destructive",
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{
                uri: "https://images.pexels.com/photos/19003599/pexels-photo-19003599/free-photo-of-the-cardiq-logo-with-a-cute-brain-and-flashcards.png",
              }}
              style={styles.profileImage}
            />
          </View>
          <Text style={styles.username}>Yushi Coquilla</Text>
          <TouchableOpacity style={styles.iconButton} onPress={() => {}}>
            <Share2 size={20} color="#4A86E8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
            <LogOut size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Progress and Stats</Text>

          <View style={styles.streakCard}>
            <View style={styles.streakInfo}>
              <Flame size={24} color="#FF6B00" style={styles.streakIcon} />
              <View>
                <Text style={styles.streakTitle}>Current Streak</Text>
                <Text style={styles.streakSubtitle}>Don't Break it!</Text>
              </View>
            </View>
            <Text style={styles.streakDays}>
              <Text style={styles.streakNumber}>5</Text> days
            </Text>
          </View>

          <View style={styles.statsRow}>
            <StatsCard title="Cards Reviewed" value="555" backgroundColor="#ECF3FF" textColor="#4A86E8" />
            <StatsCard title="Cards Mastered" value="555" backgroundColor="#E6F8EF" textColor="#27AE60" />
          </View>

          <View style={styles.statsRow}>
            <StatsCard
              title="Study Time"
              value="3.5 h"
              subtitle="this week"
              backgroundColor="#ECF3FF"
              textColor="#4A86E8"
            />
            <StatsCard
              title="Longest Streak"
              value="555"
              subtitle="days"
              backgroundColor="#E6F8EF"
              textColor="#27AE60"
            />
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Recently Added</Text>
          <View style={styles.recentlyAddedContainer}>
            {recentlyAdded.map((activity) => (
              <RecentlyAddedCard key={activity.id} activity={activity} />
            ))}
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

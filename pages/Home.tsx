import React from "react"
import { StyleSheet, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Import components
import Header from "../components/Header"
import CategorySection from "../components/home/CategorySection"
import RecentActivitySection from "../components/home/RecentActivitySection"

const Home: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header username="Yushi" />
        <CategorySection />
        <RecentActivitySection />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
})

export default Home

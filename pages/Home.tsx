import React from "react"
import { StyleSheet, ScrollView, RefreshControl } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// Import components
import Header from "../components/Header"
import CategorySection from "../components/home/CategorySection"
import RecentActivitySection from "../components/home/RecentActivitySection"

const Home = ({ navigation }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [refreshKey, setRefreshKey] = React.useState(0);

  const onRefresh = React.useCallback(() => {
    const refreshData = async () => {
      setRefreshing(true);
      setRefreshKey(prev => prev + 1);  
      setRefreshing(false);
    };
    refreshData();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Header username="Yushi" />
        <CategorySection navigation={navigation} />
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

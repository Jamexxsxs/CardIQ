
import React from "react"
import { View, Text, StyleSheet, Image, ActivityIndicator } from "react-native"

interface HeaderProps {
  username: string
  loading?: boolean 
}

const Header: React.FC<HeaderProps> = ({ username, loading = false }) => {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#333333" />
          <Text style={styles.welcomeText}>Loading...</Text>
        </View>
      ) : (
        <Text style={styles.welcomeText}>Welcome back, {username}</Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#66E0D0",
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#333333",
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
})

export default Header
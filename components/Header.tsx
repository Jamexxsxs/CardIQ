import React from "react"
import { View, Text, StyleSheet, Image } from "react-native"

interface HeaderProps {
  username: string
}

const Header: React.FC<HeaderProps> = ({ username }) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: "https://via.placeholder.com/50x50/66E0D0/FFFFFF?text=S" }} style={styles.logo} />
      <Text style={styles.welcomeText}>Welcome back, {username}</Text>
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
})

export default Header

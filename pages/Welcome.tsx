"use client"

import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"

type AuthStackParamList = {
  Welcome: undefined
  Login: undefined
  SignUp: undefined
  Onboarding: { userId: number }
}

type WelcomeScreenNavigationProp = StackNavigationProp<AuthStackParamList, "Welcome">

const Welcome = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>()

  const handleSignUp = () => {
    navigation.navigate("SignUp")
  }

  const handleLogin = () => {
    navigation.navigate("Login")
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image source={require("../assets/logo.png")} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Text Section */}
        <View style={styles.textSection}>
          <Text style={styles.tagline}>Read . Study . Excel</Text>
          <Text style={styles.subtitle}>Make Study Time Awesome!</Text>
        </View>

        {/* Buttons Section */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Already have an account?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    flex: 2,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    width: 280,
    height: 280,
    marginBottom: 20,
  },
  textSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  tagline: {
    fontSize: 24,
    fontWeight: "600",
    color: "#4A86E8",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#333333",
    textAlign: "center",
    fontWeight: "500",
  },
  buttonSection: {
    width: "100%",
    gap: 16,
  },
  signUpButton: {
    backgroundColor: "#4A86E8",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  signUpButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#4A86E8",
    borderRadius: 25,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default Welcome

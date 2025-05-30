"use client"

import { useState, useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Feather } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import type { StackNavigationProp } from "@react-navigation/stack"
import { AuthContext } from "../App"
import { useUserTable } from "../hooks/useUserTable"
import { validateEmail, validatePassword, validateName } from "../utils/authValidation"
import PasswordStrengthIndicator from "../components/auth/PasswordStrength"

type AuthStackParamList = {
  Welcome: undefined
  Login: undefined
  SignUp: undefined
  Onboarding: { userId: number }
}

type SignUpScreenNavigationProp = StackNavigationProp<AuthStackParamList, "SignUp">

const SignUp = () => {
  const { addUser } = useUserTable()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Validation states
  const [nameError, setNameError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [showPasswordStrength, setShowPasswordStrength] = useState(false)

  const navigation = useNavigation<SignUpScreenNavigationProp>()
  const { login } = useContext(AuthContext)

  // Real-time validation
  const nameValidation = validateName(name)
  const emailValidation = validateEmail(email)
  const passwordValidation = validatePassword(password)

  const handleNameChange = (text: string) => {
    setName(text)
    if (text && !validateName(text).isValid) {
      setNameError(validateName(text).message)
    } else {
      setNameError("")
    }
  }

  const handleEmailChange = (text: string) => {
    setEmail(text)
    if (text && !validateEmail(text).isValid) {
      setEmailError(validateEmail(text).message)
    } else {
      setEmailError("")
    }
  }

  const handlePasswordChange = (text: string) => {
    setPassword(text)
    setShowPasswordStrength(text.length > 0)
  }

  const handleSignUp = async () => {
    const nameVal = validateName(name)
    const emailVal = validateEmail(email)
    const passwordVal = validatePassword(password)

    if (!nameVal.isValid) {
      Alert.alert("Invalid Name", nameVal.message)
      return
    }

    if (!emailVal.isValid) {
      Alert.alert("Invalid Email", emailVal.message)
      return
    }

    if (!passwordVal.isValid) {
      Alert.alert(
        "Weak Password",
        `Please ensure your password meets all requirements:\n• ${passwordVal.errors.join("\n• ")}`
      )
      return
    }

    try {
      setIsLoading(true)

      const result = await addUser(name, email, password)

      if (result.success) {
        if (rememberMe) {
          await login(result.userId, true)
        }
        navigation.navigate("Onboarding", { userId: result.userId })
      } else {
        // Handle specific error codes (like unique constraint)
        if (result.error.includes("UNIQUE")) {
          Alert.alert("Account Exists", "A user with that email already exists.")
        } else {
          Alert.alert("Sign Up Failed", result.error)
        }
      }
    } catch (error) {
      Alert.alert("Sign Up Failed", "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const isFormValid = nameValidation.isValid && emailValidation.isValid && passwordValidation.isValid

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardAvoidView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />

            <Text style={styles.title}>Create an account</Text>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, nameError && styles.inputError]}
                placeholder="Steve Brown"
                placeholderTextColor="#999"
                value={name}
                onChangeText={handleNameChange}
                editable={!isLoading}
              />
              <Feather
                name="user"
                size={20}
                color={name && nameValidation.isValid ? "#34C759" : nameError ? "#FF3B30" : "#999"}
                style={styles.inputIcon}
              />
            </View>
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="steve.brown@gmail.com"
                placeholderTextColor="#999"
                value={email}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
              <Feather
                name="mail"
                size={20}
                color={email && emailValidation.isValid ? "#34C759" : emailError ? "#FF3B30" : "#999"}
                style={styles.inputIcon}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Create a strong password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  color={password && passwordValidation.isValid ? "#34C759" : "#999"}
                  style={styles.inputIcon}
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength Indicator */}
            {showPasswordStrength && <PasswordStrengthIndicator password={password} validation={passwordValidation} />}

            <TouchableOpacity
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              disabled={isLoading}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Feather name="check" size={14} color="#FFFFFF" />}
              </View>
              <Text style={styles.rememberMeText}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.signupButton, (!isFormValid || isLoading) && styles.signupButtonDisabled]}
              onPress={handleSignUp}
              disabled={!isFormValid || isLoading}
            >
              <Text style={styles.signupButtonText}>{isLoading ? "Creating account..." : "Sign up"}</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")} disabled={isLoading}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logo: {
    width: 180,
    height: 180,
    borderRadius: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4A86E8",
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "transparent",
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    borderColor: "#FF3B30",
  },
  inputIcon: {
    marginLeft: 8,
  },
  errorText: {
    color: "#FF3B30",
    fontSize: 12,
    alignSelf: "flex-start",
    marginBottom: 16,
    marginLeft: 4,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#4A86E8",
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4A86E8",
  },
  rememberMeText: {
    fontSize: 14,
    color: "#666",
  },
  signupButton: {
    backgroundColor: "#4A86E8",
    borderRadius: 12,
    height: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  signupButtonDisabled: {
    opacity: 0.5,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    marginTop: 16,
  },
  loginText: {
    fontSize: 14,
    color: "#666",
  },
  loginLink: {
    fontSize: 14,
    color: "#4A86E8",
    fontWeight: "600",
  },
})

export default SignUp

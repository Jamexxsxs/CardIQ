// import type React from "react"
// import { View, Text, Image, StyleSheet, TouchableOpacity, SafeAreaView } from "react-native"
// import { useNavigation } from "@react-navigation/native"
// import type { NativeStackNavigationProp } from "@react-navigation/native-stack"

// type RootStackParamList = {
//   Home: undefined
//   SignUp: undefined
//   Login: undefined
// }

// type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>

// const Welcome: React.FC = () => {
//   const navigation = useNavigation<WelcomeScreenNavigationProp>()

//   return (
//     <SafeAreaView style={styles.container}>
//       <View style={styles.content}>
//         <Image source={require("../assets/cardiq-logo.png")} style={styles.logo} />

//         <Text style={styles.tagline}>Read . Study . Excel</Text>
//         <Text style={styles.subtitle}>Make Study Time Awesome!</Text>
//       </View>

//       <View style={styles.buttonContainer}>
//         <TouchableOpacity style={styles.signUpButton} onPress={() => navigation.navigate("SignUp")}>
//           <Text style={styles.buttonText}>Sign Up</Text>
//         </TouchableOpacity>

//         <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate("Login")}>
//           <Text style={styles.buttonText}>Already have an account?</Text>
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   )
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   content: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 20,
//   },
//   logo: {
//     width: 180,
//     height: 180,
//     resizeMode: "contain",
//     marginBottom: 20,
//   },
//   tagline: {
//     fontSize: 24,
//     color: "#4A86E8",
//     fontWeight: "500",
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 18,
//     color: "#333333",
//     marginBottom: 40,
//   },
//   buttonContainer: {
//     paddingHorizontal: 20,
//     paddingBottom: 40,
//   },
//   signUpButton: {
//     backgroundColor: "#4A86E8",
//     borderRadius: 25,
//     height: 50,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   loginButton: {
//     backgroundColor: "#4A86E8",
//     borderRadius: 25,
//     height: 50,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   buttonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "500",
//   },
// })

// export default Welcome

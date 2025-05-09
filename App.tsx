import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"

// Import pages
import Home from "./pages/Home"
import Flashcard from "./pages/Flashcard"
import Profile from "./pages/Profile"

type RootTabParamList = {
  Home: undefined
  Flashcard: undefined
  Profile: undefined
}

const Tab = createBottomTabNavigator<RootTabParamList>()

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = "help-outline"

              if (route.name === "Home") {
                iconName = focused ? "home" : "home-outline"
              } else if (route.name === "Flashcard") {
                iconName = focused ? "add-circle" : "add-circle-outline"
              } else if (route.name === "Profile") {
                iconName = focused ? "person" : "person-outline"
              }

              return <Ionicons name={iconName} size={size} color={color} />
            },
            tabBarActiveTintColor: "#4A86E8",
            tabBarInactiveTintColor: "gray",
            headerShown: false,
          })}
        >
          <Tab.Screen name="Home" component={Home} />
          <Tab.Screen
            name="Flashcard"
            component={Flashcard}
            options={{
              tabBarLabel: "Flashcard",
              tabBarIcon: ({ color, size }) => (
                <Ionicons
                  name="add"
                  size={size}
                  color="white"
                  style={{
                    backgroundColor: "#4A86E8",
                    borderRadius: 8,
                    padding: 5,
                  }}
                />
              ),
            }}
          />
          <Tab.Screen name="Profile" component={Profile} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

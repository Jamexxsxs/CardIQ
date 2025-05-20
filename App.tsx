// App.tsx
import React, { useState, useContext, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';

import Home from "./pages/Home";
import Flashcard from "./pages/Flashcard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import CategoryContent from "./components/home/CategoryContent";
import FlashcardDetail from "./components/home/FlashcardDetail";
import FlashcardModal from "./components/flashcard/FlashcardModal";

type RootTabParamList = {
  HomeStack: undefined;
  Flashcard: undefined;
  Profile: undefined;
};

type HomeStackParamList = {
  Home: undefined;
  CategoryContent: { id: string; title: string };
  FlashcardDetail: { id: string };
};

type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const RootStack = createStackNavigator<{ Main: undefined; Auth: undefined }>();

// Home stack navigator
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={Home} />
      <HomeStack.Screen name="CategoryContent" component={CategoryContent} />
      <HomeStack.Screen name="FlashcardDetail" component={FlashcardDetail} />
    </HomeStack.Navigator>
  );
}

// Auth stack navigator
function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="SignUp" component={SignUp} />
    </AuthStack.Navigator>
  );
}

// Main tab navigator
function MainTabNavigator() {
  const [flashcardModalVisible, setFlashcardModalVisible] = useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "help-outline";

            if (route.name === "HomeStack") {
              iconName = focused ? "home" : "home-outline";
            } else if (route.name === "Flashcard") {
              iconName = focused ? "add-circle" : "add-circle-outline";
            } else if (route.name === "Profile") {
              iconName = focused ? "person" : "person-outline";
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "#4A86E8",
          tabBarInactiveTintColor: "gray",
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="HomeStack"
          component={HomeStackScreen}
          options={{ tabBarLabel: "Home" }}
        />
        <Tab.Screen
          name="Flashcard"
          component={Flashcard}
          options={{
            tabBarLabel: "Flashcard",
            tabBarIcon: ({ size }) => (
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
          listeners={{
            tabPress: (e) => {
              // Prevent default action
              e.preventDefault();
              // Show modal instead
              setFlashcardModalVisible(true);
            },
          }}
        />
        <Tab.Screen name="Profile" component={Profile} />
      </Tab.Navigator>

      {/* Flashcard Modal */}
      <FlashcardModal
        visible={flashcardModalVisible}
        onClose={() => setFlashcardModalVisible(false)}
      />
    </>
  );
}

interface AuthContextType {
  isLoggedIn: boolean;
  userId: number | null;
  login: (userId: number, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType>({
  isLoggedIn: false,
  userId: null,
  login: async () => {},
  logout: async () => {},
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(Number(storedUserId));
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error('Failed to load user ID:', err);
      }
    };

    loadUserData();
  }, []);

  const authContext = {
    isLoggedIn,
    userId,
    login: async (id: number, remember: boolean = true) => {
      setUserId(id);
      setIsLoggedIn(true);
      if (remember) {
        await AsyncStorage.setItem('userId', id.toString());
      }
    },
    logout: async () => {
      setUserId(null);
      setIsLoggedIn(false);
      await AsyncStorage.removeItem('userId');
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthContext.Provider value={authContext}>
        <NavigationContainer>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
              <RootStack.Screen name="Main" component={MainTabNavigator} />
            ) : (
              <RootStack.Screen name="Auth" component={AuthStackScreen} />
            )}
          </RootStack.Navigator>
        </NavigationContainer>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
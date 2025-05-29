"use client"

// App.tsx
import React, { useState, useContext, createContext, useEffect } from 'react';
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserTable } from './hooks/useUserTable'; 

import Home from "./pages/Home";
import Flashcard from "./pages/Flashcard";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Onboarding from "./pages/Onboarding";
import CategoryContent from "./components/home/CategoryContent";
import FlashcardDetail from "./components/home/FlashcardDetail";
import GeneratePrompt from "./components/flashcard/GeneratePrompt"
import ImportFile from "./components/flashcard/ImportFile"
import CardFlow from './components/home/CardFlow';
import CompleteCard from './components/home/CompleteCard';

type RootTabParamList = {
  HomeStack: undefined;
  FlashcardStack: undefined;
  Profile: undefined;
};

type HomeStackParamList = {
  Home: undefined;
  CategoryContent: { id: string; title: string };
  FlashcardDetail: { id: any };
  Flashcard: undefined;
  GeneratePrompt: undefined;
  CardFlow: { topicId: string; topicTitle: string };
  CompleteCard: {topicId: string; topicTitle: string};
};

type FlashcardStackParamList = {
  Flashcard: undefined
  GeneratePrompt: undefined
  FlashcardDetail: { id: any };
  CardFlow: { topicId: string; topicTitle: string };
  ImportFile: undefined
  CompleteCard: {topicId: string; topicTitle: string};
}

type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Onboarding: { userId: number };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const FlashcardStack = createStackNavigator<FlashcardStackParamList>()
const AuthStack = createStackNavigator<AuthStackParamList>();
const RootStack = createStackNavigator<{ Main: undefined; Auth: undefined }>();

// Home stack navigator
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={Home} />
      <HomeStack.Screen name="CategoryContent" component={CategoryContent} />
      <HomeStack.Screen name="Flashcard" component={Flashcard} />
      <HomeStack.Screen name="GeneratePrompt" component={GeneratePrompt} />
      <HomeStack.Screen name="FlashcardDetail" component={FlashcardDetail} />
      <HomeStack.Screen name="CardFlow" component={CardFlow} />
      <HomeStack.Screen name="CompleteCard" component={CompleteCard} />
    </HomeStack.Navigator>
  );
}

// Flashcard stack navigator
function FlashcardStackScreen() {
  return (
    <FlashcardStack.Navigator screenOptions={{ headerShown: false }}>
      <FlashcardStack.Screen name="Flashcard" component={Flashcard} />
      <FlashcardStack.Screen name="GeneratePrompt" component={GeneratePrompt} />
      <FlashcardStack.Screen name="CardFlow" component={CardFlow} />
      <FlashcardStack.Screen name="FlashcardDetail" component={FlashcardDetail} />
      <FlashcardStack.Screen name="ImportFile" component={ImportFile} />
      <FlashcardStack.Screen name="CompleteCard" component={CompleteCard} />
    </FlashcardStack.Navigator>
  )
}

// Auth stack navigator
function AuthStackScreen() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="SignUp" component={SignUp} />
      <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
    </AuthStack.Navigator>
  );
}

// Onboarding screen wrapper
function OnboardingScreen({ route }: { route: { params: { userId: number } } }) {
  const { login } = useContext(AuthContext);
  
  const handleOnboardingComplete = async () => {
    await login(route.params.userId, true);
  };

  return <Onboarding onComplete={handleOnboardingComplete} />;
}

// Main tab navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = "help-outline";

          if (route.name === "HomeStack") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "FlashcardStack") {
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
        name="FlashcardStack"
        component={FlashcardStackScreen}
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
      />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>

  );
}
interface AuthContextType {
  isLoggedIn: boolean;
  userId: number | null;
  currentUser: any | null;
  login: (userId: number, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  navigateToOnboarding: (userId: number) => void;
  refreshUserData: () => Promise<void>; 
}

export const AuthContext = React.createContext<AuthContextType>({
  isLoggedIn: false,
  userId: null,
  currentUser: null, 
  login: async () => {},
  logout: async () => {},
  navigateToOnboarding: () => {},
  refreshUserData: async () => {}, 
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [navigationRef, setNavigationRef] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const { getUserById } = useUserTable(); 

 const fetchUserData = async (id: number) => {
    try {
      const userData = await getUserById(id);
      setCurrentUser(userData);
      console.log('user datea', userData)
    } catch (err) {
      console.error('Failed to fetch user data:', err);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          const id = Number(storedUserId);
          setUserId(id);
          setIsLoggedIn(true);
          await fetchUserData(id); 
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
    currentUser, // Add this
    login: async (id: number, remember: boolean = true) => {
      setUserId(id);
      setIsLoggedIn(true);
      await fetchUserData(id); // Add this line
      if (remember) {
        await AsyncStorage.setItem('userId', id.toString());
      }
    },
    logout: async () => {
      setUserId(null);
      setCurrentUser(null); // Add this line
      setIsLoggedIn(false);
      await AsyncStorage.removeItem('userId');
    },
    navigateToOnboarding: (id: number) => {
      if (navigationRef) {
        navigationRef.navigate('Onboarding', { userId: id });
      }
    },
    refreshUserData: async () => { // Add this function
      if (userId) {
        await fetchUserData(userId);
      }
    },
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthContext.Provider value={authContext}>
        <NavigationContainer ref={setNavigationRef}>
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
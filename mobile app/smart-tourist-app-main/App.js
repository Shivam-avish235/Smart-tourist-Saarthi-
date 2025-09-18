import "react-native-gesture-handler";
import React, { useState, useEffect, useMemo, createContext } from "react";
import { ActivityIndicator, View, Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import HomeScreen from "./screens/HomeScreen";
import ExploreScreen from "./screens/ExploreScreen";
import ProfileScreen from "./screens/ProfileScreen";
import LoginScreen from "./screens/LoginScreen";
import MapScreen from "./screens/MapScreen";
import RegistrationScreen from "./screens/RegistrationScreen";
import EmergencyScreen from "./screens/EmergencyScreen";
import { apiRequest } from "./services/api";

export const AuthContext = createContext(null);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2E86C1",
        tabBarInactiveTintColor: "gray",
        tabBarIcon: ({ color, size }) => {
          let iconName = "home-outline";
          if (route.name === "Home") iconName = "home-outline";
          else if (route.name === "Explore") iconName = "compass-outline";
          else if (route.name === "Emergency") iconName = "alert-circle-outline";
          else if (route.name === "Map") iconName = "map-outline";
          else if (route.name === "Profile") iconName = "person-circle-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="Emergency" component={EmergencyScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registration" component={RegistrationScreen} />
    </Stack.Navigator>
  );
}

function Splash() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("user_token");
        if (token) {
          setUserToken(token);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const authContext = useMemo(() => ({
    signIn: async (email, password) => {
      try {
        const response = await apiRequest('/auth/login', 'POST', { email, password });
        if (response.success && response.data.token) {
          const token = response.data.token;
          await AsyncStorage.setItem("user_token", token);
          setUserToken(token);
          return true;
        }
        return false;
      } catch (error) {
        Alert.alert("Login Failed", error.message || "Please check your credentials.");
        return false;
      }
    },
    signUp: async (userData) => {
      try {
        const response = await apiRequest('/auth/register', 'POST', userData);
        if (response.success && response.data.token) {
          const token = response.data.token;
          await AsyncStorage.setItem("user_token", token);
          setUserToken(token);
          return true;
        }
        return false;
      } catch (error) {
         Alert.alert("Registration Failed", error.message || "Could not create account.");
        return false;
      }
    },
    signOut: async () => {
      await AsyncStorage.removeItem("user_token");
      setUserToken(null);
    },
    userToken,
  }), [userToken]);

  if (isLoading) {
    return <Splash />;
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        {userToken ? <MainTabs /> : <AuthStack />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

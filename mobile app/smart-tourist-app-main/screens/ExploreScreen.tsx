import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import theme from "../theme";

const touristSpots = [
  { id: "1", name: "Himalayas", info: "Safe Trekking Zone", icon: "triangle-outline" },
  { id: "2", name: "Goa", info: "Beach Safety Alerts", icon: "umbrella-outline" },
  { id: "3", name: "Jaipur", info: "Heritage City Guide", icon: "business-outline" },
  { id: "4", name: "Kaziranga", info: "Wildlife & Safety Info", icon: "leaf-outline" },
];

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌍 Explore Destinations</Text>

      <FlatList
        data={touristSpots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 150, type: "timing", duration: 500 }}
          >
            <TouchableOpacity
              style={styles.cardWrapper}
              activeOpacity={Platform.OS === "ios" ? 0.7 : 1}
            >
              <LinearGradient
                colors={["#ffffff", "#f1f8ff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={item.icon as any} size={32} color={theme.colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.spot}>{item.name}</Text>
                  <Text style={styles.info}>{item.info}</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={theme.colors.subtext} />
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 18,
    color: theme.colors.text,
  },
  cardWrapper: {
    marginBottom: 14,
    borderRadius: theme.radius.large,
    overflow: "hidden", // ensures ripple/gradient stays rounded
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: theme.radius.large,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#eef6ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  spot: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },
  info: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginTop: 2,
  },
});

import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card}>
            <Ionicons name={item.icon as any} size={32} color={theme.colors.accent} />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.spot}>{item.name}</Text>
              <Text style={styles.info}>{item.info}</Text>
            </View>
          </TouchableOpacity>
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: theme.colors.text,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.card,
    padding: 16,
    borderRadius: theme.radius.large,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  spot: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
  },
  info: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
});

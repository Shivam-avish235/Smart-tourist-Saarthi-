import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { apiRequest } from "../services/api";

const theme = {
  colors: {
    backgroundGradient: { start: "#4361EE", end: "#4895EF" },
    danger: "#F72F5F",
    success: "#0E954E",
    accent: "#4895EF",
    text: "#FFFFFF",
    textSecondary: "#E5E7EB",
  },
};

export default function HomeScreen() {
  const [userName, setUserName] = useState("Tourist");
  const [modalContent, setModalContent] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiRequest("/auth/profile");
        if (response.success) {
          setUserName(response.data.personalInfo.firstName);
        }
      } catch (error) {
        console.log("Failed to fetch user profile:", error.message);
      }
    };
    fetchProfile();
  }, []);

  // Helper to get current location
  const getCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required!");
      return null;
    }
    const loc = await Location.getCurrentPositionAsync({});
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  };

  // SOS / Panic button
  const handleSOS = async () => {
    try {
      const loc = await getCurrentLocation();
      if (!loc) return;

      const response = await apiRequest("/emergency/panic", "POST", {
        reason: "Panic button pressed",
        location: { type: "Point", coordinates: [loc.longitude, loc.latitude] },
      });

      if (response.success) {
        setModalContent({
          emoji: "🚨",
          title: "Emergency Alert Sent!",
          text: "Your location has been shared with authorities.",
        });
      }
    } catch (error) {
      console.error("SOS Error:", error.message);
      Alert.alert("Error", "Could not send SOS. Please try again.");
    }
  };

  // Share Location button
  const handleShareLocation = async () => {
    try {
      const loc = await getCurrentLocation();
      if (!loc) return;

      setModalContent({
        emoji: "📍",
        title: "Location Shared!",
        text: `Your real-time location:\nLat: ${loc.latitude}\nLon: ${loc.longitude}`,
      });

      // **FIX**: Changed the API endpoint from "/user/tracking-status" to the correct one.
      await apiRequest("/location/update", "POST", {
        latitude: loc.latitude,
        longitude: loc.longitude,
      });
    } catch (error) {
      console.error("Share location error:", error.message);
      Alert.alert("Error", "Unable to share location.");
    }
  };

  // Check-in button
  const handleCheckIn = () => {
    setModalContent({
      emoji: "✅",
      title: "Checked In!",
      text: "Your contacts have been notified that you are safe.",
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Hello, {userName}</Text>
        <Text style={styles.safeText}>🟢 You are safe</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Emergency CTA */}
        <View style={[styles.card, { backgroundColor: theme.colors.danger }]}>
          <Text style={styles.cardTitle}>Feeling Unsafe?</Text>
          <Text style={styles.cardSubtitle}>
            Tap this button to alert emergency services and share your location.
          </Text>
          <TouchableOpacity style={styles.sosButton} onPress={handleSOS}>
            <Text style={styles.sosText}>🚨 SOS</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.row}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={handleShareLocation}
          >
            <Text style={styles.quickIcon}>📍</Text>
            <Text style={styles.quickTitle}>Share My Location</Text>
            <Text style={styles.quickSubtitle}>
              Instantly share your real-time location.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} onPress={handleCheckIn}>
            <Text style={styles.quickIcon}>✅</Text>
            <Text style={styles.quickTitle}>Check-in</Text>
            <Text style={styles.quickSubtitle}>
              Let contacts know you’re safe.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Alerts Section */}
        <View style={styles.alertCard}>
          <Text style={styles.alertTitle}>Local Alerts</Text>

          <View style={[styles.alertBox, { backgroundColor: "#FEF3C7" }]}>
            <Text style={styles.alertEmoji}>🌧️</Text>
            <View>
              <Text style={styles.alertHeading}>Weather Advisory</Text>
              <Text style={styles.alertText}>
                Heavy rain expected tonight. Stay safe.
              </Text>
            </View>
          </View>

          <View style={[styles.alertBox, { backgroundColor: "#E5E7EB" }]}>
            <Text style={styles.alertEmoji}>🔒</Text>
            <View>
              <Text style={styles.alertHeading}>Security Tips</Text>
              <Text style={styles.alertText}>
                Secure your belongings & stay aware.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal visible={!!modalContent} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {modalContent && (
              <>
                <Text style={styles.modalEmoji}>{modalContent.emoji}</Text>
                <Text style={styles.modalTitle}>{modalContent.title}</Text>
                <Text style={styles.modalText}>{modalContent.text}</Text>
              </>
            )}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalContent(null)}
            >
              <Text style={{ fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4361EE" },
  header: { padding: 20, flexDirection: "row", justifyContent: "space-between" },
  headerText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  safeText: { fontSize: 14, color: "#0E954E" },
  card: { padding: 20, borderRadius: 20, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  cardSubtitle: { fontSize: 14, color: "#fce7f3", marginBottom: 12 },
  sosButton: { backgroundColor: "#7f1d1d", padding: 16, borderRadius: 50, alignItems: "center" },
  sosText: { fontSize: 24, color: "#fff", fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  quickCard: { flex: 1, backgroundColor: "#fff", marginHorizontal: 4, padding: 12, borderRadius: 16, alignItems: "center" },
  quickIcon: { fontSize: 22 },
  quickTitle: { fontWeight: "bold", color: "#333", marginTop: 6 },
  quickSubtitle: { fontSize: 12, color: "#555", textAlign: "center" },
  alertCard: { backgroundColor: "#fff", padding: 16, borderRadius: 16 },
  alertTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  alertBox: { flexDirection: "row", alignItems: "center", padding: 12, borderRadius: 12, marginBottom: 8 },
  alertEmoji: { fontSize: 18, marginRight: 8 },
  alertHeading: { fontSize: 14, fontWeight: "600" },
  alertText: { fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", padding: 20, borderRadius: 20, width: "80%", alignItems: "center" },
  modalEmoji: { fontSize: 40, marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 6 },
  modalText: { fontSize: 14, textAlign: "center", marginBottom: 16 },
  closeBtn: { backgroundColor: "#e5e7eb", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20 },
});

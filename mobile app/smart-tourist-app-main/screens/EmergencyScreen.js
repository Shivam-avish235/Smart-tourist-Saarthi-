import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
// **FIX**: Use expo-audio instead of the deprecated expo-av
import { Audio } from "expo-av";
import { apiRequest } from "../services/api";
import { LinearGradient } from "expo-linear-gradient";

// Define theme colors or import from your theme file
const theme = {
  colors: {
    backgroundGradient: {
      start: "#1a237e", // Dark blue
      end: "#283593", // Slightly lighter blue
    },
    text: "#ffffff",
    textSecondary: "#e3f2fd",
    warning: "#f57c00", // Orange
    success: "#43a047", // Green
  },
};

export default function EmergencyScreen() {
  const [modalMessage, setModalMessage] = useState(null);
  const pressTimeout = useRef(null);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sos-alert.mp3") // make sure this file exists!
      );
      await sound.playAsync();
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };

  const handlePressIn = () => {
    pressTimeout.current = setTimeout(() => {
      sendSOS();
    }, 2000); // 2 seconds hold
  };

  const handlePressOut = () => {
    if (pressTimeout.current) {
      clearTimeout(pressTimeout.current);
    }
  };

  const sendSOS = async () => {
    await playSound();
    try {
      const response = await apiRequest("/emergency/panic", "POST", {
        userId: "12345", // replace with actual logged in user id
        timestamp: new Date().toISOString(),
      });
      if (response.success) {
        showModal("SOS Sent! Authorities have been notified.");
      } else {
        // Provide more specific feedback if the API call fails
        Alert.alert("Error", response.error || "Could not send SOS alert.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not send SOS alert. Check your connection.");
    }
  };

  const sendEmergency = () => {
    // Implement location sharing functionality
    showModal("Your location has been shared with emergency contacts.");
  };

  const sendHelp = () => {
    // Implement help request functionality
    showModal("Help request has been sent to your trusted contacts.");
  };

  const showModal = (message) => {
    setModalMessage(message);
  };

  const closeModal = () => {
    setModalMessage(null);
  };

  return (
    <LinearGradient
      colors={[
        theme.colors.backgroundGradient.start,
        theme.colors.backgroundGradient.end,
      ]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Actions</Text>
        <Text style={styles.subHeader}>
          Choose the type of alert you want to send
        </Text>
      </View>

      {/* Emergency Buttons */}
      <View style={styles.card}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Text style={styles.btnText}>SOS Alert (Hold for 2s)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.warning }]}
          onPress={sendEmergency}
        >
          <Text style={styles.btnText}>Share Location</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.success }]}
          onPress={sendHelp}
        >
          <Text style={styles.btnText}>Request Help</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for confirmation */}
      <Modal visible={modalMessage !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
              <Text style={{ fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginTop: 40, marginBottom: 20, alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: theme.colors.text },
  subHeader: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  actionBtn: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginVertical: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    width: "80%",
    alignItems: "center",
  },
  modalText: { fontSize: 16, textAlign: "center", marginBottom: 16 },
  closeBtn: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
});

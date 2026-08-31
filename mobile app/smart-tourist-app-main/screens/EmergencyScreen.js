import React, { useRef, useState, useEffect } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from "react-native";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { apiRequest } from "../services/api";

const { width: screenWidth } = Dimensions.get('window');

// Define theme colors
const theme = {
  colors: {
    backgroundGradient: {
      start: "#1a237e",
      end: "#283593",
    },
    text: "#ffffff",
    textSecondary: "#e3f2fd",
    warning: "#f57c00",
    success: "#43a047",
    heartRed: "#e74c3c",
    heartPink: "#ff6b9d",
    heartLight: "#ff8fab",
  },
};

export default function EmergencyScreen() {
  const [modalMessage, setModalMessage] = useState(null);
  const [currentBPM, setCurrentBPM] = useState(72);
  const pressTimeout = useRef(null);
  
  // Animation values
  const heartScale = useRef(new Animated.Value(1)).current;
  const heartOpacity = useRef(new Animated.Value(1)).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.8)).current;
  const glowOpacity = useRef(new Animated.Value(0.3)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;

  // Beautiful heart beating animation
  useEffect(() => {
    // Main heartbeat animation
    const heartBeat = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(heartScale, {
            toValue: 1.15,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(heartOpacity, {
            toValue: 0.9,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(heartScale, {
            toValue: 1.25,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(heartOpacity, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(heartScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(heartOpacity, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(333), // Rest period for realistic rhythm
      ])
    );

    // Pulse ring animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1.8,
            duration: 833,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 833,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.8,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    // Glow effect animation
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowOpacity, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(glowOpacity, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle rotation animation
    const rotationAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotation, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(rotation, {
          toValue: -1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    );

    // Shadow animation
    const shadowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shadowScale, {
          toValue: 1.1,
          duration: 833,
          useNativeDriver: true,
        }),
        Animated.timing(shadowScale, {
          toValue: 1,
          duration: 833,
          useNativeDriver: true,
        }),
      ])
    );

    // Start all animations
    heartBeat.start();
    pulseAnimation.start();
    glowAnimation.start();
    rotationAnimation.start();
    shadowAnimation.start();

    // Simulate BPM variation
    const bpmInterval = setInterval(() => {
      setCurrentBPM(prev => {
        const variation = Math.floor(Math.random() * 5) - 2;
        const newBPM = prev + variation;
        return Math.max(68, Math.min(76, newBPM));
      });
    }, 2000);

    return () => {
      heartScale.stopAnimation();
      heartOpacity.stopAnimation();
      pulseScale.stopAnimation();
      pulseOpacity.stopAnimation();
      glowOpacity.stopAnimation();
      rotation.stopAnimation();
      shadowScale.stopAnimation();
      clearInterval(bpmInterval);
    };
  }, []);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../assets/sos-alert.mp3")
      );
      await sound.playAsync();
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };

  const handlePressIn = () => {
    pressTimeout.current = setTimeout(() => {
      sendSOS();
    }, 2000);
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
        userId: "12345",
        timestamp: new Date().toISOString(),
      });
      if (response.success) {
        showModal("SOS Sent! Authorities have been notified.");
      } else {
        Alert.alert("Error", response.error || "Could not send SOS alert.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not send SOS alert. Check your connection.");
    }
  };

  const showModal = (message) => {
    setModalMessage(message);
  };

  const closeModal = () => {
    setModalMessage(null);
  };

  // Enhanced Heart Shape Component
  const HeartShape = () => {
    const rotationInterpolate = rotation.interpolate({
      inputRange: [-1, 1],
      outputRange: ['-3deg', '3deg'],
    });

    return (
      <View style={styles.heartWrapper}>
        {/* Glow effect */}
        <Animated.View
          style={[
            styles.glowEffect,
            {
              opacity: glowOpacity,
              transform: [{ scale: shadowScale }],
            },
          ]}
        />
        
        {/* Pulse rings */}
        <Animated.View
          style={[
            styles.pulseRing,
            {
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />
        
        {/* Main heart */}
        <Animated.View
          style={[
            styles.heartContainer,
            {
              transform: [
                { scale: heartScale },
                { rotate: rotationInterpolate },
              ],
              opacity: heartOpacity,
            },
          ]}
        >
          <LinearGradient
            colors={[theme.colors.heartPink, theme.colors.heartRed]}
            style={styles.heartShape}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.heartInner}>
              <View style={[styles.heartLeft, styles.heart]} />
              <View style={[styles.heartRight, styles.heart]} />
              <View style={styles.heartBottom} />
            </View>
          </LinearGradient>
          
          {/* Heart highlight */}
          <View style={styles.heartHighlight} />
        </Animated.View>
      </View>
    );
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

      {/* Enhanced Heart Rate Monitor */}
      <View style={styles.heartRateCard}>
        <View style={styles.heartSection}>
          <HeartShape />
        </View>
        
        <View style={styles.bpmContainer}>
          <Animated.Text 
            style={[
              styles.heartRateText,
              {
                transform: [{ scale: heartScale }],
              }
            ]}
          >
            {currentBPM}
          </Animated.Text>
          <Text style={styles.heartRateLabel}>BPM</Text>
        </View>
        
        {/* ECG-like line */}
        <View style={styles.ecgContainer}>
          <View style={styles.ecgLine} />
          <View style={styles.ecgPulse} />
        </View>
      </View>

      {/* Emergency Button */}
      <View style={styles.card}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#e74c3c" }]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>SOS Alert (Hold for 2s)</Text>
          <Text style={styles.btnSubText}>Press and hold to send emergency alert</Text>
        </TouchableOpacity>
      </View>

      {/* Modal for confirmation */}
      <Modal visible={modalMessage !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalText}>{modalMessage}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={closeModal}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20 
  },
  header: { 
    marginTop: 40, 
    marginBottom: 20, 
    alignItems: "center" 
  },
  headerTitle: { 
    fontSize: 24, 
    fontWeight: "bold", 
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  subHeader: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 6,
    textAlign: "center",
    opacity: 0.9,
  },
  
  // Enhanced Heart Rate Monitor Styles
  heartRateCard: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    padding: 30,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  heartSection: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heartWrapper: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  
  // Glow and pulse effects
  glowEffect: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.heartRed,
    shadowColor: theme.colors.heartRed,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  pulseRing: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: theme.colors.heartPink,
    opacity: 0.8,
  },
  
  // Heart shape styles
  heartContainer: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  heartShape: {
    width: 50,
    height: 45,
    position: "relative",
    borderRadius: 25,
    shadowColor: theme.colors.heartRed,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  heartInner: {
    flex: 1,
    position: "relative",
  },
  heart: {
    width: 25,
    height: 40,
    position: "absolute",
    backgroundColor: "transparent",
    borderTopLeftRadius: 12.5,
    borderTopRightRadius: 12.5,
  },
  heartLeft: {
    left: 12.5,
    transform: [{ rotate: "-45deg" }],
    backgroundColor: "transparent",
  },
  heartRight: {
    right: 12.5,
    transform: [{ rotate: "45deg" }],
    backgroundColor: "transparent",
  },
  heartBottom: {
    position: "absolute",
    bottom: 5,
    left: 12.5,
    width: 25,
    height: 25,
    backgroundColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },
  heartHighlight: {
    position: "absolute",
    top: 8,
    left: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },
  
  // BPM display
  bpmContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 15,
  },
  heartRateText: {
    fontSize: 48,
    fontWeight: "bold",
    color: theme.colors.text,
    marginRight: 8,
    textShadowColor: "rgba(255, 255, 255, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heartRateLabel: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    fontWeight: "600",
    opacity: 0.9,
  },
  
  // ECG line effect
  ecgContainer: {
    width: "100%",
    height: 2,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    position: "relative",
    overflow: "hidden",
    borderRadius: 1,
  },
  ecgLine: {
    position: "absolute",
    height: 2,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  ecgPulse: {
    position: "absolute",
    height: 2,
    width: 40,
    backgroundColor: theme.colors.heartPink,
    shadowColor: theme.colors.heartPink,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  
  // Card and button styles
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  actionBtn: {
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "bold", 
    fontSize: 18,
    letterSpacing: 0.5,
  },
  btnSubText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    marginTop: 6,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(5px)",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 28,
    borderRadius: 24,
    width: "85%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalText: { 
    fontSize: 17, 
    textAlign: "center", 
    marginBottom: 20,
    color: "#333",
    lineHeight: 24,
  },
  closeBtn: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  closeBtnText: {
    fontWeight: "bold",
    color: "#333",
    fontSize: 15,
  },
});
import * as Location from "expo-location";
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState, useRef } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  Platform,
} from "react-native";
import { apiRequest } from "../services/api";

const { width } = Dimensions.get('window');

const theme = {
  colors: {
    primary: "#667EEA",
    primaryDark: "#5A67D8",
    primaryLight: "#7C8CEA",
    secondary: "#ED64A6",
    secondaryLight: "#F687B3",
    backgroundGradient: ["#667EEA", "#764BA2"],
    cardGradient: ["#667EEA", "#5A67D8"],
    dangerGradient: ["#F56565", "#E53E3E"],
    successGradient: ["#48BB78", "#38A169"],
    warningGradient: ["#ED8936", "#DD6B20"],
    white: "#FFFFFF",
    black: "#1A202C",
    gray: {
      50: "#F7FAFC",
      100: "#EDF2F7",
      200: "#E2E8F0",
      300: "#CBD5E0",
      400: "#A0AEC0",
      500: "#718096",
      600: "#4A5568",
      700: "#2D3748",
      800: "#1A202C",
    },
    text: "#2D3748",
    textLight: "#718096",
    textWhite: "#FFFFFF",
    shadow: "rgba(0, 0, 0, 0.1)",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 999,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
};

const languages = [
  { code: "hi", name: "हिन्दी", label: "Hindi", icon: "🇮🇳" },
  { code: "en", name: "English", label: "English", icon: "🇬🇧" },
  { code: "bn", name: "বাংলা", label: "Bengali", icon: "🇧🇩" },
  { code: "te", name: "తెలుగు", label: "Telugu", icon: "🇮🇳" },
  { code: "mr", name: "मराठी", label: "Marathi", icon: "🇮🇳" },
  { code: "ta", name: "தமிழ்", label: "Tamil", icon: "🇮🇳" },
  { code: "gu", name: "ગુજરાતી", label: "Gujarati", icon: "🇮🇳" },
  { code: "ur", name: "اردو", label: "Urdu", icon: "🇵🇰" },
  { code: "kn", name: "ಕನ್ನಡ", label: "Kannada", icon: "🇮🇳" },
  { code: "or", name: "ଓଡ଼ିଆ", label: "Odia", icon: "🇮🇳" },
  { code: "ml", name: "മലയാളം", label: "Malayalam", icon: "🇮🇳" },
  { code: "pa", name: "ਪੰਜਾਬੀ", label: "Punjabi", icon: "🇮🇳" },
  { code: "as", name: "অসমীয়া", label: "Assamese", icon: "🇮🇳" },
];

export default function HomeScreen() {
  const [userName, setUserName] = useState("Tourist");
  const [modalContent, setModalContent] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const toggleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for SOS button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Initialize toggle animation
    Animated.timing(toggleAnim, {
      toValue: isTrackingActive ? 1 : 0,
      duration: 0,
      useNativeDriver: false,
    }).start();

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
  }, [fadeAnim, scaleAnim, pulseAnim, toggleAnim, isTrackingActive]);

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
          type: "danger",
        });
      }
    } catch (error) {
      console.error("SOS Error:", error.message);
      Alert.alert("Error", "Could not send SOS. Please try again.");
    }
  };

  // Toggle Active Tracking
  const handleToggleTracking = async () => {
    const newState = !isTrackingActive;
    
    // Animate the toggle
    Animated.timing(toggleAnim, {
      toValue: newState ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();

    if (newState) {
      // Activating tracking
      try {
        const loc = await getCurrentLocation();
        if (!loc) return;

        await apiRequest("/location/update", "POST", {
          latitude: loc.latitude,
          longitude: loc.longitude,
          trackingActive: true,
        });

        setIsTrackingActive(true);
        setModalContent({
          emoji: "🛡️",
          title: "Protection Activated!",
          text: "Live tracking is now active. Your location is being monitored for your safety.",
          type: "success",
        });
      } catch (error) {
        console.error("Activation error:", error.message);
        Alert.alert("Error", "Unable to activate tracking.");
      }
    } else {
      // Deactivating tracking
      try {
        await apiRequest("/location/update", "POST", {
          trackingActive: false,
        });

        setIsTrackingActive(false);
        setModalContent({
          emoji: "🔒",
          title: "Protection Paused",
          text: "Live tracking has been paused. Activate anytime for safety monitoring.",
          type: "info",
        });
      } catch (error) {
        console.error("Deactivation error:", error.message);
      }
    }
  };

  // Handle language selection
  const handleLanguageSelect = (langCode) => {
    setSelectedLanguage(langCode);
    setShowLanguageModal(false);
    const selected = languages.find(l => l.code === langCode);
    setModalContent({
      emoji: "🌐",
      title: "Language Updated!",
      text: `App language set to ${selected.label}`,
      type: "info",
    });
  };

  const getModalGradient = (type) => {
    switch(type) {
      case 'danger': return theme.colors.dangerGradient;
      case 'success': return theme.colors.successGradient;
      case 'info': return theme.colors.cardGradient;
      default: return theme.colors.backgroundGradient;
    }
  };

  return (
    <LinearGradient
      colors={theme.colors.backgroundGradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.headerText}>{userName} 👋</Text>
        </View>
        <View style={[
          styles.statusBadge,
          isTrackingActive && styles.statusBadgeActive
        ]}>
          <Animated.View style={[
            styles.statusDot,
            {
              backgroundColor: toggleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['#CBD5E0', '#48BB78']
              })
            }
          ]} />
          <Text style={styles.safeText}>
            {isTrackingActive ? 'Protected' : 'Safe'}
          </Text>
        </View>
      </Animated.View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Selection Section */}
        <Animated.View 
          style={[
            styles.card,
            styles.languageSection,
            { opacity: fadeAnim }
          ]}
        >
          <LinearGradient
            colors={['#FFFFFF', '#F7FAFC']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.languageHeader}>
              <Text style={styles.languageIcon}>🌍</Text>
              <View style={styles.languageTextContainer}>
                <Text style={styles.languageTitle}>Language Preference</Text>
                <Text style={styles.languageSubtitle}>Tap to change your language</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.languageSelector}
              onPress={() => setShowLanguageModal(true)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={theme.colors.cardGradient}
                style={styles.languageSelectorGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.languageSelectorContent}>
                  <Text style={styles.currentLanguage}>
                    {languages.find(l => l.code === selectedLanguage)?.icon} {languages.find(l => l.code === selectedLanguage)?.name}
                  </Text>
                  <Text style={styles.currentLanguageLabel}>
                    {languages.find(l => l.code === selectedLanguage)?.label}
                  </Text>
                </View>
                <View style={styles.changeButton}>
                  <Text style={styles.changeText}>Change</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Emergency CTA */}
        <Animated.View 
          style={[
            styles.card,
            {
              transform: [{ scale: pulseAnim }],
            }
          ]}
        >
          <LinearGradient
            colors={theme.colors.dangerGradient}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.emergencyHeader}>
              <Text style={styles.emergencyTitle}>Feeling Unsafe?</Text>
              <Text style={styles.emergencySubtitle}>
                Instantly alert emergency services and share your location
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.sosButton} 
              onPress={handleSOS}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.sosButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.sosIcon}>🚨</Text>
                <Text style={styles.sosText}>EMERGENCY SOS</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Active Protection Toggle */}
        <Animated.View 
          style={[
            styles.card,
            styles.shadowProp,
            { opacity: fadeAnim }
          ]}
        >
          <LinearGradient
            colors={isTrackingActive ? theme.colors.successGradient : ['#FFFFFF', '#F7FAFC']}
            style={styles.cardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.toggleHeader}>
              <View style={styles.toggleInfo}>
                <Text style={[
                  styles.toggleTitle,
                  isTrackingActive && styles.toggleTitleActive
                ]}>
                  Live Protection
                </Text>
                <Text style={[
                  styles.toggleSubtitle,
                  isTrackingActive && styles.toggleSubtitleActive
                ]}>
                  {isTrackingActive ? 'Your location is being monitored' : 'Activate for real-time safety tracking'}
                </Text>
              </View>
              <View style={styles.toggleStatusBadge}>
                <Animated.View 
                  style={[
                    styles.toggleStatusDot,
                    {
                      backgroundColor: toggleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['#CBD5E0', '#48BB78']
                      })
                    }
                  ]}
                />
                <Text style={[
                  styles.toggleStatusText,
                  isTrackingActive && styles.toggleStatusTextActive
                ]}>
                  {isTrackingActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.toggleButton}
              onPress={handleToggleTracking}
              activeOpacity={0.9}
            >
              <Animated.View
                style={[
                  styles.toggleTrack,
                  {
                    backgroundColor: toggleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['#E2E8F0', '#C6F6D5']
                    })
                  }
                ]}
              >
                <Animated.View
                  style={[
                    styles.toggleThumb,
                    {
                      transform: [{
                        translateX: toggleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [2, width * 0.35]
                        })
                      }]
                    }
                  ]}
                >
                  <LinearGradient
                    colors={isTrackingActive ? theme.colors.successGradient : ['#667EEA', '#764BA2']}
                    style={styles.toggleThumbGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Text style={styles.toggleThumbIcon}>
                      {isTrackingActive ? '🛡️' : '🔒'}
                    </Text>
                  </LinearGradient>
                </Animated.View>
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.toggleFeatures}>
              <View style={styles.toggleFeature}>
                <Text style={[
                  styles.toggleFeatureIcon,
                  isTrackingActive && styles.toggleFeatureIconActive
                ]}>
                  📍
                </Text>
                <Text style={[
                  styles.toggleFeatureText,
                  isTrackingActive && styles.toggleFeatureTextActive
                ]}>
                  Real-time Location
                </Text>
              </View>
              <View style={styles.toggleFeature}>
                <Text style={[
                  styles.toggleFeatureIcon,
                  isTrackingActive && styles.toggleFeatureIconActive
                ]}>
                  👥
                </Text>
                <Text style={[
                  styles.toggleFeatureText,
                  isTrackingActive && styles.toggleFeatureTextActive
                ]}>
                  Contact Alerts
                </Text>
              </View>
              <View style={styles.toggleFeature}>
                <Text style={[
                  styles.toggleFeatureIcon,
                  isTrackingActive && styles.toggleFeatureIconActive
                ]}>
                  ⚡
                </Text>
                <Text style={[
                  styles.toggleFeatureText,
                  isTrackingActive && styles.toggleFeatureTextActive
                ]}>
                  Quick Response
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Alerts Section */}
        <View style={[styles.card, styles.alertCard]}>
          <View style={styles.alertHeader}>
            <Text style={styles.alertTitle}>📢 Local Alerts</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All →</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.alertItem}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#FEF5E7', '#FDEBD0']}
              style={styles.alertGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.alertIconBox}>
                <Text style={styles.alertEmoji}>🌧️</Text>
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertHeading}>Weather Advisory</Text>
                <Text style={styles.alertText}>
                  Heavy rain expected tonight. Stay safe indoors.
                </Text>
                <Text style={styles.alertTime}>2 hours ago</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.alertItem}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#EBF4FF', '#E0ECFF']}
              style={styles.alertGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.alertIconBox}>
                <Text style={styles.alertEmoji}>🔒</Text>
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertHeading}>Security Tips</Text>
                <Text style={styles.alertText}>
                  Keep belongings secure in crowded areas.
                </Text>
                <Text style={styles.alertTime}>5 hours ago</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal visible={showLanguageModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.languageModalBox}>
            <LinearGradient
              colors={['#FFFFFF', '#F7FAFC']}
              style={styles.modalGradient}
            >
              <View style={styles.languageModalHeader}>
                <View>
                  <Text style={styles.languageModalTitle}>Select Language</Text>
                  <Text style={styles.languageModalSubtitle}>Choose your preferred language</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowLanguageModal(false)}
                  style={styles.closeButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.languageList}
                showsVerticalScrollIndicator={false}
              >
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.languageItem,
                      selectedLanguage === lang.code && styles.selectedLanguageItem
                    ]}
                    onPress={() => handleLanguageSelect(lang.code)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.languageItemContent}>
                      <Text style={styles.languageItemIcon}>{lang.icon}</Text>
                      <View style={styles.languageItemText}>
                        <Text style={[
                          styles.languageNative,
                          selectedLanguage === lang.code && styles.selectedText
                        ]}>
                          {lang.name}
                        </Text>
                        <Text style={[
                          styles.languageEnglish,
                          selectedLanguage === lang.code && styles.selectedSubText
                        ]}>
                          {lang.label}
                        </Text>
                      </View>
                    </View>
                    {selectedLanguage === lang.code && (
                      <View style={styles.checkmarkContainer}>
                        <Text style={styles.checkmark}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </LinearGradient>
          </View>
        </View>
      </Modal>

      {/* General Modal */}
      <Modal visible={!!modalContent} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <LinearGradient
              colors={modalContent ? getModalGradient(modalContent.type) : theme.colors.backgroundGradient}
              style={styles.modalContentGradient}
            >
              {modalContent && (
                <>
                  <View style={styles.modalEmojiContainer}>
                    <Text style={styles.modalEmoji}>{modalContent.emoji}</Text>
                  </View>
                  <Text style={styles.modalTitle}>{modalContent.title}</Text>
                  <Text style={styles.modalText}>{modalContent.text}</Text>
                </>
              )}
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setModalContent(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCloseBtnText}>Got it</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  header: { 
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    flexDirection: "row", 
    justifyContent: "space-between",
    alignItems: 'center',
  },
  greeting: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: 2,
  },
  headerText: { 
    fontSize: theme.fontSize.xxl,
    fontWeight: "bold", 
    color: theme.colors.white,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(72, 187, 120, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  safeText: { 
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    fontWeight: '600',
  },
  
  // Card Styles
  card: {
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
  },
  shadowProp: {
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  
  // Language Section
  languageSection: {
    backgroundColor: 'transparent',
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  languageIcon: {
    fontSize: 36,
    marginRight: theme.spacing.md,
  },
  languageTextContainer: {
    flex: 1,
  },
  languageTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 2,
  },
  languageSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  languageSelector: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  languageSelectorGradient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
  },
  languageSelectorContent: {
    flex: 1,
  },
  currentLanguage: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.white,
    marginBottom: 2,
  },
  currentLanguageLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    opacity: 0.9,
  },
  changeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.full,
  },
  changeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.white,
    fontWeight: "600",
  },
  
  // Emergency Section
  emergencyHeader: {
    marginBottom: theme.spacing.lg,
  },
  emergencyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "bold",
    color: theme.colors.white,
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.white,
    opacity: 0.9,
  },
  sosButton: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  sosButtonGradient: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    alignItems: "center",
    justifyContent: 'center',
  },
  sosIcon: {
    fontSize: 32,
    marginRight: theme.spacing.sm,
  },
  sosText: { 
    fontSize: theme.fontSize.lg,
    color: theme.colors.white,
    fontWeight: "900",
    letterSpacing: 1,
  },
  
  // Active Protection Toggle
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 4,
  },
  toggleTitleActive: {
    color: theme.colors.white,
  },
  toggleSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  toggleSubtitleActive: {
    color: theme.colors.white,
    opacity: 0.95,
  },
  toggleStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.full,
  },
  toggleStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  toggleStatusText: {
    fontSize: theme.fontSize.xs,
    fontWeight: '600',
    color: theme.colors.textLight,
  },
  toggleStatusTextActive: {
    color: theme.colors.white,
  },
  toggleButton: {
    marginBottom: theme.spacing.lg,
  },
  toggleTrack: {
    width: '100%',
    height: 80,
    borderRadius: 40,
    padding: 4,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 72,
    height: 72,
    borderRadius: 36,
    position: 'absolute',
  },
  toggleThumbGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleThumbIcon: {
    fontSize: 32,
  },
  toggleFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  toggleFeature: {
    alignItems: 'center',
  },
  toggleFeatureIcon: {
    fontSize: 24,
    marginBottom: 4,
    opacity: 0.5,
  },
  toggleFeatureIconActive: {
    opacity: 1,
  },
  toggleFeatureText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  toggleFeatureTextActive: {
    color: theme.colors.white,
    opacity: 0.95,
  },
  
  // Alerts Section
  alertCard: { 
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  alertTitle: { 
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  viewAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  alertItem: {
    marginBottom: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  alertGradient: {
    flexDirection: "row",
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  alertIconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  alertEmoji: { 
    fontSize: 22,
  },
  alertContent: {
    flex: 1,
  },
  alertHeading: { 
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 2,
  },
  alertText: { 
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
    marginBottom: 4,
  },
  alertTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    opacity: 0.7,
  },
  
  // Language Modal
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  languageModalBox: {
    backgroundColor: 'transparent',
    borderTopLeftRadius: theme.borderRadius.xl * 1.5,
    borderTopRightRadius: theme.borderRadius.xl * 1.5,
    maxHeight: "80%",
    overflow: 'hidden',
  },
  modalGradient: {
    paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.lg,
  },
  languageModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  languageModalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 2,
  },
  languageModalSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: theme.colors.gray[600],
    fontWeight: '600',
  },
  languageList: {
    padding: theme.spacing.md,
  },
  languageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.gray[50],
  },
  selectedLanguageItem: {
    backgroundColor: '#E8F0FF',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  languageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageItemIcon: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  languageItemText: {
    flex: 1,
  },
  languageNative: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 2,
  },
  languageEnglish: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  selectedText: {
    color: theme.colors.primary,
  },
  selectedSubText: {
    color: theme.colors.primary,
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: "bold",
  },
  
  // Success Modal
  modalBox: { 
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    width: "85%",
    maxWidth: 320,
  },
  modalContentGradient: {
    padding: theme.spacing.xl,
    alignItems: "center",
  },
  modalEmojiContainer: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalEmoji: { 
    fontSize: 36,
  },
  modalTitle: { 
    fontSize: theme.fontSize.xl,
    fontWeight: "800",
    marginBottom: theme.spacing.sm,
    color: theme.colors.white,
    textAlign: 'center',
  },
  modalText: { 
    fontSize: theme.fontSize.md,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
    color: theme.colors.white,
    opacity: 0.95,
    lineHeight: 22,
  },
  modalCloseBtn: { 
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modalCloseBtnText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: theme.colors.white,
  },
});
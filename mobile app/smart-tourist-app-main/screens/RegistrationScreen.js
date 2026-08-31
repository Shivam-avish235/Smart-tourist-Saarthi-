import React, { useState, useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../App";
import theme from "../theme";

const { width, height } = Dimensions.get("window");

export default function RegistrationScreen({ navigation }) {
  const { signUp } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [documentType, setDocumentType] = useState("passport");
  const [documentNumber, setDocumentNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Focus states
  const [focusedField, setFocusedField] = useState("");
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const progressAnim = useRef(new Animated.Value(0.33)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: currentStep === 1 ? 0.33 : currentStep === 2 ? 0.66 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep]);

  const validateStep1 = () => {
    if (!firstName || !lastName || !phoneNumber) {
      Alert.alert("Missing Information", "Please fill in all personal details.");
      return false;
    }
    if (phoneNumber.length !== 10) {
      Alert.alert("Invalid Phone", "Please enter a valid 10-digit phone number.");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert("Missing Information", "Please fill in all account details.");
      return false;
    }
    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!documentNumber) {
      Alert.alert("Missing Information", "Please enter your document number.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSignUp = async () => {
    if (!validateStep3()) return;

    const userData = {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      documentType,
      documentNumber,
      nationality: "Indian",
      dateOfBirth: "1990-01-01"
    };

    setIsLoading(true);
    await signUp(userData);
    setIsLoading(false);
  };

  const renderStepIndicator = () => (
    <View style={styles.stepContainer}>
      <View style={styles.stepRow}>
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <TouchableOpacity 
              style={[
                styles.stepCircle,
                currentStep >= step && styles.stepCircleActive,
                currentStep === step && styles.stepCircleCurrent
              ]}
              onPress={() => step < currentStep && setCurrentStep(step)}
              disabled={step > currentStep}
            >
              {currentStep > step ? (
                <Ionicons name="checkmark" size={18} color="#fff" />
              ) : (
                <Text style={[
                  styles.stepNumber,
                  currentStep >= step && styles.stepNumberActive
                ]}>
                  {step}
                </Text>
              )}
            </TouchableOpacity>
            {step < 3 && (
              <View style={[
                styles.stepLine,
                currentStep > step && styles.stepLineActive
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
      <View style={styles.stepLabels}>
        <Text style={[styles.stepLabel, currentStep >= 1 && styles.stepLabelActive]}>Personal</Text>
        <Text style={[styles.stepLabel, currentStep >= 2 && styles.stepLabelActive]}>Account</Text>
        <Text style={[styles.stepLabel, currentStep >= 3 && styles.stepLabelActive]}>Verification</Text>
      </View>
    </View>
  );

  const renderStep1 = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.inputGroup}>
        <View style={[
          styles.inputContainer,
          focusedField === 'firstName' && styles.inputContainerFocused
        ]}>
          <View style={[
            styles.iconContainer,
            focusedField === 'firstName' && styles.iconContainerFocused
          ]}>
            <Ionicons 
              name="person-outline" 
              size={20} 
              color={focusedField === 'firstName' ? "#667eea" : "#9CA3AF"} 
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            onFocus={() => setFocusedField('firstName')}
            onBlur={() => setFocusedField('')}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={[
          styles.inputContainer,
          focusedField === 'lastName' && styles.inputContainerFocused
        ]}>
          <View style={[
            styles.iconContainer,
            focusedField === 'lastName' && styles.iconContainerFocused
          ]}>
            <Ionicons 
              name="person-outline" 
              size={20} 
              color={focusedField === 'lastName' ? "#667eea" : "#9CA3AF"} 
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            onFocus={() => setFocusedField('lastName')}
            onBlur={() => setFocusedField('')}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={[
          styles.inputContainer,
          focusedField === 'phone' && styles.inputContainerFocused
        ]}>
          <View style={[
            styles.iconContainer,
            focusedField === 'phone' && styles.iconContainerFocused
          ]}>
            <Ionicons 
              name="call-outline" 
              size={20} 
              color={focusedField === 'phone' ? "#667eea" : "#9CA3AF"} 
            />
          </View>
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField('')}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.inputGroup}>
        <View style={[
          styles.inputContainer,
          focusedField === 'email' && styles.inputContainerFocused
        ]}>
          <View style={[
            styles.iconContainer,
            focusedField === 'email' && styles.iconContainerFocused
          ]}>
            <Ionicons 
              name="mail-outline" 
              size={20} 
              color={focusedField === 'email' ? "#667eea" : "#9CA3AF"} 
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField('')}
            placeholderTextColor="#9CA3AF"
          />
        </View>

        <View style={[
          styles.inputContainer,
          focusedField === 'password' && styles.inputContainerFocused
        ]}>
          <View style={[
            styles.iconContainer,
            focusedField === 'password' && styles.iconContainerFocused
          ]}>
            <Ionicons 
              name="lock-closed-outline" 
              size={20} 
              color={focusedField === 'password' ? "#667eea" : "#9CA3AF"} 
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField('')}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        </View>

        <View style={[
          styles.inputContainer,
          focusedField === 'confirmPassword' && styles.inputContainerFocused
        ]}>
          <View style={[
            styles.iconContainer,
            focusedField === 'confirmPassword' && styles.iconContainerFocused
          ]}>
            <Ionicons 
              name="lock-closed-outline" 
              size={20} 
              color={focusedField === 'confirmPassword' ? "#667eea" : "#9CA3AF"} 
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => setFocusedField('')}
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            <Ionicons 
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#9CA3AF" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View style={{ opacity: fadeAnim }}>
      <View style={styles.inputGroup}>
        <Text style={styles.sectionTitle}>Identity Verification</Text>
        <Text style={styles.sectionSubtitle}>
          Please provide your government ID details for verification
        </Text>

        <View style={styles.documentTypeContainer}>
          <Text style={styles.labelText}>Document Type</Text>
          <View style={styles.documentOptions}>
            {[
              { value: 'passport', label: 'Passport', icon: 'document-text' },
              { value: 'aadhaar', label: 'Aadhaar', icon: 'card' },
              { value: 'driving_license', label: 'License', icon: 'car' }
            ].map((doc) => (
              <TouchableOpacity
                key={doc.value}
                style={[
                  styles.documentOption,
                  documentType === doc.value && styles.documentOptionActive
                ]}
                onPress={() => setDocumentType(doc.value)}
              >
                <Ionicons 
                  name={doc.icon} 
                  size={24} 
                  color={documentType === doc.value ? "#667eea" : "#9CA3AF"} 
                />
                <Text style={[
                  styles.documentOptionText,
                  documentType === doc.value && styles.documentOptionTextActive
                ]}>
                  {doc.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[
          styles.inputContainer,
          focusedField === 'document' && styles.inputContainerFocused
        ]}>
          <View style={[
            styles.iconContainer,
            focusedField === 'document' && styles.iconContainerFocused
          ]}>
            <Ionicons 
              name="document-outline" 
              size={20} 
              color={focusedField === 'document' ? "#667eea" : "#9CA3AF"} 
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder={`Enter ${documentType === 'driving_license' ? 'License' : documentType.charAt(0).toUpperCase() + documentType.slice(1)} Number`}
            value={documentNumber}
            onChangeText={setDocumentNumber}
            onFocus={() => setFocusedField('document')}
            onBlur={() => setFocusedField('')}
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color="#667eea" />
          <Text style={styles.infoText}>
            Your information is encrypted and secure. We use it only for verification purposes.
          </Text>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={["#667eea", "#764ba2", "#f093fb"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {/* Decorative circles */}
      <View style={styles.circleContainer}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ],
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Ionicons name="shield-checkmark" size={32} color="#fff" />
              </View>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Join TrustTrip today</Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.formCard}>
            {renderStepIndicator()}
            
            <View style={styles.formContent}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </View>

            {/* Navigation Buttons */}
            <View style={styles.buttonContainer}>
              {currentStep > 1 && (
                <TouchableOpacity 
                  style={styles.secondaryButton}
                  onPress={handleBack}
                >
                  <Ionicons name="arrow-back" size={20} color="#667eea" />
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
              )}
              
              {currentStep < 3 ? (
                <TouchableOpacity 
                  style={[styles.primaryButton, currentStep === 1 && styles.fullWidthButton]}
                  onPress={handleNext}
                >
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.primaryButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.primaryButton}
                  onPress={onSignUp}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={["#667eea", "#764ba2"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.primaryButtonText}>Create Account</Text>
                        <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Login Link */}
          <View style={styles.bottomBar}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  circleContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  circle1: {
    width: 250,
    height: 250,
    backgroundColor: '#fff',
    top: -100,
    left: -50,
  },
  circle2: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    bottom: -50,
    right: -50,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoIcon: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  stepContainer: {
    marginBottom: 30,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  stepCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#667eea',
  },
  stepCircleCurrent: {
    backgroundColor: '#667eea',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  stepNumberActive: {
    color: '#fff',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#667eea',
  },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stepLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  formContent: {
    minHeight: 240,
  },
  inputGroup: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    height: 52,
  },
  inputContainerFocused: {
    borderColor: '#667eea',
    backgroundColor: '#fff',
  },
  iconContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 4,
  },
  iconContainerFocused: {
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  countryCode: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
    marginRight: 8,
    paddingLeft: 8,
  },
  documentTypeContainer: {
    marginBottom: 20,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 10,
  },
  documentOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  documentOption: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  documentOptionActive: {
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    borderColor: '#667eea',
  },
  documentOptionText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  documentOptionTextActive: {
    color: '#667eea',
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(102, 126, 234, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  primaryButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  fullWidthButton: {
    marginLeft: 0,
  },
  gradientButton: {
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginRight: 8,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  secondaryButtonText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 6,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 24,
  },
  bottomText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  loginText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
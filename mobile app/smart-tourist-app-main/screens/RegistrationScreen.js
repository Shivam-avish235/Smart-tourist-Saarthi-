import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AuthContext } from "../App";
import theme from "../theme";

export default function RegistrationScreen({ navigation }) {
  const { signUp } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [documentType, setDocumentType] = useState("passport");
  const [documentNumber, setDocumentNumber] = useState("");

  const onSignUp = async () => {
    if (!email || !password || !documentNumber || !firstName || !lastName || !phoneNumber) {
        Alert.alert("Input Error", "Please fill all required fields.");
        return;
    }

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

  return (
    <LinearGradient
      colors={[
        theme.colors.backgroundGradient.start,
        theme.colors.backgroundGradient.end,
      ]}
      style={{ flex: 1 }}
    >
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formBox}>
          <Text style={styles.logo}>Create TrustTrip Account</Text>

          <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
          <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
          <TextInput style={styles.input} placeholder="Mobile number" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" maxLength={10} />
          <TextInput style={styles.input} placeholder="Email address" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />

          <Text style={styles.label}>Select ID Type</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={documentType} onValueChange={(val) => setDocumentType(val)} dropdownIconColor={theme.colors.text} style={{ color: theme.colors.text }}>
              <Picker.Item label="Passport" value="passport" />
              <Picker.Item label="Aadhaar Card" value="aadhaar" />
              <Picker.Item label="Driving License" value="driving_license" />
            </Picker>
          </View>

          <TextInput style={styles.input} placeholder={`Enter ${documentType} number`} value={documentNumber} onChangeText={setDocumentNumber} />

          <TouchableOpacity style={styles.signupBtn} onPress={onSignUp} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signupText}>Sign up</Text>}
          </TouchableOpacity>

          <View style={styles.bottomBar}>
            <Text style={{ color: theme.colors.subtleText }}>Have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text style={styles.login}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, justifyContent: "center", padding: theme.spacing.large },
  formBox: { backgroundColor: theme.colors.card, borderRadius: theme.radius.large, padding: theme.spacing.large, ...theme.shadow.default },
  logo: { fontSize: 28, fontWeight: "700", textAlign: "center", marginBottom: theme.spacing.large, color: theme.colors.primary },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6, color: theme.colors.text },
  pickerWrapper: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.medium, marginBottom: 12, backgroundColor: theme.colors.input },
  input: { borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.medium, paddingVertical: 12, paddingHorizontal: 14, marginBottom: 12, backgroundColor: theme.colors.input, color: theme.colors.text },
  signupBtn: { backgroundColor: theme.colors.primary, paddingVertical: 14, borderRadius: theme.radius.large, alignItems: "center", marginTop: 8, ...theme.shadow.default },
  signupText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  bottomBar: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  login: { color: theme.colors.accent, fontWeight: "700" },
});

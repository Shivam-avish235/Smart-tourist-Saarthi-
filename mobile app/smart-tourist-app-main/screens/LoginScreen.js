import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert
} from "react-native";
import { AuthContext } from "../App";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme from "../theme";

export default function LoginScreen({ navigation }) {
  const { signIn } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert("Input Error", "Please enter both email and password.");
      return;
    }
    setIsLoading(true);
    await signIn(email, password);
    setIsLoading(false);
  };

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradient.start, theme.colors.backgroundGradient.end]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={styles.logo}>TrustTrip</Text>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={onLogin} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.bottomBar}>
          <Text style={{ color: "#fff" }}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Registration")}>
            <Text style={styles.signup}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: 38,
    fontWeight: "800",
    color: "#fff",
    textAlign: "center",
    marginBottom: 30,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    ...theme.shadow.default,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#333",
  },
  loginBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    ...theme.shadow.default,
  },
  loginText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  bottomBar: {
    marginTop: 30,
    flexDirection: "row",
    justifyContent: "center",
  },
  signup: { color: "#fff", fontWeight: "700" },
});

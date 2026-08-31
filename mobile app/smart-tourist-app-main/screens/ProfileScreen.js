import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import theme from "../theme";
import { AuthContext } from "../App";
import { apiRequest } from "../services/api";

export default function ProfileScreen() {
  const { signOut } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiRequest("/auth/profile");
      if (response.success) {
        setProfile(response.data);
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch profile data.");
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await apiRequest("/auth/profile", "PUT", profile);
      if (response.success) {
        Alert.alert("Success", "Profile updated successfully.");
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert("Error", "Could not update profile.");
    }
  };

  if (!profile) {
    return (
      <View
        style={[styles.container, { justifyContent: "center", alignItems: "center" }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradient.start, theme.colors.backgroundGradient.end]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="person-circle-outline" size={90} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Your Profile</Text>
          <Text style={styles.subHeader}>Manage your account information</Text>
        </View>

        {/* Profile Info Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Info</Text>

          <View style={styles.field}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.readonlyInput]}
              value={profile.personalInfo.firstName}
              onChangeText={(text) =>
                setProfile({ ...profile, personalInfo: { ...profile.personalInfo, firstName: text } })
              }
              editable={isEditing}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.readonlyInput]}
              value={profile.personalInfo.lastName}
              onChangeText={(text) =>
                setProfile({ ...profile, personalInfo: { ...profile.personalInfo, lastName: text } })
              }
              editable={isEditing}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.readonlyInput]}
              value={profile.personalInfo.phoneNumber}
              onChangeText={(text) =>
                setProfile({
                  ...profile,
                  personalInfo: { ...profile.personalInfo, phoneNumber: text },
                })
              }
              editable={isEditing}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isEditing ? (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.success }]}
              onPress={handleUpdate}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
              <Text style={styles.btnText}>Save Changes</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.btnText}>Edit Profile</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.danger }]}
            onPress={signOut}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.btnText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 40 },
  header: { alignItems: "center", marginBottom: 30 },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: theme.colors.text, marginTop: 10 },
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
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: "#444" },
  field: { marginBottom: 15 },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    fontSize: 15,
  },
  readonlyInput: {
    backgroundColor: "#f5f5f5",
    color: "#555",
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    fontWeight: "500",
  },
  actions: { marginBottom: 40 },
  button: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 6 },
});

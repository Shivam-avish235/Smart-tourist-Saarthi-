import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../theme";
import { AuthContext } from "../App";
import { apiRequest } from '../services/api';

export default function ProfileScreen() {
  const { signOut } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
        const response = await apiRequest('/auth/profile');
        if (response.success) {
            setProfile(response.data);
        }
    } catch (error) {
        Alert.alert("Error", "Could not fetch profile data.");
    }
  };

  const handleUpdate = async () => {
    try {
        const response = await apiRequest('/auth/profile', 'PUT', profile);
        if (response.success) {
            Alert.alert("Success", "Profile updated successfully.");
            setIsEditing(false);
        }
    } catch(error) {
        Alert.alert("Error", "Could not update profile.");
    }
  };
  
  // **FIX**: Added ActivityIndicator import, this will now work.
  if (!profile) {
      return (
        <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
          <ActivityIndicator size="large" color={theme.colors.text} />
        </View>
      )
  }

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradient.start, theme.colors.backgroundGradient.end]}
      style={styles.container}
    >
      <ScrollView>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Profile</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>First Name</Text>
            <TextInput style={styles.input} value={profile.personalInfo.firstName} onChangeText={(text) => setProfile({...profile, personalInfo: {...profile.personalInfo, firstName: text}})} editable={isEditing} />
            
            <Text style={styles.label}>Last Name</Text>
            <TextInput style={styles.input} value={profile.personalInfo.lastName} onChangeText={(text) => setProfile({...profile, personalInfo: {...profile.personalInfo, lastName: text}})} editable={isEditing} />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput style={styles.input} value={profile.personalInfo.phoneNumber} onChangeText={(text) => setProfile({...profile, personalInfo: {...profile.personalInfo, phoneNumber: text}})} editable={isEditing} keyboardType="phone-pad"/>
          </View>
          
          <View style={styles.card}>
            {isEditing ? (
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.success }]} onPress={handleUpdate}>
                <Text style={styles.btnText}>Save Changes</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.primary }]} onPress={() => setIsEditing(true)}>
                <Text style={styles.btnText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={[styles.button, { backgroundColor: theme.colors.danger }]} onPress={signOut}>
              <Text style={styles.btnText}>Log Out</Text>
            </TouchableOpacity>
          </View>
      </ScrollView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginTop: 40, marginBottom: 20, alignItems: "center" },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: theme.colors.text },
  subHeader: { fontSize: 14, color: theme.colors.textSecondary, marginTop: 4, textAlign: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  input: {
      height: 40,
      borderColor: theme.colors.textSecondary,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 10,
      marginBottom: 10,
  },
  label: {
      fontSize: 16,
      color: "#333",
      marginBottom: 5,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginVertical: 8,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});

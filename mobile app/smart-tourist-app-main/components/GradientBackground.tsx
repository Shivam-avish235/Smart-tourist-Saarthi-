import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import theme from "../theme";

export default function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <LinearGradient
      colors={[
        theme.colors.backgroundGradient.start,
        theme.colors.backgroundGradient.end,
      ]}
      style={styles.container}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

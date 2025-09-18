const theme = {
  colors: {
    backgroundGradient: {
      start: "#4facfe",
      end: "#00f2fe",
    },
    background: "#f5f5f5",
    card: "#ffffff",
    primary: "#4facfe",
    accent: "#ff6f61",
    danger: "#e74c3c",
    warning: "#f39c12",
    success: "#27ae60",
    text: "#333333",
    subtext: "#666666",
    subtleText: "#999999",
      textSecondary: "#808080",

    // ✅ Add missing ones
    border: "#dddddd",   // Light gray border
    input: "#fafafa",    // Input background
  },
  spacing: {
    small: 8,
    medium: 16,
    large: 24,
  },
  radius: {
    small: 6,
    medium: 10,
    large: 16,
  },
  shadow: {
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  },
};

export default theme;

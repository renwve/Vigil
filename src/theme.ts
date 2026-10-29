import type { TextStyle } from "react-native";

export const palette = {
  brand: "#079DE0",
  brandDark: "#0877C9",
  success: "#159A72",
  warning: "#C78319",
  danger: "#D94A55",
};

export const themes = {
  dark: {
    mode: "dark" as const,
    background: "#07111F",
    surface: "#0D1C2D",
    surfaceElevated: "#12263B",
    text: "#F4F8FC",
    muted: "#91A5BA",
    border: "#20384F",
    input: "#091726",
    tabBar: "#0D1C2D",
    overlay: "rgba(0,0,0,0.35)",
    calendarMuted: "#5F748A",
  },
  light: {
    mode: "light" as const,
    background: "#F4F7FB",
    surface: "#FFFFFF",
    surfaceElevated: "#EAF2F9",
    text: "#142438",
    muted: "#64778B",
    border: "#DCE5EE",
    input: "#F8FAFC",
    tabBar: "#FFFFFF",
    overlay: "rgba(20,36,56,0.08)",
    calendarMuted: "#A0ADBA",
  },
};

export type ThemeMode = keyof typeof themes;
export type ThemeColors = (typeof themes)[ThemeMode];

export const fonts = {
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  semibold: "Poppins-SemiBold",
  bold: "Poppins-Bold",
  extraBold: "Poppins-ExtraBold",
  logo: "Galgo",
};

export const typography: Record<string, TextStyle> = {
  body: { fontFamily: fonts.regular },
  medium: { fontFamily: fonts.medium },
  semibold: { fontFamily: fonts.semibold },
  bold: { fontFamily: fonts.bold },
  logo: { fontFamily: fonts.logo },
};

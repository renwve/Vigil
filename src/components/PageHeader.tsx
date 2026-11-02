
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/ThemeContext";
import { fonts } from "../theme";

interface PageHeaderProps {
  onLogout?: () => void;
  loggingOut?: boolean;
}

export default function PageHeader({
  onLogout,
  loggingOut = false,
}: PageHeaderProps) {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={[colors.surfaceElevated, colors.background]}
      style={[
        styles.header,
        { borderBottomColor: colors.border },
      ]}
    >
      <View>
        <Text style={[styles.logo, { color: colors.text }]}>
          VIGIL
        </Text>

        <Text style={[styles.subtitle, { color: colors.muted }]}>
          SECURITY SERVICES
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 52,
    paddingBottom: 18,
    paddingHorizontal: 22,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
  },

  logo: {
    fontFamily: fonts.logo,
    fontSize: 35,
    letterSpacing: 2,
  },

  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 8,
    letterSpacing: 2,
  },

  logout: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },

  logoutText: {
    fontFamily: fonts.bold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
});

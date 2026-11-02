
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { auth } from "../../lib/firebase";
import { logoutUser } from "../../services/auth";
import PageHeader from "../../components/PageHeader";
import { useTheme } from "../../context/ThemeContext";
import { fonts, palette } from "../../theme";

function Row({
  icon,
  title,
  subtitle,
  onPress,
  colors,
}: any) {
  const s = styles(colors);

  return (
    <TouchableOpacity
      style={s.row}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={s.rowIcon}>
        <Ionicons
          name={icon}
          size={19}
          color={palette.brand}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={s.rowTitle}>{title}</Text>

        {!!subtitle && (
          <Text style={s.rowSub}>{subtitle}</Text>
        )}
      </View>

      <Ionicons
        name="chevron-forward"
        size={17}
        color={colors.muted}
      />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { colors, mode, toggleMode } = useTheme();
  const router = useRouter();
  const user = auth.currentUser;

  const s = styles(colors);

  const comingSoon = (name: string) =>
    Alert.alert(
      name,
      `${name} will be available in a future update.`
    );

  const handleLogout = () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            try {
              await logoutUser();
              router.replace("/");
            } catch {
              Alert.alert(
                "Logout failed",
                "Please try again."
              );
            }
          },
        },
      ]
    );
  };

  return (
    <View style={s.container}>
      <PageHeader />

      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.title}>
          My Profile
        </Text>

        <View style={s.profileCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>
              {(user?.displayName || user?.email || "V")
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={s.name}>
              {user?.displayName || "Vigil member"}
            </Text>

            <Text style={s.email}>
              {user?.email || "No email available"}
            </Text>

            <Text style={s.member}>
              VIGIL ACCOUNT
            </Text>
          </View>
        </View>

        <Text style={s.section}>
          ACCOUNT
        </Text>

        <View style={s.group}>
          <Row
            icon="person-outline"
            title="Personal information"
            subtitle="Name and email address"
            onPress={() =>
              comingSoon("Personal information")
            }
            colors={colors}
          />

          <View style={s.separator} />

          <Row
            icon="time-outline"
            title="Booking history"
            subtitle="View upcoming and past requests"
            onPress={() =>
              router.push("/(tabs)/book")
            }
            colors={colors}
          />

          <View style={s.separator} />

          <Row
            icon="card-outline"
            title="Payment information"
            subtitle="Manage payment methods"
            onPress={() =>
              comingSoon("Payment information")
            }
            colors={colors}
          />
        </View>

        <Text style={s.section}>
          PREFERENCES
        </Text>

        <View style={s.group}>
          <View style={s.row}>
            <View style={s.rowIcon}>
              <Ionicons
                name={
                  mode === "dark"
                    ? "moon-outline"
                    : "sunny-outline"
                }
                size={19}
                color={palette.brand}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>
                Dark mode
              </Text>

              <Text style={s.rowSub}>
                {mode === "dark"
                  ? "Dark appearance enabled"
                  : "Light appearance enabled"}
              </Text>
            </View>

            <Switch
              value={mode === "dark"}
              onValueChange={toggleMode}
              trackColor={{
                false: colors.border,
                true: palette.brand,
              }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={s.separator} />

          <Row
            icon="notifications-outline"
            title="Notifications"
            subtitle="Booking and account alerts"
            onPress={() =>
              router.push("/(tabs)/alerts")
            }
            colors={colors}
          />

          <View style={s.separator} />

          <Row
            icon="shield-checkmark-outline"
            title="Privacy & security"
            subtitle="Account protection settings"
            onPress={() =>
              comingSoon("Privacy & security")
            }
            colors={colors}
          />
        </View>

        <TouchableOpacity
          style={s.logout}
          onPress={handleLogout}
          activeOpacity={0.75}
        >
          <Ionicons
            name="log-out-outline"
            size={18}
            color="#D94A55"
          />

          <Text style={s.logoutText}>
            Log out
          </Text>
        </TouchableOpacity>

        <Text style={s.version}>
          VIGIL · YOUR SAFETY, OUR PRIORITY
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = (c: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },

    scrollView: {
      flex: 1,
    },

    content: {
      padding: 21,
      paddingBottom: 30,
    },

    title: {
      color: c.text,
      fontFamily: fonts.bold,
      fontSize: 29,
      marginTop: 0,
      marginBottom: 18,
    },

    profileCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 18,
      padding: 17,
      marginBottom: 25,
    },

    avatar: {
      width: 58,
      height: 58,
      borderRadius: 20,
      backgroundColor: palette.brand,
      alignItems: "center",
      justifyContent: "center",
    },

    avatarText: {
      color: "#fff",
      fontFamily: fonts.bold,
      fontSize: 25,
    },

    name: {
      color: c.text,
      fontFamily: fonts.bold,
      fontSize: 15,
    },

    email: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 10,
      marginTop: 3,
    },

    member: {
      color: palette.brand,
      fontFamily: fonts.bold,
      fontSize: 8,
      letterSpacing: 1,
      marginTop: 7,
    },

    section: {
      color: c.muted,
      fontFamily: fonts.bold,
      fontSize: 9,
      letterSpacing: 1.4,
      marginBottom: 10,
      marginTop: 2,
    },

    group: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 16,
      paddingHorizontal: 13,
      marginBottom: 23,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 69,
      gap: 12,
    },

    rowIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: c.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },

    rowTitle: {
      color: c.text,
      fontFamily: fonts.semibold,
      fontSize: 12,
    },

    rowSub: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 10,
      marginTop: 4,
    },

    separator: {
      height: 1,
      backgroundColor: c.border,
    },

    logout: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 9,
      minHeight: 49,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: "#D94A55",
      marginTop: 3,
    },

    logoutText: {
      color: "#D94A55",
      fontFamily: fonts.bold,
      fontSize: 11,
    },

    version: {
      color: c.muted,
      fontFamily: fonts.medium,
      fontSize: 8,
      letterSpacing: 1,
      textAlign: "center",
      marginTop: 24,
    },
  });

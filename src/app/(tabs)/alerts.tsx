import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SecurityBooking, subscribeToBookings } from "../../services/bookings";
import { useTheme } from "../../context/ThemeContext";
import { fonts, palette } from "../../theme";

export default function AlertsScreen() {
  const { colors } = useTheme();
  const [bookings, setBookings] = useState<SecurityBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      return subscribeToBookings(
        (items) => {
          setBookings(items);
          setLoading(false);
        },
        () => setLoading(false)
      );
    } catch {
      setLoading(false);
    }
  }, []);

  const s = styles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.eyebrow}>STAY IN THE LOOP</Text>
      <Text style={s.title}>Alerts</Text>
      <Text style={s.subtitle}>Updates about your security requests.</Text>

      {loading ? (
        <ActivityIndicator color={palette.brand} style={{ marginTop: 40 }} />
      ) : bookings.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="notifications-outline" size={34} color={palette.brand} />
          <Text style={s.emptyTitle}>You're all caught up</Text>
          <Text style={s.emptyText}>Booking updates will appear here.</Text>
        </View>
      ) : (
        bookings.map((b) => (
          <View key={b.id} style={s.alertCard}>
            <View style={s.iconWrap}>
              <Ionicons name="calendar-outline" size={20} color={palette.brand} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>
                {b.status === "Pending"
                  ? "Booking created · Pending"
                  : `Booking ${String(b.status || "Pending").toLowerCase()}`}
              </Text>
              <Text style={s.alertBody}>
                {b.status === "Pending"
                  ? "Your request has been received and is waiting for admin confirmation."
                  : `Your booking request status is now ${b.status}.`}
              </Text>
              <Text style={s.alertMeta}>
                {b.date} · {b.startTime}–{b.endTime}
              </Text>
            </View>
            <View
              style={[
                s.dot,
                {
                  backgroundColor:
                    b.status === "Confirmed"
                      ? "#159A72"
                      : b.status === "Declined"
                        ? "#D94A55"
                        : palette.brand,
                },
              ]}
            />
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = (c: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    content: { padding: 21, paddingBottom: 35 },
    eyebrow: {
      color: palette.brand,
      fontFamily: fonts.bold,
      fontSize: 9,
      letterSpacing: 1.5,
      marginTop: 12,
    },
    title: { color: c.text, fontFamily: fonts.bold, fontSize: 29, marginTop: 5 },
    subtitle: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 12,
      marginTop: 5,
      marginBottom: 22,
    },
    alertCard: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 16,
      padding: 15,
      marginBottom: 12,
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: 13,
      backgroundColor: c.surfaceElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    alertTitle: { color: c.text, fontFamily: fonts.semibold, fontSize: 12 },
    alertBody: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 10,
      lineHeight: 16,
      marginTop: 4,
    },
    alertMeta: { color: palette.brand, fontFamily: fonts.medium, fontSize: 9, marginTop: 8 },
    dot: { width: 7, height: 7, borderRadius: 4, marginTop: 5 },
    empty: {
      alignItems: "center",
      padding: 30,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 17,
      marginTop: 15,
    },
    emptyTitle: { color: c.text, fontFamily: fonts.semibold, fontSize: 14, marginTop: 12 },
    emptyText: { color: c.muted, fontFamily: fonts.regular, fontSize: 11, marginTop: 6 },
  });
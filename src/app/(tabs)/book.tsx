import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { logoutUser } from "../../services/auth";
import { SecurityBooking, subscribeToBookings } from "../../services/bookings";
import NewBookingForm from "../../components/newbooking";
import { useTheme } from "../../context/ThemeContext";
import { fonts, palette } from "../../theme";

export default function BookScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [bookings, setBookings] = useState<SecurityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    try {
      return subscribeToBookings(
        setBookings,
        (e) => {
          console.error(e);
          setLoading(false);
          Alert.alert(
            "Unable to load bookings",
            "Please check your connection and try again."
          );
        }
      );
    } catch (e) {
      setLoading(false);
      Alert.alert("Please sign in", "Your session may have expired.", [
        { text: "OK", onPress: () => router.replace("/") },
      ]);
    }
  }, []);

  useEffect(() => {
    if (bookings.length >= 0) setLoading(false);
  }, [bookings]);

  const now = new Date();
  const upcoming = useMemo(
    () =>
      bookings
        .filter((b) => new Date(`${b.date}T${b.startTime}`) >= now)
        .sort(
          (a, b) =>
            a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
        ),
    [bookings]
  );
  const past = useMemo(
    () =>
      bookings
        .filter((b) => new Date(`${b.date}T${b.startTime}`) < now)
        .sort(
          (a, b) =>
            b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime)
        ),
    [bookings]
  );
  const s = styles(colors);

  const formatDate = (d: string) =>
    new Date(`${d}T12:00:00`).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const statusStyle = (status: string) =>
    status === "Confirmed"
      ? { bg: "#DDF7EC", fg: "#147A58" }
      : status === "Declined"
        ? { bg: "#FCE6E7", fg: "#B42E3A" }
        : { bg: "#FFF0D5", fg: "#96600C" };

  const renderBooking = ({ item }: { item: SecurityBooking }) => {
    const status = statusStyle(item.status || "Pending");

    return (
      <View style={s.bookingCard}>
        <View style={s.bookingTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.bookingDate}>{formatDate(item.date)}</Text>
            <Text style={s.bookingTime}>
              {formatTime(item.startTime)} – {formatTime(item.endTime)}
            </Text>
          </View>
          <View style={[s.badge, { backgroundColor: status.bg }]}>
            <Text style={[s.badgeText, { color: status.fg }]}>
              {(item.status || "Pending").toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={s.divider} />
        <Text style={s.label}>LOCATION</Text>
        <Text style={s.value}>{item.address}</Text>
        <View style={{ flexDirection: "row", gap: 25 }}>
          <View>
            <Text style={s.label}>GUARDS</Text>
            <Text style={s.value}>{item.guardsNeeded || item.guards}</Text>
          </View>
          <View>
            <Text style={s.label}>REQUEST STATUS</Text>
            <Text style={s.value}>{item.status || "Pending"}</Text>
          </View>
        </View>
        {!!item.details && (
          <>
            <Text style={s.label}>SERVICE DETAILS</Text>
            <Text style={s.value}>{item.details}</Text>
          </>
        )}
        {!!item.instructions && (
          <>
            <Text style={s.label}>SPECIAL INSTRUCTIONS</Text>
            <Text style={s.value}>{item.instructions}</Text>
          </>
        )}
      </View>
    );
  };

  if (showNew)
    return (
      <NewBookingForm
        onCancel={() => setShowNew(false)}
        onSuccess={() => setShowNew(false)}
      />
    );

  return (
    <View style={s.container}>
      <LinearGradient colors={[colors.surfaceElevated, colors.background]} style={s.header}>
        <View>
          <Text style={s.logo}>VIGIL</Text>
          <Text style={s.headerSubtitle}>SECURITY SERVICES</Text>
        </View>
        <TouchableOpacity
          style={s.logout}
          disabled={loggingOut}
          onPress={async () => {
            try {
              setLoggingOut(true);
              await logoutUser();
              router.replace("/");
            } catch {
              setLoggingOut(false);
              Alert.alert("Logout failed", "Please try again.");
            }
          }}
        >
          <Text style={s.logoutText}>{loggingOut ? "..." : "LOG OUT"}</Text>
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={upcoming}
        keyExtractor={(i) => i.id}
        renderItem={renderBooking}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={s.pageHeading}>
              <Text style={s.pageTitle}>Your bookings</Text>
              <Text style={s.pageSubtitle}>Your security, scheduled.</Text>
            </View>
            <TouchableOpacity onPress={() => setShowNew(true)} activeOpacity={0.85}>
              <LinearGradient
                colors={[palette.brand, palette.brandDark]}
                style={s.newButton}
              >
                <Text style={s.plus}>＋</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.newTitle}>BOOK A SECURITY SERVICE</Text>
                  <Text style={s.newSub}>Schedule a new booking request</Text>
                </View>
                <Text style={s.arrow}>›</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>UPCOMING BOOKINGS</Text>
              <Text style={s.count}>{upcoming.length}</Text>
            </View>
            {loading ? (
              <ActivityIndicator color={palette.brand} size="large" style={{ margin: 30 }} />
            ) : upcoming.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.emptyIcon}>◷</Text>
                <Text style={s.emptyTitle}>Nothing scheduled yet</Text>
                <Text style={s.emptyText}>
                  Your new booking requests will appear here.
                </Text>
              </View>
            ) : null}
          </>
        }
        ListFooterComponent={
          <>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>PAST BOOKINGS</Text>
              <Text style={s.count}>{past.length}</Text>
            </View>
            {past.length ? (
              past.map((b) => <View key={b.id}>{renderBooking({ item: b })}</View>)
            ) : (
              <Text style={s.emptyPast}>No past bookings to show.</Text>
            )}
            <Text style={s.footer}>VIGIL · YOUR SAFETY, OUR PRIORITY</Text>
          </>
        }
      />
    </View>
  );
}

const styles = (c: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      paddingTop: 52,
      paddingBottom: 18,
      paddingHorizontal: 22,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    logo: { color: c.text, fontFamily: fonts.logo, fontSize: 35, letterSpacing: 2 },
    headerSubtitle: { color: c.muted, fontFamily: fonts.medium, fontSize: 8, letterSpacing: 2 },
    logout: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingVertical: 9,
      paddingHorizontal: 12,
    },
    logoutText: { color: c.text, fontFamily: fonts.bold, fontSize: 9, letterSpacing: 0.8 },
    list: { paddingHorizontal: 20, paddingBottom: 30 },
    pageHeading: { marginTop: 24, marginBottom: 18 },
    pageTitle: { color: c.text, fontFamily: fonts.bold, fontSize: 28 },
    pageSubtitle: { color: c.muted, fontFamily: fonts.regular, fontSize: 12, marginTop: 5 },
    newButton: {
      minHeight: 78,
      borderRadius: 16,
      paddingHorizontal: 17,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 28,
    },
    plus: { color: "#fff", fontSize: 28, marginRight: 14 },
    newTitle: { color: "#fff", fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.6 },
    newSub: {
      color: "rgba(255,255,255,0.82)",
      fontFamily: fonts.regular,
      fontSize: 10,
      marginTop: 5,
    },
    arrow: { color: "#fff", fontSize: 28, marginLeft: 8 },
    sectionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 13,
      marginTop: 3,
    },
    sectionTitle: { color: c.muted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.1 },
    count: { color: palette.brand, fontFamily: fonts.bold, fontSize: 12 },
    empty: {
      backgroundColor: c.surface,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: c.border,
      padding: 26,
      alignItems: "center",
      marginBottom: 25,
    },
    emptyIcon: { color: palette.brand, fontSize: 32, marginBottom: 10 },
    emptyTitle: { color: c.text, fontFamily: fonts.semibold, fontSize: 14 },
    emptyText: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 11,
      lineHeight: 18,
      textAlign: "center",
      marginTop: 7,
    },
    bookingCard: {
      backgroundColor: c.surface,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: c.border,
      padding: 16,
      marginBottom: 13,
    },
    bookingTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 10,
    },
    bookingDate: { color: c.text, fontFamily: fonts.bold, fontSize: 14 },
    bookingTime: { color: palette.brand, fontFamily: fonts.medium, fontSize: 11, marginTop: 5 },
    badge: { borderRadius: 7, paddingHorizontal: 9, paddingVertical: 6 },
    badgeText: { fontFamily: fonts.bold, fontSize: 8, letterSpacing: 0.5 },
    divider: { height: 1, backgroundColor: c.border, marginVertical: 14 },
    label: {
      color: c.muted,
      fontFamily: fonts.bold,
      fontSize: 9,
      letterSpacing: 1,
      marginTop: 9,
      marginBottom: 4,
    },
    value: { color: c.text, fontFamily: fonts.regular, fontSize: 12, lineHeight: 18 },
    emptyPast: { color: c.muted, fontFamily: fonts.regular, fontSize: 11, marginBottom: 20 },
    footer: {
      color: c.muted,
      fontFamily: fonts.medium,
      fontSize: 8,
      letterSpacing: 1,
      textAlign: "center",
      marginTop: 24,
    },
  });

import React, { useEffect, useState } from "react";
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

import { logoutUser } from "../../../services/auth";
import {
  SecurityBooking,
  subscribeToBookings,
} from "../../../services/bookings";
import NewBookingForm from "../../../components/newbooking";

const COLORS = {
  background: "#050F1D",
  panel: "#0B1B2B",
  cyan: "#08A9E8",
  blue: "#0577B5",
  white: "#F4F8FC",
  muted: "#647A93",
  border: "#18334A",
  green: "#55D6A2",
};

export default function BookScreen() {
  const [bookings, setBookings] = useState<SecurityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showNewBooking, setShowNewBooking] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToBookings(
      (updatedBookings) => {
        setBookings(updatedBookings);
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load bookings:", error);
        setLoading(false);
        Alert.alert(
          "Unable to load bookings",
          "Please check your connection and try again."
        );
      }
    );

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logoutUser();
      const { router } = await import("expo-router");
      router.replace("/");
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Logout failed", "Please try again.");
      setLoggingOut(false);
    }
  };

  const upcomingBookings = bookings
    .filter((booking) => {
      const date = new Date(`${booking.date}T${booking.startTime}`);
      return date >= new Date();
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
      return dateA - dateB;
    });

  const pastBookings = bookings
    .filter((booking) => {
      const date = new Date(`${booking.date}T${booking.startTime}`);
      return date < new Date();
    })
    .sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`).getTime();
      const dateB = new Date(`${b.date}T${b.startTime}`).getTime();
      return dateB - dateA;
    });

  const formatDate = (dateString: string) => {
    const date = new Date(`${dateString}T00:00:00`);

    return date.toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const renderBooking = ({
    item,
  }: {
    item: SecurityBooking;
  }) => {
    const isUpcoming =
      new Date(`${item.date}T${item.startTime}`) >= new Date();

    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingTopRow}>
          <View>
            <Text style={styles.bookingDate}>
              {formatDate(item.date)}
            </Text>
            <Text style={styles.bookingTime}>
              {formatTime(item.startTime)} – {formatTime(item.endTime)}
            </Text>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isUpcoming
                  ? "rgba(85, 214, 162, 0.12)"
                  : "rgba(100, 122, 147, 0.15)",
              },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isUpcoming ? COLORS.green : COLORS.muted },
              ]}
            >
              {isUpcoming ? "UPCOMING" : "COMPLETED"}
            </Text>
          </View>
        </View>

        <View style={styles.bookingDivider} />

        <Text style={styles.detailLabel}>LOCATION</Text>
        <Text style={styles.detailValue}>{item.address}</Text>

        <View style={styles.bookingInfoRow}>
          <View style={styles.bookingInfoItem}>
            <Text style={styles.detailLabel}>GUARDS</Text>
            <Text style={styles.detailValue}>
              {item.guards}
            </Text>
          </View>
        </View>

        {item.details ? (
          <>
            <Text style={styles.detailLabel}>SERVICE DETAILS</Text>
            <Text style={styles.detailValue}>{item.details}</Text>
          </>
        ) : null}

        {item.instructions ? (
          <>
            <Text style={styles.detailLabel}>SPECIAL INSTRUCTIONS</Text>
            <Text style={styles.detailValue}>{item.instructions}</Text>
          </>
        ) : null}
      </View>
    );
  };

  if (showNewBooking) {
    return (
      <NewBookingForm
        onCancel={() => setShowNewBooking(false)}
        onSuccess={() => setShowNewBooking(false)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0B2034", COLORS.background]}
        style={styles.header}
      >
        <View>
          <Text style={styles.logo}>VIGIL</Text>
          <Text style={styles.headerSubtitle}>
            SECURITY SERVICES
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.logoutText}>LOG OUT</Text>
          )}
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={upcomingBookings}
        keyExtractor={(item) => item.id}
        renderItem={renderBooking}
        ListHeaderComponent={
          <View>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.pageTitle}>Your bookings</Text>
                <Text style={styles.pageSubtitle}>
                  Your security, scheduled.
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setShowNewBooking(true)}
            >
              <LinearGradient
                colors={[COLORS.cyan, COLORS.blue]}
                style={styles.newBookingButton}
              >
                <Text style={styles.newBookingPlus}>＋</Text>
                <View style={styles.newBookingButtonTextContainer}>
                  <Text style={styles.newBookingButtonTitle}>
                    BOOK A SECURITY SERVICE
                  </Text>
                  <Text style={styles.newBookingButtonSubtitle}>
                    Schedule a new booking
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.listSectionHeader}>
              <Text style={styles.sectionTitle}>UPCOMING BOOKINGS</Text>
              <Text style={styles.countText}>
                {upcomingBookings.length}
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator
                color={COLORS.cyan}
                size="large"
                style={styles.loader}
              />
            ) : upcomingBookings.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>◷</Text>
                <Text style={styles.emptyStateTitle}>
                  Nothing scheduled yet
                </Text>
                <Text style={styles.emptyStateText}>
                  Your upcoming security bookings will appear here.
                </Text>
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={loading ? null : <View />}
        ListFooterComponent={
          <View>
            <View style={styles.listSectionHeader}>
              <Text style={styles.sectionTitle}>PAST BOOKINGS</Text>
              <Text style={styles.countText}>{pastBookings.length}</Text>
            </View>

            {loading ? null : pastBookings.length === 0 ? (
              <Text style={styles.noPastBookings}>
                No past bookings to show.
              </Text>
            ) : (
              pastBookings.map((booking) => (
                <View key={booking.id}>
                  {renderBooking({ item: booking })}
                </View>
              ))
            )}

            <Text style={styles.footerText}>
              VIGIL  ·  YOUR SAFETY, OUR PRIORITY
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 58,
    paddingBottom: 22,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  logo: {
    color: COLORS.white,
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: 5,
  },
  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 2.5,
    marginTop: 4,
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 76,
    alignItems: "center",
  },
  logoutText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  listContent: {
    paddingHorizontal: 22,
    paddingBottom: 32,
  },
  sectionHeader: {
    marginTop: 28,
    marginBottom: 22,
  },
  pageTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "800",
  },
  pageSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 7,
  },
  newBookingButton: {
    minHeight: 76,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  newBookingPlus: {
    color: COLORS.white,
    fontSize: 29,
    marginRight: 15,
  },
  newBookingButtonTextContainer: {
    flex: 1,
  },
  newBookingButtonTitle: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  newBookingButtonSubtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    marginTop: 5,
  },
  listSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
    marginTop: 4,
  },
  sectionTitle: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.8,
  },
  countText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: "700",
  },
  loader: {
    marginVertical: 40,
  },
  emptyState: {
    backgroundColor: COLORS.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 22,
    paddingVertical: 30,
    alignItems: "center",
    marginBottom: 28,
  },
  emptyStateIcon: {
    color: COLORS.cyan,
    fontSize: 35,
    marginBottom: 12,
  },
  emptyStateTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyStateText: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
  },
  bookingCard: {
    backgroundColor: COLORS.panel,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 14,
  },
  bookingTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  bookingDate: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
  },
  bookingTime: {
    color: COLORS.cyan,
    fontSize: 12,
    marginTop: 6,
  },
  statusBadge: {
    borderRadius: 7,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  bookingDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  detailLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: 10,
    marginBottom: 5,
  },
  detailValue: {
    color: COLORS.white,
    fontSize: 13,
    lineHeight: 20,
  },
  bookingInfoRow: {
    flexDirection: "row",
    marginTop: 8,
  },
  bookingInfoItem: {
    flex: 1,
  },
  noPastBookings: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 25,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1.4,
    textAlign: "center",
    marginTop: 25,
  },
});


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
import {
  SecurityBooking,
  subscribeToBookings,
  cancelBooking,
} from "../../services/bookings";
import NewBookingForm from "../../components/newbooking";
import PageHeader from "../../components/PageHeader";
import { useTheme } from "../../context/ThemeContext";
import { fonts, palette } from "../../theme";

export default function BookScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  const [bookings, setBookings] = useState<SecurityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [expandedBookingId, setExpandedBookingId] =
    useState<string | null>(null);

  const [cancelingId, setCancelingId] =
    useState<string | null>(null);

  useEffect(() => {
    try {
      return subscribeToBookings(
        (items) => {
          setBookings(items);
          setLoading(false);
        },
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

      Alert.alert(
        "Please sign in",
        "Your session may have expired.",
        [
          {
            text: "OK",
            onPress: () => router.replace("/"),
          },
        ]
      );
    }
  }, []);

  const upcoming = useMemo(() => {
    const now = new Date();

    return bookings
      .filter(
        (b) =>
          new Date(`${b.date}T${b.startTime}`) >= now &&
          b.status !== "Cancelled"
      )
      .sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.startTime.localeCompare(b.startTime)
      );
  }, [bookings]);

  const past = useMemo(() => {
    const now = new Date();

    return bookings
      .filter(
        (b) =>
          new Date(`${b.date}T${b.startTime}`) < now ||
          b.status === "Cancelled"
      )
      .sort(
        (a, b) =>
          b.date.localeCompare(a.date) ||
          b.startTime.localeCompare(a.startTime)
      );
  }, [bookings]);

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

    return d.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const statusStyle = (status: string) =>
    status === "Confirmed"
      ? { bg: "#DDF7EC", fg: "#147A58" }
      : status === "Declined"
        ? { bg: "#FCE6E7", fg: "#B42E3A" }
        : status === "Cancelled"
          ? { bg: "#E7E7E7", fg: "#666666" }
          : { bg: "#FFF0D5", fg: "#96600C" };

  const toggleExpanded = (id: string) => {
    setExpandedBookingId((current) =>
      current === id ? null : id
    );
  };

  const handleCancel = (item: SecurityBooking) => {
    if (cancelingId) return;

    Alert.alert(
      "Cancel booking?",
      "Are you sure you want to cancel this security booking? This action cannot be undone.",
      [
        {
          text: "Keep booking",
          style: "cancel",
        },
        {
          text: "Yes, cancel booking",
          style: "destructive",
          onPress: async () => {
            try {
              setCancelingId(item.id);

              await cancelBooking(item.id);

              setExpandedBookingId(null);

              Alert.alert(
                "Booking cancelled",
                "Your booking has been successfully cancelled."
              );
            } catch (error: any) {
              Alert.alert(
                "Cancellation failed",
                error?.message ||
                  "Unable to cancel your booking. Please try again."
              );
            } finally {
              setCancelingId(null);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logoutUser();
      router.replace("/");
    } catch {
      setLoggingOut(false);
      Alert.alert("Logout failed", "Please try again.");
    }
  };

  const Info = ({
    label,
    value,
  }: {
    label: string;
    value?: string | number | boolean | null;
  }) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return null;
    }

    return (
      <View style={s.infoItem}>
        <Text style={s.label}>{label}</Text>

        <Text style={s.value}>
          {typeof value === "boolean"
            ? value
              ? "Yes"
              : "No"
            : String(value)}
        </Text>
      </View>
    );
  };

  const renderBooking = ({
    item,
  }: {
    item: SecurityBooking;
  }) => {
    const status = statusStyle(item.status || "Pending");
    const expanded = expandedBookingId === item.id;
    const isCancelling = cancelingId === item.id;
    const cancelled = item.status === "Cancelled";

    return (
      <View style={s.bookingCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => toggleExpanded(item.id)}
          style={s.cardHeader}
        >
          <View style={s.cardMain}>
            <Text style={s.bookingDate}>
              {item.eventType || "Security booking"}
            </Text>

            <Text style={s.bookingTime}>
              {formatDate(item.date)} ·{" "}
              {formatTime(item.startTime)} –{" "}
              {formatTime(item.endTime)}
            </Text>

            <Text style={s.cardSubtitle} numberOfLines={1}>
              {item.serviceType || "General security"} ·{" "}
              {item.guardsNeeded || item.guards} guard(s)
            </Text>
          </View>

          <View style={s.cardRight}>
            <View
              style={[
                s.badge,
                { backgroundColor: status.bg },
              ]}
            >
              <Text
                style={[
                  s.badgeText,
                  { color: status.fg },
                ]}
              >
                {(item.status || "Pending").toUpperCase()}
              </Text>
            </View>

            <Text style={s.expandIcon}>
              {expanded ? "⌃" : "⌄"}
            </Text>
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={s.expandedContent}>
            <View style={s.divider} />

            <Text style={s.sectionHeading}>
              BOOKING INFORMATION
            </Text>

            <Info label="EVENT TYPE" value={item.eventType} />
            <Info
              label="SECURITY SERVICE"
              value={item.serviceType}
            />
            <Info
              label="DATE"
              value={formatDate(item.date)}
            />
            <Info
              label="TIME"
              value={`${formatTime(item.startTime)} – ${formatTime(item.endTime)}`}
            />
            <Info
              label="SERVICE ADDRESS"
              value={item.address}
            />
            <Info
              label="NUMBER OF GUARDS"
              value={item.guardsNeeded || item.guards}
            />
            <Info
              label="STATUS"
              value={item.status || "Pending"}
            />

            <View style={s.divider} />

            <Text style={s.sectionHeading}>
              GUARD PREFERENCES
            </Text>

            <Info
              label="UNIFORM PREFERENCE"
              value={
                item.uniformRequired === undefined
                  ? "Not specified"
                  : item.uniformRequired
                    ? "Uniformed guards"
                    : "Non-uniformed guards"
              }
            />

            <Info
              label="PRIVATE INVESTIGATION"
              value={item.privateInvestigation}
            />

            <Info
              label="INVESTIGATION DETAILS"
              value={item.investigationDetails}
            />

            {!!item.movingFrom && (
              <>
                <View style={s.divider} />

                <Text style={s.sectionHeading}>
                  MOVING SECURITY
                </Text>

                <Info
                  label="PICKUP ADDRESS"
                  value={item.movingFrom}
                />

                <Info
                  label="DESTINATION ADDRESS"
                  value={item.movingTo}
                />

                <Info
                  label="MOVING DATE / ARRANGEMENTS"
                  value={item.movingDate}
                />

                <Info
                  label="BUILDING ACCESS"
                  value={item.movingAccess}
                />

                <Info
                  label="ITEMS TO PROTECT"
                  value={item.itemsToProtect}
                />
              </>
            )}

            {item.vipRequired && (
              <>
                <View style={s.divider} />

                <Text style={s.sectionHeading}>
                  VIP PROTECTION
                </Text>

                <Info
                  label="VIP NAMES"
                  value={item.vipNames}
                />

                <Info
                  label="PROTECTION REQUIREMENTS"
                  value={item.vipDetails}
                />
              </>
            )}

            {item.alcoholServed && (
              <>
                <View style={s.divider} />

                <Text style={s.sectionHeading}>
                  ALCOHOL-RELATED SECURITY
                </Text>

                <Info
                  label="QUALIFICATION PREFERENCE"
                  value={item.alcoholCredential}
                />

                <Info
                  label="ADDITIONAL REQUIREMENTS"
                  value={item.alcoholRequirements}
                />
              </>
            )}

            <Info
              label="EXPECTED ATTENDEES"
              value={item.expectedGuests}
            />

            <Info
              label="AGE RESTRICTIONS"
              value={item.ageRestrictions}
            />

            <Info
              label="ACCESS REQUIREMENTS"
              value={item.accessRequirements}
            />

            {!!item.details && (
              <>
                <View style={s.divider} />

                <Text style={s.sectionHeading}>
                  GENERAL SERVICE DETAILS
                </Text>

                <Text style={s.value}>
                  {item.details}
                </Text>
              </>
            )}

            {!!item.instructions && (
              <>
                <Text style={s.label}>
                  SPECIAL INSTRUCTIONS
                </Text>

                <Text style={s.value}>
                  {item.instructions}
                </Text>
              </>
            )}

            {!cancelled && (
              <TouchableOpacity
                style={s.cancelBookingButton}
                activeOpacity={0.8}
                disabled={!!cancelingId}
                onPress={() => handleCancel(item)}
              >
                {isCancelling ? (
                  <ActivityIndicator color="#B42E3A" />
                ) : (
                  <Text style={s.cancelBookingText}>
                    CANCEL BOOKING
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {cancelled && (
              <View style={s.cancelledNote}>
                <Text style={s.cancelledNoteText}>
                  This booking has been cancelled.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (showNew) {
    return (
      <NewBookingForm
        onCancel={() => setShowNew(false)}
        onSuccess={() => setShowNew(false)}
      />
    );
  }

  return (
    <View style={s.container}>
      <PageHeader
        onLogout={handleLogout}
        loggingOut={loggingOut}
      />

      <FlatList
        data={upcoming}
        keyExtractor={(i) => i.id}
        renderItem={renderBooking}
        contentContainerStyle={s.list}
        showsVerticalScrollIndicator={false}
        extraData={{ expandedBookingId, cancelingId }}
        ListHeaderComponent={
          <>
            <View style={s.pageHeading}>
              <Text style={s.pageTitle}>
                My Bookings
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => setShowNew(true)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[palette.brand, palette.brandDark]}
                style={s.newButton}
              >
                <Text style={s.plus}>＋</Text>

                <View style={{ flex: 1 }}>
                  <Text style={s.newTitle}>
                    BOOK A SECURITY SERVICE
                  </Text>

                  <Text style={s.newSub}>
                    Schedule a new booking request
                  </Text>
                </View>

                <Text style={s.arrow}>›</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>
                UPCOMING BOOKINGS
              </Text>

              <Text style={s.count}>
                {upcoming.length}
              </Text>
            </View>

            {loading ? (
              <ActivityIndicator
                color={palette.brand}
                size="large"
                style={{ margin: 30 }}
              />
            ) : upcoming.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.emptyIcon}>◷</Text>

                <Text style={s.emptyTitle}>
                  Nothing scheduled yet
                </Text>

                <Text style={s.emptyText}>
                  Your new booking requests will appear here.
                </Text>
              </View>
            ) : null}
          </>
        }
        ListFooterComponent={
          <View>
            <View style={s.sectionRow}>
              <Text style={s.sectionTitle}>
                PAST BOOKINGS & CANCELLATIONS
              </Text>

              <Text style={s.count}>
                {past.length}
              </Text>
            </View>

            {past.length ? (
              past.map((b) => (
                <View key={b.id}>
                  {renderBooking({ item: b })}
                </View>
              ))
            ) : (
              <Text style={s.emptyPast}>
                No past bookings to show.
              </Text>
            )}

            <Text style={s.footer}>
              VIGIL · YOUR SAFETY, OUR PRIORITY
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = (
  c: ReturnType<typeof useTheme>["colors"]
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.background,
    },

    list: {
      paddingHorizontal: 20,
      paddingBottom: 30,
    },

    pageHeading: {
      marginTop: 21,
      marginBottom: 18,
    },

    pageTitle: {
      color: c.text,
      fontFamily: fonts.bold,
      fontSize: 28,
    },

    newButton: {
      minHeight: 78,
      borderRadius: 16,
      paddingHorizontal: 17,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 28,
    },

    plus: {
      color: "#fff",
      fontSize: 28,
      marginRight: 14,
    },

    newTitle: {
      color: "#fff",
      fontFamily: fonts.bold,
      fontSize: 11,
      letterSpacing: 0.6,
    },

    newSub: {
      color: "rgba(255,255,255,0.82)",
      fontFamily: fonts.regular,
      fontSize: 10,
      marginTop: 5,
    },

    arrow: {
      color: "#fff",
      fontSize: 28,
      marginLeft: 8,
    },

    sectionRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 13,
      marginTop: 3,
    },

    sectionTitle: {
      color: c.muted,
      fontFamily: fonts.bold,
      fontSize: 10,
      letterSpacing: 1.1,
    },

    count: {
      color: palette.brand,
      fontFamily: fonts.bold,
      fontSize: 12,
    },

    empty: {
      backgroundColor: c.surface,
      borderRadius: 17,
      borderWidth: 1,
      borderColor: c.border,
      padding: 26,
      alignItems: "center",
      marginBottom: 25,
    },

    emptyIcon: {
      color: palette.brand,
      fontSize: 32,
      marginBottom: 10,
    },

    emptyTitle: {
      color: c.text,
      fontFamily: fonts.semibold,
      fontSize: 14,
    },

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
      borderRadius: 15,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: 11,
      overflow: "hidden",
    },

    cardHeader: {
      minHeight: 94,
      paddingHorizontal: 15,
      paddingVertical: 15,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    },

    cardMain: {
      flex: 1,
    },

    bookingDate: {
      color: c.text,
      fontFamily: fonts.bold,
      fontSize: 14,
    },

    bookingTime: {
      color: palette.brand,
      fontFamily: fonts.medium,
      fontSize: 10,
      marginTop: 6,
    },

    cardSubtitle: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 10,
      marginTop: 6,
    },

    cardRight: {
      alignItems: "flex-end",
      justifyContent: "space-between",
      minHeight: 54,
    },

    badge: {
      borderRadius: 7,
      paddingHorizontal: 9,
      paddingVertical: 6,
    },

    badgeText: {
      fontFamily: fonts.bold,
      fontSize: 8,
      letterSpacing: 0.5,
    },

    expandIcon: {
      color: palette.brand,
      fontSize: 20,
      marginTop: 5,
    },

    expandedContent: {
      paddingHorizontal: 15,
      paddingBottom: 15,
    },

    divider: {
      height: 1,
      backgroundColor: c.border,
      marginVertical: 13,
    },

    sectionHeading: {
      color: palette.brand,
      fontFamily: fonts.bold,
      fontSize: 10,
      letterSpacing: 1,
      marginBottom: 8,
      marginTop: 4,
    },

    infoItem: {
      marginBottom: 5,
    },

    label: {
      color: c.muted,
      fontFamily: fonts.bold,
      fontSize: 9,
      letterSpacing: 1,
      marginTop: 9,
      marginBottom: 4,
    },

    value: {
      color: c.text,
      fontFamily: fonts.regular,
      fontSize: 12,
      lineHeight: 18,
    },

    cancelBookingButton: {
      minHeight: 46,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: "#B42E3A",
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
      backgroundColor: c.surface,
    },

    cancelBookingText: {
      color: "#B42E3A",
      fontFamily: fonts.bold,
      fontSize: 10,
      letterSpacing: 0.8,
    },

    cancelledNote: {
      marginTop: 16,
      padding: 12,
      borderRadius: 9,
      backgroundColor: c.surfaceElevated,
    },

    cancelledNoteText: {
      color: c.muted,
      fontFamily: fonts.medium,
      fontSize: 11,
      textAlign: "center",
    },

    emptyPast: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 11,
      marginBottom: 20,
    },

    footer: {
      color: c.muted,
      fontFamily: fonts.medium,
      fontSize: 8,
      letterSpacing: 1,
      textAlign: "center",
      marginTop: 24,
    },
  });

import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { createBooking, NewBooking } from "../services/bookings";
import { useTheme } from "../context/ThemeContext";
import { fonts, palette } from "../theme";
import BookingCalendar from "./BookingCalendar";

type Props = { onCancel: () => void; onSuccess: () => void };

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export default function NewBookingForm({ onCancel, onSuccess }: Props) {
  const { colors } = useTheme();
  const [date, setDate] = useState(dateKey(new Date()));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [guards, setGuards] = useState("1");
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState("");
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);
  const s = styles(colors);

  const submit = async () => {
    if (saving) return;
    const count = Number(guards);

    if (!date) {
      return Alert.alert("Choose a date", "Please select your service date.");
    }
    if (
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(startTime) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime) ||
      endTime <= startTime
    ) {
      return Alert.alert(
        "Check the time",
        "Use 24-hour times, and make sure the end time is later."
      );
    }
    if (!address.trim()) {
      return Alert.alert("Missing location", "Please enter the service address.");
    }
    if (!Number.isInteger(count) || count < 1 || count > 100) {
      return Alert.alert("Invalid number", "Enter between 1 and 100 guards.");
    }

    const parsed = new Date(`${date}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(parsed.getTime()) || parsed < today) {
      return Alert.alert("Invalid date", "Choose today or a future date.");
    }

    const booking: NewBooking = {
      date,
      eventDate: date,
      startTime,
      eventTime: startTime,
      endTime,
      guards: count,
      guardsNeeded: count,
      address: address.trim(),
      details: details.trim(),
      instructions: instructions.trim(),
    };

    try {
      setSaving(true);
      await createBooking(booking);
      Alert.alert(
        "Request submitted",
        "Your booking is now Pending. An admin must confirm it before it is approved.",
        [{ text: "OK", onPress: onSuccess }]
      );
    } catch (e: any) {
      Alert.alert(
        "Booking failed",
        e?.message || "We couldn't save your booking. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const field = (
    label: string,
    value: string,
    change: (v: string) => void,
    placeholder: string,
    options: any = {}
  ) => (
    <>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, options.multiline && s.multiline]}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={change}
        editable={!saving}
        {...options}
      />
    </>
  );

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient colors={[colors.surfaceElevated, colors.background]} style={s.header}>
        <View>
          <Text style={s.logo}>VIGIL</Text>
          <Text style={s.subtitle}>SECURITY SERVICES</Text>
        </View>
        <TouchableOpacity style={s.cancelHeader} onPress={onCancel} disabled={saving}>
          <Text style={s.cancelText}>CANCEL</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.eyebrow}>NEW REQUEST</Text>
        <Text style={s.title}>Book a service.</Text>
        <Text style={s.description}>
          Choose a date and tell us where you need security.
        </Text>

        <BookingCalendar value={date} onChange={setDate} />

        <View style={s.form}>
          <Text style={s.label}>START TIME (24-HOUR)</Text>
          <TextInput
            style={s.input}
            value={startTime}
            onChangeText={setStartTime}
            placeholder="09:00"
            placeholderTextColor={colors.muted}
            editable={!saving}
          />

          <Text style={s.label}>END TIME (24-HOUR)</Text>
          <TextInput
            style={s.input}
            value={endTime}
            onChangeText={setEndTime}
            placeholder="17:00"
            placeholderTextColor={colors.muted}
            editable={!saving}
          />

          {field("NUMBER OF GUARDS", guards, setGuards, "1", {
            keyboardType: "number-pad",
          })}
          {field("SERVICE ADDRESS", address, setAddress, "Enter the full service address", {
            autoCapitalize: "words",
          })}
          {field(
            "SERVICE DETAILS",
            details,
            setDetails,
            "What type of security service do you need?",
            { multiline: true, textAlignVertical: "top" }
          )}
          {field(
            "SPECIAL INSTRUCTIONS (OPTIONAL)",
            instructions,
            setInstructions,
            "Anything else we should know?",
            { multiline: true, textAlignVertical: "top" }
          )}

          <View style={s.pendingNote}>
            <Text style={s.pendingIcon}>◷</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.pendingTitle}>Admin confirmation required</Text>
              <Text style={s.pendingBody}>
                Your request will start as Pending. We'll update the status after review.
              </Text>
            </View>
          </View>

          <TouchableOpacity onPress={submit} disabled={saving} activeOpacity={0.85}>
            <LinearGradient colors={[palette.brand, palette.brandDark]} style={s.submit}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitText}>SUBMIT BOOKING REQUEST</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={onCancel} disabled={saving} style={s.cancelBottom}>
            <Text style={s.cancelText}>CANCEL AND GO BACK</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>VIGIL · YOUR SAFETY, OUR PRIORITY</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (c: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      paddingTop: 54,
      paddingBottom: 19,
      paddingHorizontal: 22,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    logo: { color: c.text, fontFamily: fonts.logo, fontSize: 35, letterSpacing: 2 },
    subtitle: {
      color: c.muted,
      fontFamily: fonts.medium,
      fontSize: 8,
      letterSpacing: 2,
      marginTop: -2,
    },
    cancelHeader: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 10,
      paddingVertical: 9,
      paddingHorizontal: 12,
    },
    cancelText: { color: c.muted, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 0.8 },
    content: { padding: 20, paddingBottom: 35 },
    eyebrow: { color: palette.brand, fontFamily: fonts.bold, fontSize: 10, letterSpacing: 1.5 },
    title: { color: c.text, fontFamily: fonts.bold, fontSize: 28, marginTop: 5 },
    description: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 6,
      marginBottom: 18,
    },
    form: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 18,
      padding: 17,
    },
    label: {
      color: c.muted,
      fontFamily: fonts.bold,
      fontSize: 9,
      letterSpacing: 1,
      marginBottom: 7,
      marginTop: 13,
    },
    input: {
      backgroundColor: c.input,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 11,
      minHeight: 47,
      paddingHorizontal: 13,
      paddingVertical: 11,
      color: c.text,
      fontFamily: fonts.regular,
      fontSize: 12,
    },
    multiline: { minHeight: 86, paddingTop: 12 },
    pendingNote: {
      flexDirection: "row",
      gap: 12,
      backgroundColor: c.surfaceElevated,
      borderRadius: 13,
      padding: 13,
      marginTop: 20,
    },
    pendingIcon: { color: palette.warning, fontSize: 24 },
    pendingTitle: { color: c.text, fontFamily: fonts.semibold, fontSize: 12 },
    pendingBody: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 10,
      lineHeight: 16,
      marginTop: 3,
    },
    submit: {
      minHeight: 51,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 20,
    },
    submitText: { color: "#fff", fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.8 },
    cancelBottom: { alignItems: "center", paddingVertical: 17 },
    footer: {
      color: c.muted,
      fontFamily: fonts.medium,
      fontSize: 8,
      letterSpacing: 1,
      textAlign: "center",
      marginTop: 22,
    },
  });
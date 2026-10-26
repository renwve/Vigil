
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

import {
  createBooking,
  NewBooking,
} from "../services/bookings";

type NewBookingFormProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

const COLORS = {
  background: "#050F1D",
  panel: "#0B1B2B",
  cyan: "#08A9E8",
  blue: "#0577B5",
  white: "#F4F8FC",
  muted: "#647A93",
  border: "#18334A",
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

export default function NewBookingForm({
  onCancel,
  onSuccess,
}: NewBookingFormProps) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [guards, setGuards] = useState("1");
  const [address, setAddress] = useState("");
  const [details, setDetails] = useState("");
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreateBooking = async () => {
    if (saving) return;

    const cleanDate = date.trim();
    const cleanStartTime = startTime.trim();
    const cleanEndTime = endTime.trim();
    const cleanAddress = address.trim();
    const guardCount = Number(guards);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanDate)) {
      Alert.alert("Check the date", "Use YYYY-MM-DD, for example 2026-10-30.");
      return;
    }

    const parsedDate = new Date(`${cleanDate}T00:00:00`);

    if (
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.toISOString().slice(0, 10) !== cleanDate
    ) {
      Alert.alert("Invalid date", "Please enter a real calendar date.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (parsedDate < today) {
      Alert.alert("Invalid date", "Please choose today or a future date.");
      return;
    }

    if (
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(cleanStartTime) ||
      !/^([01]\d|2[0-3]):[0-5]\d$/.test(cleanEndTime)
    ) {
      Alert.alert(
        "Check the times",
        "Enter times in 24-hour HH:MM format, for example 09:30 or 17:00."
      );
      return;
    }

    if (cleanEndTime <= cleanStartTime) {
      Alert.alert(
        "Check the time range",
        "The end time must be later than the start time."
      );
      return;
    }

    if (!cleanAddress) {
      Alert.alert("Missing location", "Please enter the service address.");
      return;
    }

    if (!Number.isInteger(guardCount) || guardCount < 1 || guardCount > 100) {
      Alert.alert("Invalid number", "Enter between 1 and 100 guards.");
      return;
    }

const booking: NewBooking = {
  date: cleanDate,
  eventDate: cleanDate,
  eventTime: cleanStartTime,
  startTime: cleanStartTime,
  endTime: cleanEndTime,
  guards: guardCount,
  guardsNeeded: guardCount,
  address: cleanAddress,
  details: details.trim(),
  instructions: instructions.trim(),
};
    setSaving(true);

    try {
      await createBooking(booking);

      Alert.alert(
        "Booking created",
        "Your security service booking has been saved.",
        [
          {
            text: "OK",
            onPress: onSuccess,
          },
        ]
      );
    } catch (error) {
      console.error("Failed to create booking:", error);
      Alert.alert(
        "Booking failed",
        error instanceof Error
          ? error.message
          : "We couldn't save your booking. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={["#0B2034", COLORS.background]}
        style={styles.header}
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.logo}>VIGIL</Text>
          <Text style={styles.headerSubtitle}>SECURITY SERVICES</Text>
        </View>

        <TouchableOpacity
          style={styles.cancelHeaderButton}
          onPress={onCancel}
          disabled={saving}
        >
          <Text style={styles.cancelHeaderText}>CANCEL</Text>
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageEyebrow}>NEW REQUEST</Text>
        <Text style={styles.pageTitle}>Book a service.</Text>
        <Text style={styles.pageSubtitle}>
          Tell us when and where you need security.
        </Text>

        <View style={styles.formCard}>
          <FieldLabel>DATE (YYYY-MM-DD)</FieldLabel>
          <TextInput
            style={styles.input}
            placeholder="2026-10-30"
            placeholderTextColor={COLORS.muted}
            value={date}
            onChangeText={setDate}
            keyboardType="numbers-and-punctuation"
            editable={!saving}
          />

          <View style={styles.twoColumnRow}>
            <View style={styles.column}>
              <FieldLabel>START TIME (24-HOUR)</FieldLabel>
              <TextInput
                style={styles.input}
                placeholder="09:00"
                placeholderTextColor={COLORS.muted}
                value={startTime}
                onChangeText={setStartTime}
                keyboardType="numbers-and-punctuation"
                editable={!saving}
              />
            </View>

            <View style={styles.column}>
              <FieldLabel>END TIME (24-HOUR)</FieldLabel>
              <TextInput
                style={styles.input}
                placeholder="17:00"
                placeholderTextColor={COLORS.muted}
                value={endTime}
                onChangeText={setEndTime}
                keyboardType="numbers-and-punctuation"
                editable={!saving}
              />
            </View>
          </View>

          <FieldLabel>NUMBER OF GUARDS</FieldLabel>
          <TextInput
            style={styles.input}
            placeholder="1"
            placeholderTextColor={COLORS.muted}
            value={guards}
            onChangeText={setGuards}
            keyboardType="number-pad"
            editable={!saving}
          />

          <FieldLabel>SERVICE ADDRESS</FieldLabel>
          <TextInput
            style={styles.input}
            placeholder="Enter the full service address"
            placeholderTextColor={COLORS.muted}
            value={address}
            onChangeText={setAddress}
            autoCapitalize="words"
            editable={!saving}
          />

          <FieldLabel>SERVICE DETAILS</FieldLabel>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="What type of security service do you need?"
            placeholderTextColor={COLORS.muted}
            value={details}
            onChangeText={setDetails}
            multiline
            textAlignVertical="top"
            editable={!saving}
          />

          <FieldLabel>SPECIAL INSTRUCTIONS (OPTIONAL)</FieldLabel>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Anything else we should know?"
            placeholderTextColor={COLORS.muted}
            value={instructions}
            onChangeText={setInstructions}
            multiline
            textAlignVertical="top"
            editable={!saving}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleCreateBooking}
            disabled={saving}
            style={styles.submitButtonWrapper}
          >
            <LinearGradient
              colors={[COLORS.cyan, COLORS.blue]}
              style={styles.submitButton}
            >
              {saving ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>
                  CREATE BOOKING
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            disabled={saving}
          >
            <Text style={styles.cancelButtonText}>CANCEL AND GO BACK</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          VIGIL  ·  YOUR SAFETY, OUR PRIORITY
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
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
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTextContainer: {
    flex: 1,
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
  cancelHeaderButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelHeaderText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 35,
  },
  pageEyebrow: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  pageTitle: {
    color: COLORS.white,
    fontSize: 29,
    fontWeight: "800",
    marginTop: 8,
  },
  pageSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  formCard: {
    backgroundColor: COLORS.panel,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
  },
  fieldLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 9,
    marginTop: 15,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 11,
    minHeight: 49,
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: COLORS.white,
    fontSize: 13,
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 12,
  },
  column: {
    flex: 1,
  },
  multilineInput: {
    minHeight: 95,
    paddingTop: 13,
  },
  submitButtonWrapper: {
    marginTop: 25,
  },
  submitButton: {
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.4,
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 17,
  },
  cancelButtonText: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 9,
    letterSpacing: 1.4,
    textAlign: "center",
    marginTop: 25,
  },
});

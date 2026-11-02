
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
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

const EVENT_OPTIONS = [
  "Apartment moving",
  "House moving",
  "Moving into a condominium",
  "Moving out of a condominium",
  "Residential property watch",
  "Home security during renovations",
  "Vacant property monitoring",
  "Neighbourhood security",
  "Estate security",
  "Birthday party",
  "House party",
  "Private celebration",
  "Engagement party",
  "Wedding",
  "Anniversary celebration",
  "Graduation party",
  "Family gathering",
  "Private dinner",
  "Holiday party",
  "Corporate party",
  "Business meeting",
  "Corporate conference",
  "Networking event",
  "Product launch",
  "Office security",
  "Executive event",
  "Bar or lounge",
  "Nightclub",
  "Alcohol-serving event",
  "Concert",
  "Music festival",
  "Live performance",
  "VIP nightlife event",
  "Sporting event",
  "Retail store security",
  "Shopping centre security",
  "Construction site security",
  "Warehouse security",
  "Parking facility security",
  "Commercial property security",
  "Personal protection",
  "Security escort",
  "Crowd control",
  "Access control",
  "Loss prevention",
  "Private investigation",
  "Other",
];

const SERVICE_OPTIONS = [
  "General security guarding",
  "Residential security",
  "Moving-day security",
  "Property protection",
  "Event security",
  "Crowd management",
  "Access control",
  "Guest screening",
  "Door supervision",
  "Personal protection",
  "VIP protection",
  "Executive protection",
  "Security escort",
  "Mobile patrol",
  "Overnight security",
  "Surveillance",
  "Loss prevention",
  "Private investigation",
  "Asset protection",
  "Construction site security",
  "Retail security",
  "Parking security",
  "Emergency security coverage",
  "Other",
];

const VIP_EVENTS = [
  "Birthday party",
  "House party",
  "Private celebration",
  "Engagement party",
  "Wedding",
  "Anniversary celebration",
  "Graduation party",
  "Family gathering",
  "Private dinner",
  "Holiday party",
  "Corporate party",
  "Corporate conference",
  "Networking event",
  "Product launch",
  "Executive event",
  "Bar or lounge",
  "Nightclub",
  "Alcohol-serving event",
  "Concert",
  "Music festival",
  "Live performance",
  "VIP nightlife event",
  "Sporting event",
];

type DropdownProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  colors: ReturnType<typeof useTheme>["colors"];
};

function Dropdown({
  label,
  value,
  options,
  onChange,
  placeholder,
  colors,
}: DropdownProps) {
  const [visible, setVisible] = useState(false);
  const s = styles(colors);

  return (
    <>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity
        style={s.dropdown}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={[s.dropdownText, !value && { color: colors.muted }]}>
          {value || placeholder || "Select an option"}
        </Text>
        <Text style={s.dropdownArrow}>⌄</Text>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <Text style={s.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={s.modalClose}>CLOSE</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    s.option,
                    value === option && s.selectedOption,
                  ]}
                  onPress={() => {
                    onChange(option);
                    setVisible(false);
                  }}
                >
                  <Text
                    style={[
                      s.optionText,
                      value === option && { color: palette.brand },
                    ]}
                  >
                    {option}
                  </Text>
                  {value === option && (
                    <Text style={s.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

type ToggleProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  colors: ReturnType<typeof useTheme>["colors"];
  description?: string;
};

function YesNoToggle({
  label,
  value,
  onChange,
  colors,
  description,
}: ToggleProps) {
  const s = styles(colors);

  return (
    <View style={s.toggleContainer}>
      <Text style={s.label}>{label}</Text>
      {!!description && (
        <Text style={s.helperText}>{description}</Text>
      )}
      <View style={s.toggleRow}>
        {[true, false].map((option) => (
          <TouchableOpacity
            key={String(option)}
            style={[
              s.toggleButton,
              value === option && s.toggleActive,
            ]}
            onPress={() => onChange(option)}
          >
            <Text
              style={[
                s.toggleText,
                value === option && s.toggleTextActive,
              ]}
            >
              {option ? "YES" : "NO"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function NewBookingForm({
  onCancel,
  onSuccess,
}: Props) {
  const { colors } = useTheme();
  const s = styles(colors);

  const [date, setDate] = useState(dateKey(new Date()));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [guards, setGuards] = useState("1");
  const [address, setAddress] = useState("");

  const [eventType, setEventType] = useState("");
  const [serviceType, setServiceType] = useState("");

  const [details, setDetails] = useState("");
  const [instructions, setInstructions] = useState("");
  const [saving, setSaving] = useState(false);

  const [uniformRequired, setUniformRequired] = useState(true);

  const [privateInvestigation, setPrivateInvestigation] =
    useState(false);
  const [investigationDetails, setInvestigationDetails] =
    useState("");

  const [vipRequired, setVipRequired] = useState(false);
  const [vipNames, setVipNames] = useState("");
  const [vipDetails, setVipDetails] = useState("");

  const [movingFrom, setMovingFrom] = useState("");
  const [movingTo, setMovingTo] = useState("");
  const [movingDate, setMovingDate] = useState("");
  const [movingAccess, setMovingAccess] = useState("");
  const [itemsToProtect, setItemsToProtect] = useState("");

  const [alcoholServed, setAlcoholServed] = useState(false);
  const [alcoholRequirements, setAlcoholRequirements] = useState("");
  const [alcoholCredential, setAlcoholCredential] = useState("");

  const [expectedGuests, setExpectedGuests] = useState("");
  const [ageRestrictions, setAgeRestrictions] = useState("");
  const [accessRequirements, setAccessRequirements] = useState("");

  const isMoving = useMemo(
    () => eventType.toLowerCase().includes("moving"),
    [eventType]
  );

  const isEvent = VIP_EVENTS.includes(eventType);

  const showAlcohol = useMemo(
    () =>
      [
        "Bar or lounge",
        "Nightclub",
        "Alcohol-serving event",
        "VIP nightlife event",
        "Corporate party",
        "Private celebration",
        "Birthday party",
        "House party",
        "Wedding",
        "Holiday party",
      ].includes(eventType),
    [eventType]
  );

  const showGuests = useMemo(
    () =>
      [
        ...VIP_EVENTS,
        "Concert",
        "Music festival",
        "Live performance",
        "Sporting event",
        "Corporate conference",
        "Networking event",
        "Product launch",
      ].includes(eventType),
    [eventType]
  );

  const field = (
    label: string,
    value: string,
    change: (v: string) => void,
    placeholder: string,
    options: TextInputProps = {}
  ) => (
    <>
      <Text style={s.label}>{label}</Text>
      <TextInput
        style={[s.input, options.multiline && s.multiline]}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        value={value}
        onChangeText={change}
        {...options}
        editable={!saving}
      />
    </>
  );

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

    if (!eventType) {
      return Alert.alert("Select an event", "Please choose the event or situation requiring security.");
    }

    if (!serviceType) {
      return Alert.alert("Select a service", "Please choose the security service you need.");
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

    if (isMoving && !movingFrom.trim()) {
      return Alert.alert("Moving address required", "Enter the current moving address.");
    }

    if (isMoving && !movingTo.trim()) {
      return Alert.alert("Destination required", "Enter the destination address.");
    }

    if (privateInvestigation && !investigationDetails.trim()) {
      return Alert.alert(
        "Investigation details",
        "Please describe what you need investigated."
      );
    }

    if (vipRequired && !vipNames.trim()) {
      return Alert.alert("VIP information", "Please enter the VIP names or identifying information.");
    }

    if (alcoholServed && !alcoholCredential.trim()) {
      return Alert.alert(
        "Qualification requirements",
        "Please specify the alcohol-related qualification or credential requirements."
      );
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

      eventType,
      serviceType,
      uniformRequired,
      privateInvestigation,
      investigationDetails: investigationDetails.trim(),

      vipRequired,
      vipNames: vipRequired ? vipNames.trim() : "",
      vipDetails: vipRequired ? vipDetails.trim() : "",

      movingFrom: isMoving ? movingFrom.trim() : "",
      movingTo: isMoving ? movingTo.trim() : "",
      movingDate: isMoving ? movingDate.trim() : "",
      movingAccess: isMoving ? movingAccess.trim() : "",
      itemsToProtect: isMoving ? itemsToProtect.trim() : "",

      alcoholServed,
      alcoholRequirements: alcoholServed
        ? alcoholRequirements.trim()
        : "",
      alcoholCredential: alcoholServed
        ? alcoholCredential.trim()
        : "",

      expectedGuests: expectedGuests.trim(),
      ageRestrictions: ageRestrictions.trim(),
      accessRequirements: accessRequirements.trim(),
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

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <LinearGradient
        colors={[colors.surfaceElevated, colors.background]}
        style={s.header}
      >
        <View>
          <Text style={s.logo}>VIGIL</Text>
          <Text style={s.subtitle}>SECURITY SERVICES</Text>
        </View>
        <TouchableOpacity
          style={s.cancelHeader}
          onPress={onCancel}
          disabled={saving}
        >
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
          Tell us what you need. Select your event and service to see the
          relevant booking questions.
        </Text>

        <BookingCalendar value={date} onChange={setDate} />

        <View style={s.form}>
          <Text style={s.sectionHeading}>01 / SERVICE SELECTION</Text>

          <Dropdown
            label="WHAT DO YOU NEED SECURITY FOR?"
            value={eventType}
            options={EVENT_OPTIONS}
            onChange={(v) => {
              setEventType(v);
              setVipRequired(false);
              setAlcoholServed(false);
            }}
            placeholder="Choose an event or situation"
            colors={colors}
          />

          <Dropdown
            label="TYPE OF SECURITY SERVICE"
            value={serviceType}
            options={SERVICE_OPTIONS}
            onChange={setServiceType}
            placeholder="Choose a security service"
            colors={colors}
          />

          <Text style={s.sectionHeading}>02 / SCHEDULE AND LOCATION</Text>

          <Text style={s.label}>SERVICE DATE</Text>
          <Text style={s.readOnlyDate}>{date}</Text>

          {field("START TIME (24-HOUR)", startTime, setStartTime, "09:00")}
          {field("END TIME (24-HOUR)", endTime, setEndTime, "17:00")}

          {field("NUMBER OF GUARDS", guards, setGuards, "1", {
            keyboardType: "number-pad",
          })}

          {field(
            "PRIMARY SERVICE ADDRESS",
            address,
            setAddress,
            "Enter the full service address",
            { autoCapitalize: "words" }
          )}

          <Text style={s.sectionHeading}>03 / GUARD PREFERENCES</Text>

          <YesNoToggle
            label="DO YOU REQUIRE UNIFORMED GUARDS?"
            value={uniformRequired}
            onChange={setUniformRequired}
            colors={colors}
            description="Choose whether assigned guards should wear a uniform or professional non-uniform attire."
          />

          <Text style={s.label}>UNIFORM PREFERENCE</Text>
          <Text style={s.preferenceValue}>
            {uniformRequired ? "Uniformed guards" : "Non-uniformed guards"}
          </Text>

          <YesNoToggle
            label="DO YOU ALSO REQUIRE PRIVATE INVESTIGATION?"
            value={privateInvestigation}
            onChange={setPrivateInvestigation}
            colors={colors}
            description="This is an additional service, separate from regular security guarding."
          />

          {privateInvestigation && (
            <View style={s.conditionalBox}>
              <Text style={s.conditionalTitle}>PRIVATE INVESTIGATION DETAILS</Text>
              {field(
                "WHAT NEEDS TO BE INVESTIGATED?",
                investigationDetails,
                setInvestigationDetails,
                "Describe the investigation, relevant individuals, incidents, or concerns.",
                { multiline: true, textAlignVertical: "top" }
              )}
            </View>
          )}

          {isMoving && (
            <>
              <Text style={s.sectionHeading}>04 / MOVING SECURITY DETAILS</Text>
              <View style={s.infoNote}>
                <Text style={s.infoNoteTitle}>MOVING-DAY PROTECTION</Text>
                <Text style={s.helperText}>
                  Help us understand your move so guards can help protect
                  your belongings, monitor access, and discourage theft.
                </Text>
              </View>

              {field(
                "CURRENT / PICKUP ADDRESS",
                movingFrom,
                setMovingFrom,
                "Where are you moving from?",
                { autoCapitalize: "words" }
              )}

              {field(
                "NEW / DESTINATION ADDRESS",
                movingTo,
                setMovingTo,
                "Where are you moving to?",
                { autoCapitalize: "words" }
              )}

              {field(
                "MOVING DATE OR TIME DETAILS",
                movingDate,
                setMovingDate,
                "e.g. Movers arrive at 8 AM; truck leaves at noon"
              )}

              <Dropdown
                label="BUILDING ACCESS / MOVING ARRANGEMENTS"
                value={movingAccess}
                options={[
                  "Apartment with elevator",
                  "Apartment with stairs only",
                  "Condominium with elevator",
                  "Condominium with loading dock",
                  "House with driveway",
                  "House with street parking",
                  "Multiple buildings / locations",
                  "Storage facility",
                  "Other access arrangement",
                ]}
                onChange={setMovingAccess}
                colors={colors}
              />

              {field(
                "ITEMS OR BELONGINGS TO PROTECT",
                itemsToProtect,
                setItemsToProtect,
                "e.g. Electronics, furniture, valuables, boxes, artwork...",
                { multiline: true, textAlignVertical: "top" }
              )}
            </>
          )}

          {isEvent && (
            <>
              <Text style={s.sectionHeading}>05 / VIP PROTECTION</Text>

              <YesNoToggle
                label="WILL THERE BE VIP GUESTS?"
                value={vipRequired}
                onChange={setVipRequired}
                colors={colors}
                description="Select yes if specific guests require additional privacy, monitoring, or personal protection."
              />

              {vipRequired && (
                <View style={s.conditionalBox}>
                  <Text style={s.conditionalTitle}>VIP INFORMATION</Text>

                  {field(
                    "VIP NAMES / IDENTIFYING INFORMATION",
                    vipNames,
                    setVipNames,
                    "Enter names, group names, or identifying details.",
                    { multiline: true, textAlignVertical: "top" }
                  )}

                  {field(
                    "VIP PROTECTION REQUIREMENTS",
                    vipDetails,
                    setVipDetails,
                    "e.g. Dedicated escort, private entrance, restricted access, arrival coordination...",
                    { multiline: true, textAlignVertical: "top" }
                  )}
                </View>
              )}
            </>
          )}

          {showGuests && (
            <>
              <Text style={s.sectionHeading}>06 / EVENT INFORMATION</Text>

              {field(
                "EXPECTED NUMBER OF ATTENDEES",
                expectedGuests,
                setExpectedGuests,
                "e.g. 150",
                { keyboardType: "number-pad" }
              )}

              {field(
                "AGE RESTRICTIONS",
                ageRestrictions,
                setAgeRestrictions,
                "e.g. 18+, 19+, all ages, family event"
              )}

              {field(
                "ACCESS AND ENTRY REQUIREMENTS",
                accessRequirements,
                setAccessRequirements,
                "e.g. Guest list, ticket checks, restricted areas, wristbands...",
                { multiline: true, textAlignVertical: "top" }
              )}
            </>
          )}

          {showAlcohol && (
            <>
              <Text style={s.sectionHeading}>07 / ALCOHOL-RELATED SECURITY</Text>

              <YesNoToggle
                label="WILL ALCOHOL BE SERVED AT THE EVENT?"
                value={alcoholServed}
                onChange={setAlcoholServed}
                colors={colors}
                description="This helps determine the appropriate experience and qualifications required for the event."
              />

              {alcoholServed && (
                <View style={s.conditionalBox}>
                  <Text style={s.conditionalTitle}>ALCOHOL-RELATED REQUIREMENTS</Text>

                  <Dropdown
                    label="PREFERRED QUALIFICATION"
                    value={alcoholCredential}
                    options={[
                      "ProServe",
                      "Serving It Right",
                      "Smart Serve",
                      "Equivalent provincial alcohol-service qualification",
                      "No specific qualification requested",
                      "Please advise",
                    ]}
                    onChange={setAlcoholCredential}
                    colors={colors}
                  />

                  {field(
                    "ADDITIONAL ALCOHOL-RELATED REQUIREMENTS",
                    alcoholRequirements,
                    setAlcoholRequirements,
                    "e.g. Monitoring intoxicated guests, preventing underage access, identifying disruptive behaviour, coordinating with venue staff...",
                    { multiline: true, textAlignVertical: "top" }
                  )}

                  <Text style={s.helperText}>
                    Qualification preferences are subject to verification.
                    Security personnel must only perform duties they are
                    legally authorized and qualified to perform.
                  </Text>
                </View>
              )}
            </>
          )}

          <Text style={s.sectionHeading}>08 / ADDITIONAL INFORMATION</Text>

          {field(
            "GENERAL SERVICE DETAILS",
            details,
            setDetails,
            "Any additional information about your security request?",
            { multiline: true, textAlignVertical: "top" }
          )}

          <Text style={s.label}>
            SPECIAL INSTRUCTIONS (OPTIONAL)
          </Text>
          <TextInput
            style={[s.input, s.instructionsInput]}
            placeholder="Provide any additional instructions for your booking..."
            placeholderTextColor={colors.muted}
            value={instructions}
            onChangeText={setInstructions}
            maxLength={2000}
            multiline
            textAlignVertical="top"
            editable={!saving}
          />
          <Text style={s.characterCount}>
            {instructions.length}/2000 characters
          </Text>

          <View style={s.pendingNote}>
            <Text style={s.pendingIcon}>◷</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.pendingTitle}>Admin confirmation required</Text>
              <Text style={s.pendingBody}>
                Your request will start as Pending. We'll update the status
                after review.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={submit}
            disabled={saving}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[palette.brand, palette.brandDark]}
              style={s.submit}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitText}>
                  SUBMIT BOOKING REQUEST
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCancel}
            disabled={saving}
            style={s.cancelBottom}
          >
            <Text style={s.cancelText}>CANCEL AND GO BACK</Text>
          </TouchableOpacity>
        </View>

        <Text style={s.footer}>
          VIGIL · YOUR SAFETY, OUR PRIORITY
        </Text>
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
    logo: {
      color: c.text,
      fontFamily: fonts.logo,
      fontSize: 35,
      letterSpacing: 2,
    },
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
    cancelText: {
      color: c.muted,
      fontFamily: fonts.bold,
      fontSize: 10,
      letterSpacing: 0.8,
    },
    content: { padding: 20, paddingBottom: 35 },
    eyebrow: {
      color: palette.brand,
      fontFamily: fonts.bold,
      fontSize: 10,
      letterSpacing: 1.5,
    },
    title: {
      color: c.text,
      fontFamily: fonts.bold,
      fontSize: 28,
      marginTop: 5,
    },
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
    sectionHeading: {
      color: palette.brand,
      fontFamily: fonts.bold,
      fontSize: 10,
      letterSpacing: 1.1,
      marginTop: 23,
      marginBottom: 5,
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
    instructionsInput: { minHeight: 145, paddingTop: 13 },
    characterCount: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 10,
      textAlign: "right",
      marginTop: 5,
    },
    dropdown: {
      minHeight: 49,
      backgroundColor: c.input,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 11,
      paddingHorizontal: 13,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    dropdownText: {
      color: c.text,
      fontFamily: fonts.regular,
      fontSize: 12,
      flex: 1,
    },
    dropdownArrow: {
      color: palette.brand,
      fontSize: 20,
      marginLeft: 10,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: "rgba(0,0,0,0.65)",
    },
    modalContent: {
      backgroundColor: c.surface,
      borderTopLeftRadius: 22,
      borderTopRightRadius: 22,
      paddingHorizontal: 20,
      paddingTop: 22,
      paddingBottom: 35,
      maxHeight: "75%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    modalTitle: {
      color: c.text,
      fontFamily: fonts.bold,
      fontSize: 14,
      flex: 1,
    },
    modalClose: {
      color: palette.brand,
      fontFamily: fonts.bold,
      fontSize: 10,
    },
    option: {
      minHeight: 48,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      paddingHorizontal: 5,
    },
    selectedOption: {
      backgroundColor: c.surfaceElevated,
      borderRadius: 8,
    },
    optionText: {
      color: c.text,
      fontFamily: fonts.regular,
      fontSize: 12,
      flex: 1,
    },
    checkmark: {
      color: palette.brand,
      fontFamily: fonts.bold,
      fontSize: 16,
      marginLeft: 10,
    },
    toggleContainer: { marginTop: 5 },
    toggleRow: {
      flexDirection: "row",
      gap: 10,
    },
    toggleButton: {
      flex: 1,
      minHeight: 43,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: c.input,
    },
    toggleActive: {
      backgroundColor: palette.brand,
      borderColor: palette.brand,
    },
    toggleText: {
      color: c.muted,
      fontFamily: fonts.bold,
      fontSize: 10,
      letterSpacing: 1,
    },
    toggleTextActive: { color: "#fff" },
    helperText: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 10,
      lineHeight: 16,
      marginBottom: 9,
    },
    preferenceValue: {
      color: c.text,
      fontFamily: fonts.medium,
      fontSize: 11,
      marginTop: 2,
    },
    conditionalBox: {
      backgroundColor: c.surfaceElevated,
      borderRadius: 12,
      padding: 13,
      marginTop: 13,
      borderWidth: 1,
      borderColor: c.border,
    },
    conditionalTitle: {
      color: palette.brand,
      fontFamily: fonts.bold,
      fontSize: 10,
      letterSpacing: 0.8,
      marginBottom: 5,
    },
    infoNote: {
      backgroundColor: c.surfaceElevated,
      borderRadius: 12,
      padding: 13,
      marginTop: 10,
    },
    infoNoteTitle: {
      color: c.text,
      fontFamily: fonts.bold,
      fontSize: 10,
      marginBottom: 5,
    },
    readOnlyDate: {
      color: c.text,
      fontFamily: fonts.medium,
      fontSize: 12,
      backgroundColor: c.input,
      padding: 13,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.border,
    },
    pendingNote: {
      flexDirection: "row",
      gap: 12,
      backgroundColor: c.surfaceElevated,
      borderRadius: 13,
      padding: 13,
      marginTop: 20,
    },
    pendingIcon: { color: palette.warning, fontSize: 24 },
    pendingTitle: {
      color: c.text,
      fontFamily: fonts.semibold,
      fontSize: 12,
    },
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
    submitText: {
      color: "#fff",
      fontFamily: fonts.bold,
      fontSize: 11,
      letterSpacing: 0.8,
    },
    cancelBottom: {
      alignItems: "center",
      paddingVertical: 17,
    },
    footer: {
      color: c.muted,
      fontFamily: fonts.medium,
      fontSize: 8,
      letterSpacing: 1,
      textAlign: "center",
      marginTop: 22,
    },
  });
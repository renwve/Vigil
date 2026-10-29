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
import { useRouter } from "expo-router";
import { loginUser, registerUser } from "../services/auth";
import { useTheme } from "../context/ThemeContext";
import { fonts, palette } from "../theme";

type AuthMode = "choice" | "login" | "register";

export default function AuthScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [mode, setMode] = useState<AuthMode>("choice");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      return Alert.alert("Missing information", "Enter your email and password.");
    }
    if (mode === "register" && !name.trim()) {
      return Alert.alert("Missing information", "Enter your name.");
    }
    try {
      setLoading(true);
      if (mode === "register") await registerUser(name, email, password);
      else if (mode === "login") await loginUser(email, password);
      else return;
      router.replace("/(tabs)/book");
    } catch (error: any) {
      let message = error?.message || "Something went wrong. Please try again.";
      if (error?.code === "auth/email-already-in-use") {
        message = "This email is already registered. Please sign in.";
      } else if (error?.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (
        ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"].includes(error?.code)
      ) {
        message = "Your email or password is incorrect.";
      }
      Alert.alert("Unable to continue", message);
    } finally {
      setLoading(false);
    }
  }

  const s = styles(colors);

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.brand}>
          <LinearGradient colors={[palette.brand, palette.brandDark]} style={s.logo}>
            <Text style={s.logoLetter}>V</Text>
          </LinearGradient>
          <Text style={s.brandName}>VIGIL</Text>
          <Text style={s.tagline}>YOUR SAFETY. OUR PRIORITY.</Text>
        </View>

        <View style={s.card}>
          {mode === "choice" ? (
            <>
              <Text style={s.heading}>Welcome to Vigil.</Text>
              <Text style={s.description}>
                Reliable security booking, whenever you need it.
              </Text>
              <TouchableOpacity onPress={() => setMode("login")} activeOpacity={0.85}>
                <LinearGradient colors={[palette.brand, palette.brandDark]} style={s.primary}>
                  <Text style={s.primaryText}>LOG IN</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setMode("register")} style={s.secondary}>
                <Text style={s.secondaryText}>CREATE AN ACCOUNT</Text>
              </TouchableOpacity>
              <Text style={s.note}>
                Sign in or create an account to manage your bookings.
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  setMode("choice");
                  setPassword("");
                }}
              >
                <Text style={s.back}>‹  Back</Text>
              </TouchableOpacity>
              <Text style={s.heading}>
                {mode === "login" ? "Welcome back." : "Join Vigil."}
              </Text>
              <Text style={s.description}>
                {mode === "login"
                  ? "Sign in to manage your security bookings."
                  : "Create an account to start booking security services."}
              </Text>

              {mode === "register" && (
                <>
                  <Text style={s.label}>FULL NAME</Text>
                  <TextInput
                    style={s.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={colors.muted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </>
              )}

              <Text style={s.label}>EMAIL ADDRESS</Text>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />

              <Text style={s.label}>PASSWORD</Text>
              <TextInput
                style={s.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                onSubmitEditing={handleSubmit}
                editable={!loading}
              />

              <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                <LinearGradient colors={[palette.brand, palette.brandDark]} style={s.primary}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={s.primaryText}>
                      {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={s.switchRow}>
                <Text style={s.note}>
                  {mode === "login" ? "New to Vigil?" : "Already have an account?"}
                </Text>
                <Text
                  onPress={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setPassword("");
                  }}
                  style={s.secondaryText}
                >
                  {mode === "login" ? " Register" : " Sign in"}
                </Text>
              </View>
            </>
          )}
        </View>

        <Text style={s.footer}>SECURE ACCESS · VIGIL SECURITY SERVICES</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (c: ReturnType<typeof useTheme>["colors"]) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    scroll: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: 24,
      paddingVertical: 24,
    },
    brand: { alignItems: "center", marginBottom: 25 },
    logo: {
      width: 58,
      height: 58,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 10,
    },
    logoLetter: { color: "#fff", fontFamily: fonts.bold, fontSize: 31 },
    brandName: { color: c.text, fontFamily: fonts.logo, fontSize: 42, letterSpacing: 3 },
    tagline: {
      color: palette.brand,
      fontFamily: fonts.bold,
      fontSize: 9,
      letterSpacing: 1.7,
      marginTop: 4,
    },
    card: {
      width: "100%",
      maxWidth: 440,
      alignSelf: "center",
      backgroundColor: c.surface,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: c.border,
      padding: 22,
    },
    heading: { color: c.text, fontFamily: fonts.bold, fontSize: 24 },
    description: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 13,
      lineHeight: 21,
      marginTop: 7,
      marginBottom: 16,
    },
    primary: {
      minHeight: 50,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 10,
    },
    primaryText: { color: "#fff", fontFamily: fonts.bold, fontSize: 12, letterSpacing: 1.2 },
    secondary: {
      minHeight: 50,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: palette.brand,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 12,
    },
    secondaryText: { color: palette.brand, fontFamily: fonts.bold, fontSize: 11 },
    note: {
      color: c.muted,
      fontFamily: fonts.regular,
      fontSize: 11,
      textAlign: "center",
      marginTop: 16,
    },
    back: { color: palette.brand, fontFamily: fonts.semibold, marginBottom: 14 },
    label: {
      color: c.muted,
      fontFamily: fonts.bold,
      fontSize: 10,
      letterSpacing: 1,
      marginTop: 12,
      marginBottom: 7,
    },
    input: {
      backgroundColor: c.input,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 13,
      color: c.text,
      fontFamily: fonts.regular,
      minHeight: 48,
    },
    switchRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flexWrap: "wrap",
    },
    footer: {
      color: c.muted,
      opacity: 0.8,
      fontFamily: fonts.medium,
      fontSize: 8,
      letterSpacing: 1,
      textAlign: "center",
      marginTop: 22,
    },
  });
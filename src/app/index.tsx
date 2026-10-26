

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
import { loginUser, registerUser } from "../../services/auth";

const COLORS = {
  background: "#050F1D",
  panel: "#0B1B2B",
  cyan: "#08A9E8",
  white: "#F4F8FC",
  muted: "#94A9BE",
  border: "#18334A",
};

type AuthMode = "choice" | "login" | "register";

export default function AuthScreen() {
  const router = useRouter();

  const [mode, setMode] = useState<AuthMode>("choice");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email.trim() || !password) {
      Alert.alert(
        "Missing information",
        "Please enter your email and password."
      );
      return;
    }

    if (mode === "register" && !name.trim()) {
      Alert.alert("Missing information", "Please enter your name.");
      return;
    }

    if (mode === "register" && password.length < 6) {
      Alert.alert(
        "Password too short",
        "Your password must have at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      if (mode === "register") {
        await registerUser(name.trim(), email.trim(), password);
      } else if (mode === "login") {
        await loginUser(email.trim(), password);
      } else {
        return;
      }

      router.replace("/book");
    } catch (error: any) {
      let message = "Something went wrong. Please try again.";

      if (error?.code === "auth/email-already-in-use") {
        message = "This email is already registered. Please sign in instead.";
      } else if (error?.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (
        error?.code === "auth/invalid-credential" ||
        error?.code === "auth/wrong-password" ||
        error?.code === "auth/user-not-found"
      ) {
        message = "Your email or password is incorrect.";
      } else if (error?.code === "auth/network-request-failed") {
        message = "Network error. Check your internet connection.";
      } else if (error?.code === "auth/weak-password") {
        message = "Please choose a stronger password.";
      } else if (error?.message) {
        message = error.message;
      }

      Alert.alert("Unable to continue", message);
    } finally {
      setLoading(false);
    }
  }

  function goBackToChoice() {
    setMode("choice");
    setPassword("");
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <LinearGradient
            colors={["#08A9E8", "#0877C9"]}
            style={styles.logo}
          >
            <Text style={styles.logoLetter}>V</Text>
          </LinearGradient>

          <Text style={styles.brandName}>VIGIL</Text>
          <Text style={styles.tagline}>
            YOUR SAFETY. OUR PRIORITY.
          </Text>
        </View>

        {mode === "choice" ? (
          <View style={styles.card}>
            <Text style={styles.heading}>Welcome to Vigil.</Text>
            <Text style={styles.description}>
              Reliable security booking, whenever you need it.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setMode("login")}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={["#08A9E8", "#0877C9"]}
                style={styles.button}
              >
                <Text style={styles.buttonText}>LOG IN</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setMode("register")}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>
                CREATE AN ACCOUNT
              </Text>
            </TouchableOpacity>

            <Text style={styles.choiceNote}>
              Sign in or create an account to manage your bookings.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <TouchableOpacity
              onPress={goBackToChoice}
              disabled={loading}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>‹  Back</Text>
            </TouchableOpacity>

            <Text style={styles.heading}>
              {mode === "login" ? "Welcome back." : "Join Vigil."}
            </Text>

            <Text style={styles.description}>
              {mode === "login"
                ? "Sign in to manage your security bookings."
                : "Create an account to start booking security services."}
            </Text>

            {mode === "register" && (
              <>
                <Text style={styles.label}>FULL NAME</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.muted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                  returnKeyType="next"
                  editable={!loading}
                />
              </>
            )}

            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={COLORS.muted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              returnKeyType="next"
              editable={!loading}
            />

            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.muted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              editable={!loading}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSubmit}
              disabled={loading}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={["#08A9E8", "#0877C9"]}
                style={styles.button}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>
                    {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>
                {mode === "login"
                  ? "New to Vigil?"
                  : "Already have an account?"}
              </Text>

              <TouchableOpacity
                disabled={loading}
                onPress={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setPassword("");
                }}
              >
                <Text style={styles.switchAction}>
                  {mode === "login" ? " Register" : " Sign in"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.footer}>
          SECURE ACCESS · VIGIL SECURITY SERVICES
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  brand: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  logoLetter: {
    color: "#FFFFFF",
    fontSize: 31,
    fontWeight: "900",
  },
  brandName: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 7,
  },
  tagline: {
    color: COLORS.cyan,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.7,
    marginTop: 6,
  },
  card: {
    width: "100%",
    maxWidth: 440,
    alignSelf: "center",
    backgroundColor: COLORS.panel,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 19,
    paddingVertical: 18,
  },
  heading: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
  },
  description: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
    marginBottom: 13,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    marginBottom: 9,
  },
  backButtonText: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: "700",
  },
  label: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.white,
    fontSize: 13,
    minHeight: 42,
  },
  buttonWrapper: {
    marginTop: 18,
    borderRadius: 10,
    overflow: "hidden",
  },
  button: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 11,
    letterSpacing: 1.3,
  },
  secondaryButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cyan,
    marginTop: 10,
  },
  secondaryButtonText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  choiceNote: {
    color: COLORS.muted,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 16,
    marginTop: 17,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 16,
  },
  switchText: {
    color: COLORS.muted,
    fontSize: 11,
  },
  switchAction: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: "800",
  },
  footer: {
    color: "#536A80",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 19,
  },
});

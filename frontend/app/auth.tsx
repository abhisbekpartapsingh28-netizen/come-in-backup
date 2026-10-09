// Come In — Auth screen (sign in / register).
//
// This replaces the old "Sign in coming soon" modal. On success we navigate
// back; if the user came here with ?next=/some/path we honor that.
import Feather from "@react-native-vector-icons/feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandLogo } from "@/src/components/BrandLogo";
import { useAuth } from "@/src/store/auth";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

type Mode = "signin" | "signup";

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { login, register } = useAuth();
  const { next } = useLocalSearchParams<{ next?: string }>();

  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (mode === "signin") {
        await login(email.trim(), password);
      } else {
        if (!name.trim()) {
          setError("Please enter your name");
          setLoading(false);
          return;
        }
        await register(name.trim(), email.trim(), password, phone.trim() || undefined);
      }
      if (next && typeof next === "string") router.replace(next as any);
      else router.replace("/(tabs)/account");
    } catch (e: any) {
      setError(e?.message || "Could not continue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.lg }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          testID="auth-back-btn"
          onPress={() => router.back()}
          style={styles.iconBtn}
        >
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </Pressable>

        <View style={{ alignItems: "center", marginVertical: spacing.lg }}>
          <BrandLogo size="md" />
        </View>

        <Text style={styles.title}>
          {mode === "signin" ? "Welcome back" : "Create your Come In account"}
        </Text>
        <Text style={styles.sub}>
          {mode === "signin"
            ? "Sign in to track orders, save addresses and open your shop."
            : "Sign up once to shop, request anything and run your shop."}
        </Text>

        {mode === "signup" && (
          <>
            <Label text="Full name" />
            <Input
              testID="auth-name"
              icon="user"
              value={name}
              onChangeText={setName}
              placeholder="Rohit Kumar"
            />
          </>
        )}

        <Label text="Email" />
        <Input
          testID="auth-email"
          icon="mail"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />

        {mode === "signup" && (
          <>
            <Label text="Phone (optional)" />
            <Input
              testID="auth-phone"
              icon="phone"
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98123 00000"
              keyboardType="phone-pad"
            />
          </>
        )}

        <Label text="Password" />
        <Input
          testID="auth-password"
          icon="lock"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
        />

        {error && (
          <View style={styles.errorBox} testID="auth-error">
            <Feather name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Pressable
          testID="auth-submit"
          disabled={loading}
          onPress={submit}
          style={[styles.submit, loading && { opacity: 0.6 }]}
        >
          {loading ? (
            <ActivityIndicator color={colors.onBrandPrimary} />
          ) : (
            <Text style={styles.submitText}>
              {mode === "signin" ? "Sign in" : "Create account"}
            </Text>
          )}
        </Pressable>

        <Pressable
          testID="auth-switch-mode"
          onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
          style={styles.switchRow}
        >
          <Text style={styles.switchText}>
            {mode === "signin" ? "New to Come In? " : "Already have an account? "}
            <Text style={[styles.switchText, { color: colors.brandPrimary, fontWeight: "800" }]}>
              {mode === "signin" ? "Create account" : "Sign in"}
            </Text>
          </Text>
        </Pressable>

        <View style={styles.note}>
          <Feather name="info" size={12} color={colors.muted} />
          <Text style={styles.noteText}>
            Phone OTP, Google and Razorpay sign-in will activate once their keys are configured. For
            now, email + password works everywhere.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Label({ text }: { text: string }) {
  const styles = useStyles();
  return <Text style={styles.label}>{text}</Text>;
}

function Input({
  testID,
  icon,
  ...rest
}: {
  testID: string;
  icon: React.ComponentProps<typeof Feather>["name"];
} & React.ComponentProps<typeof TextInput>) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.inputWrap}>
      <Feather name={icon} size={16} color={colors.brandPrimary} />
      <TextInput
        testID={testID}
        placeholderTextColor={colors.muted}
        style={styles.input}
        {...rest}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.onSurface, marginTop: spacing.md },
  sub: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: spacing.lg },
  label: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 12,
    letterSpacing: 0.3,
    fontWeight: "700",
    color: colors.onSurfaceSecondary,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
  },
  input: { flex: 1, fontSize: 14, color: colors.onSurface, padding: 0 },
  submit: {
    marginTop: spacing.xl,
    backgroundColor: colors.brandPrimary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
  },
  submitText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 15 },
  errorBox: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  errorText: { color: colors.error, fontSize: 12, flex: 1 },
  switchRow: { marginTop: spacing.lg, alignItems: "center" },
  switchText: { fontSize: 13, color: colors.onSurfaceSecondary },
  note: {
    marginTop: spacing.xl,
    flexDirection: "row",
    gap: 6,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "flex-start",
  },
  noteText: { flex: 1, fontSize: 11, color: colors.muted, lineHeight: 16 },
}));

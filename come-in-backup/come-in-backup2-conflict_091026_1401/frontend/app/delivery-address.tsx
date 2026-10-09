import Feather from "@react-native-vector-icons/feather";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
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

import { useLocationCtx } from "@/src/store/location";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

const DEFAULT_LOCATION = "Set delivery location";

// A few quick-pick addresses so users can tap-to-set a demo location.
const QUICK_PICKS: { icon: React.ComponentProps<typeof Feather>["name"]; label: string; value: string }[] = [
  { icon: "home", label: "Home", value: "Sector 17, Chandigarh" },
  { icon: "briefcase", label: "Office", value: "Cyber City, Gurugram" },
  { icon: "map-pin", label: "Other", value: "Koramangala, Bengaluru" },
];

export default function DeliveryAddressScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { location, setLocation } = useLocationCtx();
  const [input, setInput] = useState(location === DEFAULT_LOCATION ? "" : location);

  const canSave = input.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    setLocation(input);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          testID="address-back-btn"
          onPress={() => router.back()}
          style={styles.iconBtn}
        >
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Delivery address</Text>
          <Text style={styles.sub}>Where should we deliver your orders?</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 140 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>Your area, city or landmark</Text>
        <View style={styles.inputWrap}>
          <Feather name="map-pin" size={16} color={colors.brandPrimary} />
          <TextInput
            testID="address-input"
            value={input}
            onChangeText={setInput}
            placeholder="e.g. Sector 17, Chandigarh"
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>

        <Text style={[styles.label, { marginTop: spacing.lg }]}>Quick picks</Text>
        <View style={styles.chipCol}>
          {QUICK_PICKS.map((q) => (
            <Pressable
              key={q.label}
              testID={`address-pick-${q.label}`}
              onPress={() => setInput(q.value)}
              style={styles.pickRow}
            >
              <View style={styles.pickIcon}>
                <Feather name={q.icon} size={16} color={colors.brandPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pickLabel}>{q.label}</Text>
                <Text style={styles.pickValue} numberOfLines={1}>
                  {q.value}
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        {location !== DEFAULT_LOCATION && (
          <View style={styles.currentBox}>
            <Feather name="check-circle" size={14} color={colors.brandPrimary} />
            <Text style={styles.currentText} numberOfLines={1}>
              Currently delivering to {location}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Pressable
          testID="address-save-btn"
          onPress={handleSave}
          disabled={!canSave}
          style={[
            styles.saveBtn,
            !canSave && { backgroundColor: colors.borderStrong },
          ]}
        >
          <Text style={styles.saveText}>Save address</Text>
          <Feather name="arrow-right" size={18} color={colors.onBrandPrimary} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.onSurfaceSecondary,
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
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
  input: { flex: 1, fontSize: 15, color: colors.onSurface, padding: 0 },
  chipCol: {
    gap: spacing.sm,
  },
  pickRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  pickLabel: { fontSize: 14, fontWeight: "700", color: colors.onSurface },
  pickValue: { fontSize: 12, color: colors.muted, marginTop: 2 },
  currentBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.md,
  },
  currentText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    color: colors.onBrandTertiary,
  },
  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  saveBtn: {
    backgroundColor: colors.brandPrimary,
    paddingVertical: 14,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  saveText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 15 },
}));

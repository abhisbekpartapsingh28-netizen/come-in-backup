import Feather from "@react-native-vector-icons/feather";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/lib/api";
import { useLocationCtx } from "@/src/store/location";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

const SIZES = ["Small", "Medium", "Large"];
const DEFAULT_LOCATION = "Set delivery location";

export default function RequestScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { location } = useLocationCtx();
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState(() =>
    location && location !== DEFAULT_LOCATION ? location : "",
  );
  const [desc, setDesc] = useState("");
  const [size, setSize] = useState("Small");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep drop in sync with the shared delivery address while the user hasn't
  // typed a one-off override. We track the last-synced value so we only
  // overwrite the field when it still matches the previously-saved address.
  const lastSyncedRef = useRef(drop);
  useEffect(() => {
    if (!location || location === DEFAULT_LOCATION) return;
    if (drop === "" || drop === lastSyncedRef.current) {
      setDrop(location);
      lastSyncedRef.current = location;
    }
  }, [location, drop]);

  const canSubmit = pickup.trim() && drop.trim() && desc.trim();

  const submit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post<any>(
        "/requests/anything",
        {
          description: desc,
          pickup,
          drop,
          size,
          customer_phone: customerPhone,
        },
        false,
      );
      setSubmittedRef(res.ref);
      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message || "Could not send request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="req-back-btn" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Request anything</Text>
          <Text style={styles.sub}>We'll pick it up and drop it off</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 140 + insets.bottom }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hint}>
          <Feather name="info" size={14} color={colors.brandPrimary} />
          <Text style={styles.hintText}>
            Need a parcel picked up, lunch dropped at office or anything else? Just tell us.
          </Text>
        </View>

        <Text style={styles.label}>Pickup from</Text>
        <View style={styles.inputWrap}>
          <Feather name="map-pin" size={16} color={colors.brandPrimary} />
          <TextInput
            testID="req-pickup-input"
            value={pickup}
            onChangeText={setPickup}
            placeholder="Shop, home or address"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </View>

        <Text style={styles.label}>Drop to</Text>
        <View style={styles.inputWrap}>
          <Feather name="navigation" size={16} color={colors.brandPrimary} />
          <TextInput
            testID="req-drop-input"
            value={drop}
            onChangeText={setDrop}
            placeholder="Delivery address"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </View>
        <Pressable
          testID="req-change-address-btn"
          onPress={() => router.push("/delivery-address")}
          hitSlop={8}
          style={styles.changeAddressRow}
        >
          <Feather name="edit-2" size={11} color={colors.brandPrimary} />
          <Text style={styles.changeAddressText}>
            {location && location !== DEFAULT_LOCATION
              ? `Using your saved address · Change`
              : `Set your saved delivery address`}
          </Text>
        </Pressable>

        <Text style={styles.label}>What are we delivering?</Text>
        <View style={[styles.inputWrap, { alignItems: "flex-start" }]}>
          <Feather name="package" size={16} color={colors.brandPrimary} style={{ marginTop: 2 }} />
          <TextInput
            testID="req-desc-input"
            value={desc}
            onChangeText={setDesc}
            placeholder="e.g. Pick up medicines from Apollo pharmacy"
            placeholderTextColor={colors.muted}
            style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
            multiline
          />
        </View>

        <Text style={styles.label}>Package size</Text>
        <View style={styles.sizeRow}>
          {SIZES.map((s) => {
            const selected = s === size;
            return (
              <Pressable
                key={s}
                testID={`size-${s}`}
                onPress={() => setSize(s)}
                style={[
                  styles.sizeChip,
                  selected && {
                    backgroundColor: colors.brandTertiary,
                    borderColor: colors.brandPrimary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.sizeText,
                    selected && { color: colors.brandPrimary },
                  ]}
                >
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.feeBox}>
          <Feather name="truck" size={16} color={colors.brandPrimary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.feeTitle}>Estimated fare ₹59</Text>
            <Text style={styles.feeSub}>Final charges depend on distance</Text>
          </View>
        </View>

        <Text style={styles.label}>Phone number (optional)</Text>
        <View style={styles.inputWrap}>
          <Feather name="phone" size={16} color={colors.brandPrimary} />
          <TextInput
            testID="req-phone-input"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="So we can reach you"
            placeholderTextColor={colors.muted}
            style={styles.input}
            keyboardType="phone-pad"
          />
        </View>
        {error && <Text style={{ color: colors.error, marginTop: spacing.md, fontSize: 12 }}>{error}</Text>}
      </ScrollView>

      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Pressable
          testID="req-submit-btn"
          disabled={!canSubmit || submitting}
          onPress={submit}
          style={[
            styles.submitBtn,
            (!canSubmit || submitting) && { backgroundColor: colors.borderStrong },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.onBrandPrimary} />
          ) : (
            <>
              <Text style={styles.submitText}>Submit request</Text>
              <Feather name="arrow-right" size={18} color={colors.onBrandPrimary} />
            </>
          )}
        </Pressable>
      </View>

      <Modal visible={submitted} transparent animationType="fade">
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetIcon}>
              <Feather name="check" size={28} color={colors.onBrandPrimary} />
            </View>
            <Text style={styles.sheetTitle}>Request placed!</Text>
            {submittedRef && <Text style={styles.sheetSub}>Reference {submittedRef}</Text>}
            <Text style={styles.sheetSub}>
              A rider will accept your request shortly. You'll see live status on the home screen.
            </Text>
            <Pressable
              testID="req-done-btn"
              onPress={() => {
                setSubmitted(false);
                router.back();
              }}
              style={styles.sheetBtn}
            >
              <Text style={styles.sheetBtnText}>Done</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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

  hint: {
    flexDirection: "row",
    gap: 6,
    alignItems: "flex-start",
    backgroundColor: colors.brandTertiary,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  hintText: { flex: 1, fontSize: 12, color: colors.onBrandTertiary, lineHeight: 18 },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.onSurfaceSecondary,
    marginTop: spacing.md,
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
  input: { flex: 1, fontSize: 14, color: colors.onSurface, padding: 0 },
  changeAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  changeAddressText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  sizeRow: { flexDirection: "row", gap: spacing.sm },
  sizeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  sizeText: { fontSize: 13, fontWeight: "700", color: colors.onSurfaceSecondary },

  feeBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feeTitle: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  feeSub: { fontSize: 12, color: colors.muted, marginTop: 2 },

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
  submitBtn: {
    backgroundColor: colors.brandPrimary,
    paddingVertical: 14,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  submitText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 15 },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  sheet: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  sheetIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  sheetTitle: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  sheetSub: { fontSize: 13, color: colors.muted, textAlign: "center", lineHeight: 20 },
  sheetBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  sheetBtnText: { color: colors.onBrandPrimary, fontWeight: "800" },
}));

// Seller — Shop registration + profile edit.
// Promoted customers land here from Account > "Open your shop".
import Feather from "@react-native-vector-icons/feather";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api, resolveImage } from "@/src/lib/api";
import { useAuth } from "@/src/store/auth";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

type Shop = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  owner_name: string;
  phone: string;
  alt_phone?: string;
  whatsapp?: string;
  category_ids: string[];
  area: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  hours: string;
  services: string[];
  delivery_available: boolean;
  pickup_available: boolean;
  delivery_radius_km?: number;
  payment_methods: string[];
  public_upi?: string;
  shop_type: "online" | "offline" | "both";
  image_url?: string;
  gallery: string[];
  business_registration?: string;
  status?: string;
  online?: boolean;
};

const EMPTY: Shop = {
  id: "",
  name: "",
  tagline: "",
  description: "",
  owner_name: "",
  phone: "",
  category_ids: [],
  area: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  hours: "9:00 AM – 9:00 PM",
  services: [],
  delivery_available: false,
  pickup_available: true,
  payment_methods: ["cod"],
  shop_type: "offline",
  gallery: [],
};

export default function BecomeSellerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [shop, setShop] = useState<Shop>(EMPTY);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api
      .get<Shop | null>("/shops/mine")
      .then((data) => {
        if (data) {
          setShop({ ...EMPTY, ...data });
          setExistingId(data.id);
        } else {
          setShop({ ...EMPTY, owner_name: user?.name || "", phone: user?.phone || "" });
        }
      })
      .catch((e: any) => setError(e?.message))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <GuardMessage
        text="Please sign in to open your shop."
        cta="Sign in"
        onPress={() => router.push({ pathname: "/auth", params: { next: "/become-seller" } })}
      />
    );
  }

  if (loading) {
    return (
      <View style={[styles.root, { alignItems: "center", justifyContent: "center" }]}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }

  const field = <K extends keyof Shop>(key: K, value: Shop[K]) =>
    setShop((prev) => ({ ...prev, [key]: value }));

  const togglePayment = (code: string) => {
    const set = new Set(shop.payment_methods);
    if (set.has(code)) set.delete(code);
    else set.add(code);
    field("payment_methods", Array.from(set));
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pickLogo = () => {
    // Web: trigger a hidden <input type="file"> so we don't need expo-image-picker.
    if (Platform.OS === "web") {
      fileInputRef.current?.click();
    } else {
      setError("Image upload is only wired for the web preview in this build.");
    }
  };

  const onFile = async (e: any) => {
    const file: File | undefined = e?.target?.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const up = await api.upload(file, file.name);
      field("image_url", up.url);
    } catch (err: any) {
      setError(err?.message || "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const submit = async () => {
    setError(null);
    setSuccess(null);
    if (!shop.name.trim() || !shop.phone.trim() || !shop.address.trim()) {
      setError("Shop name, phone and address are required.");
      return;
    }
    setSaving(true);
    try {
      // Only send API-shaped fields (drop server-managed ones)
      const payload: any = { ...shop };
      delete payload.id;
      delete payload.status;
      delete payload.online;
      const saved = existingId
        ? await api.patch<Shop>(`/shops/${existingId}`, payload)
        : await api.post<Shop>("/shops", payload);
      setExistingId(saved.id);
      setShop({ ...EMPTY, ...saved });
      setSuccess(
        existingId
          ? "Shop profile updated."
          : "Shop registered. Our team will review and approve soon.",
      );
    } catch (e: any) {
      setError(e?.message || "Could not save your shop");
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (() => {
    if (!existingId) return null;
    const s = shop.status || "pending";
    const map: Record<string, { bg: string; fg: string; label: string }> = {
      pending: { bg: "#FEF3C7", fg: "#92400E", label: "Pending approval" },
      approved: { bg: "#D1FAE5", fg: "#065F46", label: "Approved" },
      suspended: { bg: "#FEE2E2", fg: "#991B1B", label: "Suspended" },
    };
    const style = map[s] || map.pending;
    return (
      <View style={[styles.badge, { backgroundColor: style.bg }]}>
        <Text style={[styles.badgeText, { color: style.fg }]}>{style.label}</Text>
      </View>
    );
  })();

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} testID="seller-back-btn" style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </Pressable>

        <View style={{ marginTop: spacing.lg }}>
          <Text style={styles.title}>
            {existingId ? "Your shop profile" : "Open your shop on Come In"}
          </Text>
          <Text style={styles.sub}>
            Shop owners get a public listing, order inbox, catalog, and customer support fallback.
          </Text>
          {statusBadge}
        </View>

        <SectionTitle text="Branding" />
        <Pressable testID="seller-upload-logo" onPress={pickLogo} style={styles.logoRow}>
          <View style={styles.logoBox}>
            {uploading ? (
              <ActivityIndicator color={colors.brandPrimary} />
            ) : shop.image_url ? (
              <Image source={{ uri: resolveImage(shop.image_url) }} style={styles.logoImg} />
            ) : (
              <Feather name="camera" size={22} color={colors.muted} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.logoLabel}>Shop logo / cover</Text>
            <Text style={styles.logoSub}>Tap to upload. JPEG / PNG, up to 5 MB.</Text>
          </View>
        </Pressable>
        {Platform.OS === "web" && (
          // @ts-ignore — web-only element rendered through RN Web
          <input
            ref={fileInputRef as any}
            type="file"
            accept="image/*"
            onChange={onFile}
            style={{ display: "none" }}
          />
        )}

        <SectionTitle text="Business" />
        <Field testID="seller-name" label="Shop name *" value={shop.name} onChange={(v) => field("name", v)} />
        <Field testID="seller-owner" label="Owner name" value={shop.owner_name} onChange={(v) => field("owner_name", v)} />
        <Field testID="seller-tagline" label="Short tagline" value={shop.tagline} onChange={(v) => field("tagline", v)} />
        <Field
          testID="seller-desc"
          label="Description"
          value={shop.description}
          onChange={(v) => field("description", v)}
          multiline
        />
        <Field testID="seller-reg" label="Business registration (optional)" value={shop.business_registration || ""} onChange={(v) => field("business_registration", v)} />

        <SectionTitle text="Contact" />
        <Field testID="seller-phone" label="Shop phone *" value={shop.phone} onChange={(v) => field("phone", v)} keyboardType="phone-pad" />
        <Field testID="seller-alt" label="Alternate phone" value={shop.alt_phone || ""} onChange={(v) => field("alt_phone", v)} keyboardType="phone-pad" />
        <Field testID="seller-wa" label="WhatsApp number" value={shop.whatsapp || ""} onChange={(v) => field("whatsapp", v)} keyboardType="phone-pad" />

        <SectionTitle text="Location" />
        <Field testID="seller-area" label="Area / locality" value={shop.area} onChange={(v) => field("area", v)} />
        <Field testID="seller-address" label="Full address *" value={shop.address} onChange={(v) => field("address", v)} multiline />
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Field testID="seller-city" label="City" value={shop.city} onChange={(v) => field("city", v)} />
          </View>
          <View style={{ flex: 1 }}>
            <Field testID="seller-state" label="State" value={shop.state} onChange={(v) => field("state", v)} />
          </View>
          <View style={{ width: 110 }}>
            <Field testID="seller-pin" label="PIN" value={shop.pincode} onChange={(v) => field("pincode", v)} keyboardType="number-pad" />
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <View style={{ flex: 1 }}>
            <Field testID="seller-lat" label="Latitude (optional)" value={shop.latitude != null ? String(shop.latitude) : ""} onChange={(v) => field("latitude", v ? Number(v) : undefined)} keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Field testID="seller-lng" label="Longitude (optional)" value={shop.longitude != null ? String(shop.longitude) : ""} onChange={(v) => field("longitude", v ? Number(v) : undefined)} keyboardType="decimal-pad" />
          </View>
        </View>
        <Text style={styles.helpText}>
          Lat/Long power the "Get directions" button. Grab them from Google Maps and paste here — a
          full map picker will activate once the Maps key is configured.
        </Text>

        <SectionTitle text="Operations" />
        <SegmentedRow
          value={shop.shop_type}
          options={[
            { value: "offline", label: "Walk-in only" },
            { value: "online", label: "Online delivery" },
            { value: "both", label: "Online + walk-in" },
          ]}
          onChange={(v) => field("shop_type", v as Shop["shop_type"])}
        />
        <Field testID="seller-hours" label="Opening hours" value={shop.hours} onChange={(v) => field("hours", v)} />
        <Field
          testID="seller-radius"
          label="Delivery radius (km)"
          value={shop.delivery_radius_km != null ? String(shop.delivery_radius_km) : ""}
          onChange={(v) => field("delivery_radius_km", v ? Number(v) : undefined)}
          keyboardType="decimal-pad"
        />
        <SwitchRow
          testID="seller-delivery"
          label="Delivery available"
          value={shop.delivery_available}
          onChange={(v) => field("delivery_available", v)}
        />
        <SwitchRow
          testID="seller-pickup"
          label="Pickup available"
          value={shop.pickup_available}
          onChange={(v) => field("pickup_available", v)}
        />

        <SectionTitle text="Payments" />
        <View style={{ gap: spacing.sm }}>
          <PaymentToggle label="Cash on Delivery" code="cod" shop={shop} onToggle={togglePayment} />
          <PaymentToggle label="UPI (public, show at shop)" code="upi" shop={shop} onToggle={togglePayment} />
          <PaymentToggle label="Online pay — Stripe (needs sandbox claim)" code="online_stripe" shop={shop} onToggle={togglePayment} disabled />
          <PaymentToggle label="Online pay — Razorpay (needs your keys)" code="online_razorpay" shop={shop} onToggle={togglePayment} disabled />
        </View>
        {shop.payment_methods.includes("upi") && (
          <Field testID="seller-upi" label="Public UPI handle" value={shop.public_upi || ""} onChange={(v) => field("public_upi", v)} placeholder="shop@upi" />
        )}

        {error && (
          <View style={styles.errorBox} testID="seller-error">
            <Feather name="alert-circle" size={14} color={colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        {success && (
          <View style={styles.successBox} testID="seller-success">
            <Feather name="check-circle" size={14} color={colors.brandPrimary} />
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}

        <Pressable
          testID="seller-save"
          disabled={saving}
          onPress={submit}
          style={[styles.submit, saving && { opacity: 0.6 }]}
        >
          {saving ? (
            <ActivityIndicator color={colors.onBrandPrimary} />
          ) : (
            <Text style={styles.submitText}>
              {existingId ? "Save shop profile" : "Submit for review"}
            </Text>
          )}
        </Pressable>

        {existingId && (
          <View style={{ gap: spacing.sm, marginTop: spacing.lg }}>
            <SmallLink label="Manage products" icon="package" onPress={() => router.push("/seller/products")} />
            <SmallLink label="Shop orders" icon="shopping-bag" onPress={() => router.push("/seller/orders")} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function GuardMessage({ text, cta, onPress }: { text: string; cta: string; onPress: () => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[styles.root, { alignItems: "center", justifyContent: "center", padding: spacing.xl }]}>
      <Feather name="user" size={32} color={colors.muted} />
      <Text style={{ marginTop: spacing.md, color: colors.onSurface, fontSize: 15 }}>{text}</Text>
      <Pressable onPress={onPress} style={styles.submit} testID="guard-cta">
        <Text style={styles.submitText}>{cta}</Text>
      </Pressable>
    </View>
  );
}

function SectionTitle({ text }: { text: string }) {
  const styles = useStyles();
  return <Text style={styles.sectionTitle}>{text}</Text>;
}

function Field({
  testID,
  label,
  value,
  onChange,
  multiline,
  keyboardType,
  placeholder,
}: {
  testID: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  keyboardType?: React.ComponentProps<typeof TextInput>["keyboardType"];
  placeholder?: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, multiline && { alignItems: "flex-start" }]}>
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={colors.muted}
          style={[styles.input, multiline && { minHeight: 60, textAlignVertical: "top" }]}
          multiline={multiline}
          keyboardType={keyboardType}
        />
      </View>
    </View>
  );
}

function SwitchRow({
  testID,
  label,
  value,
  onChange,
}: {
  testID: string;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const styles = useStyles();
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch testID={testID} value={value} onValueChange={onChange} />
    </View>
  );
}

function SegmentedRow({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            testID={`seller-shoptype-${o.value}`}
            onPress={() => onChange(o.value)}
            style={[
              styles.segmentBtn,
              active && { backgroundColor: colors.brandPrimary },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                active && { color: colors.onBrandPrimary },
              ]}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function PaymentToggle({
  label,
  code,
  shop,
  onToggle,
  disabled,
}: {
  label: string;
  code: string;
  shop: Shop;
  onToggle: (c: string) => void;
  disabled?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const active = shop.payment_methods.includes(code);
  return (
    <Pressable
      testID={`seller-pm-${code}`}
      disabled={disabled}
      onPress={() => onToggle(code)}
      style={[
        styles.pmRow,
        active && { backgroundColor: colors.brandTertiary, borderColor: colors.brandPrimary },
        disabled && { opacity: 0.5 },
      ]}
    >
      <Feather
        name={active ? "check-circle" : "circle"}
        size={16}
        color={active ? colors.brandPrimary : colors.muted}
      />
      <Text style={styles.pmText}>{label}</Text>
    </Pressable>
  );
}

function SmallLink({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  onPress: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={styles.smallLink} testID={`seller-link-${label}`}>
      <Feather name={icon} size={16} color={colors.brandPrimary} />
      <Text style={styles.smallLinkText}>{label}</Text>
      <Feather name="chevron-right" size={16} color={colors.muted} />
    </Pressable>
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
  title: { fontSize: 22, fontWeight: "800", color: colors.onSurface },
  sub: { fontSize: 13, color: colors.muted, marginTop: 4 },
  badge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm, marginTop: spacing.sm },
  badgeText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.3 },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    color: colors.muted,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.onSurfaceSecondary,
    marginTop: spacing.sm,
    marginBottom: 6,
  },
  helpText: { fontSize: 11, color: colors.muted, marginTop: 4 },
  inputWrap: {
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  input: { fontSize: 14, color: colors.onSurface, padding: 0 },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoImg: { width: "100%", height: "100%" },
  logoLabel: { fontSize: 14, color: colors.onSurface, fontWeight: "700" },
  logoSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    marginTop: spacing.sm,
  },
  switchLabel: { fontSize: 13, color: colors.onSurface },
  segment: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    padding: 4,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.sm,
    alignItems: "center",
  },
  segmentText: { fontSize: 12, fontWeight: "700", color: colors.onSurfaceSecondary },
  pmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  pmText: { flex: 1, fontSize: 13, color: colors.onSurface },
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
  successBox: {
    marginTop: spacing.md,
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  successText: { color: colors.onBrandTertiary, fontSize: 12, flex: 1 },
  submit: {
    marginTop: spacing.xl,
    backgroundColor: colors.brandPrimary,
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: "center",
  },
  submitText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 15 },
  smallLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  smallLinkText: { flex: 1, fontSize: 14, fontWeight: "700", color: colors.onSurface },
}));

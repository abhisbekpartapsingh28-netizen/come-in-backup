// Customer — Cash-on-Delivery checkout.
// Prefills from account + saved delivery address. Online payments scaffolded.
import Feather from "@react-native-vector-icons/feather";
import { useRouter } from "expo-router";
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

import { api } from "@/src/lib/api";
import { useAuth } from "@/src/store/auth";
import { useCart } from "@/src/store/cart";
import { useLocationCtx } from "@/src/store/location";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

const DEFAULT_LOCATION = "Set delivery location";

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { cartLines, subtotal, deliveryFee, total, clear } = useCart();
  const { location } = useLocationCtx();

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(location === DEFAULT_LOCATION ? "" : location);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod">("cod");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const canPlace = name.trim() && phone.trim() && address.trim() && cartLines.length > 0;

  const place = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const items = cartLines.map((line) => ({
        product_id: line.product.id,
        name: line.product.name,
        unit: line.product.unit,
        price: line.product.price,
        qty: line.qty,
        image_url: line.product.image,
      }));
      const order = await api.post<any>("/orders", {
        items,
        delivery_address: address,
        customer_name: name,
        customer_phone: phone,
        delivery_fee: deliveryFee,
        notes,
        payment_method: paymentMethod,
      }, false);
      await clear();
      setPlaced(order);
    } catch (e: any) {
      setError(e?.message || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <View style={styles.success}>
        <View style={styles.sIcon}><Feather name="check" size={32} color={colors.onBrandPrimary} /></View>
        <Text style={styles.sTitle}>Order placed!</Text>
        <Text style={styles.sSub}>Reference <Text style={{ fontWeight: "800" }}>{placed.ref}</Text></Text>
        <Text style={styles.sSub}>Pay ₹{placed.total} on delivery</Text>
        <Pressable testID="success-home" onPress={() => router.replace("/(tabs)")} style={styles.primary}>
          <Text style={styles.primaryText}>Keep shopping</Text>
        </Pressable>
        <Pressable testID="success-orders" onPress={() => router.replace("/orders")}>
          <Text style={{ color: colors.brandPrimary, fontWeight: "700", marginTop: spacing.md }}>Track my orders</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}><Feather name="arrow-left" size={20} color={colors.onSurface} /></Pressable>
        <Text style={styles.title}>Checkout</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 160 }} keyboardShouldPersistTaps="handled">
        <SectionTitle text="Delivery details" />
        <Field testID="co-name" label="Full name" value={name} onChange={setName} />
        <Field testID="co-phone" label="Phone number" value={phone} onChange={setPhone} keyboardType="phone-pad" />
        <Field testID="co-address" label="Delivery address" value={address} onChange={setAddress} multiline />
        <Field testID="co-notes" label="Notes for shop (optional)" value={notes} onChange={setNotes} multiline />

        <SectionTitle text="Payment" />
        <Pressable testID="pm-cod" onPress={() => setPaymentMethod("cod")} style={[styles.pmRow, paymentMethod === "cod" && { borderColor: colors.brandPrimary, backgroundColor: colors.brandTertiary }]}>
          <Feather name="dollar-sign" size={16} color={colors.brandPrimary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pmTitle}>Cash on Delivery</Text>
            <Text style={styles.pmSub}>Pay in cash when the order reaches you.</Text>
          </View>
          <Feather name={paymentMethod === "cod" ? "check-circle" : "circle"} size={18} color={paymentMethod === "cod" ? colors.brandPrimary : colors.muted} />
        </Pressable>
        <View style={[styles.pmRow, { opacity: 0.6 }]}>
          <Feather name="credit-card" size={16} color={colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pmTitle}>Online pay (Stripe / Razorpay)</Text>
            <Text style={styles.pmSub}>Activate from the Admin dashboard once your payment keys are configured.</Text>
          </View>
          <Feather name="lock" size={14} color={colors.muted} />
        </View>

        <SectionTitle text="Order summary" />
        <View style={styles.bill}>
          {cartLines.map((l) => (
            <View key={l.product.id} style={styles.billLine}>
              <Text style={styles.billName}>{l.qty} × {l.product.name}</Text>
              <Text style={styles.billValue}>₹{(l.product.price * l.qty).toFixed(0)}</Text>
            </View>
          ))}
          <View style={styles.billLine}><Text style={styles.billName}>Items subtotal</Text><Text style={styles.billValue}>₹{subtotal}</Text></View>
          <View style={styles.billLine}><Text style={styles.billName}>Delivery</Text><Text style={styles.billValue}>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</Text></View>
          <View style={styles.divider} />
          <View style={styles.billLine}><Text style={[styles.billName, { fontWeight: "800", color: colors.onSurface }]}>To pay</Text><Text style={[styles.billValue, { fontWeight: "800", fontSize: 16 }]}>₹{total}</Text></View>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      <View style={[styles.cta, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Pressable
          testID="place-order-btn"
          disabled={!canPlace || submitting}
          onPress={place}
          style={[styles.primary, (!canPlace || submitting) && { opacity: 0.5 }]}
        >
          {submitting ? <ActivityIndicator color={colors.onBrandPrimary} /> : (
            <Text style={styles.primaryText}>
              {cartLines.length === 0 ? "Your cart is empty" : `Place order · ₹${total}`}
            </Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function SectionTitle({ text }: { text: string }) {
  const styles = useStyles();
  return <Text style={styles.sectionTitle}>{text}</Text>;
}

function Field({ testID, label, value, onChange, multiline, keyboardType }: any) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, multiline && { alignItems: "flex-start" }]}>
        <TextInput testID={testID} value={value} onChangeText={onChange} placeholderTextColor={colors.muted} style={[styles.input, multiline && { minHeight: 60 }]} multiline={multiline} keyboardType={keyboardType} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm, fontSize: 12, fontWeight: "800", letterSpacing: 0.5, color: colors.muted },
  label: { marginTop: spacing.sm, marginBottom: 6, fontSize: 12, fontWeight: "700", color: colors.onSurfaceSecondary },
  inputWrap: { backgroundColor: colors.surfaceTertiary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: Platform.OS === "ios" ? 12 : 8 },
  input: { fontSize: 14, color: colors.onSurface, padding: 0 },
  pmRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.sm },
  pmTitle: { fontSize: 14, fontWeight: "700", color: colors.onSurface },
  pmSub: { fontSize: 11, color: colors.muted, marginTop: 2 },
  bill: { marginTop: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: 4 },
  billLine: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  billName: { fontSize: 13, color: colors.onSurfaceSecondary },
  billValue: { fontSize: 13, color: colors.onSurface, fontWeight: "600" },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginVertical: 4 },
  cta: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, paddingTop: spacing.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  primary: { backgroundColor: colors.brandPrimary, paddingVertical: 14, borderRadius: radius.md, alignItems: "center" },
  primaryText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 15 },
  errorText: { color: colors.error, fontSize: 12, marginTop: spacing.md },
  success: { flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.sm },
  sIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.brandPrimary, alignItems: "center", justifyContent: "center", marginBottom: spacing.md },
  sTitle: { fontSize: 20, fontWeight: "800", color: colors.onSurface },
  sSub: { fontSize: 13, color: colors.muted },
}));

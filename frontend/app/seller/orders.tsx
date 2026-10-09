// Seller — Orders inbox with status transitions.
import Feather from "@react-native-vector-icons/feather";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/lib/api";
import { useAuth } from "@/src/store/auth";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

const NEXT: Record<string, { label: string; next: string }[]> = {
  pending: [{ label: "Accept", next: "accepted" }, { label: "Decline", next: "cancelled" }],
  accepted: [{ label: "Start preparing", next: "preparing" }],
  preparing: [{ label: "Mark ready", next: "ready" }],
  ready: [{ label: "Out for delivery", next: "out_for_delivery" }],
  out_for_delivery: [{ label: "Mark delivered", next: "delivered" }],
};

export default function SellerOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [shop, setShop] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const s = await api.get<any>("/shops/mine");
    setShop(s);
    if (s) {
      const list = await api.get<any[]>(`/shops/${s.id}/orders`);
      setOrders(list);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    load().finally(() => setLoading(false));
  }, [user, load]);

  const toggleAvailability = async (v: boolean) => {
    if (!shop) return;
    const updated = await api.patch<any>(`/shops/${shop.id}/availability`, { online: v });
    setShop(updated);
  };

  const advance = async (orderId: string, nextStatus: string) => {
    await api.patch(`/orders/${orderId}/status`, { status: nextStatus, note: "" });
    await load();
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.msg}>Please sign in.</Text>
        <Pressable style={styles.primary} onPress={() => router.push("/auth")}><Text style={styles.primaryText}>Sign in</Text></Pressable>
      </View>
    );
  }
  if (loading) return <View style={styles.centered}><ActivityIndicator color={colors.brandPrimary} /></View>;
  if (!shop) {
    return (
      <View style={styles.centered}>
        <Text style={styles.msg}>Register your shop to see orders here.</Text>
        <Pressable style={styles.primary} onPress={() => router.push("/become-seller")}><Text style={styles.primaryText}>Open your shop</Text></Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}><Feather name="arrow-left" size={20} color={colors.onSurface} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{shop.name}</Text>
          <Text style={styles.sub}>{orders.length} orders</Text>
        </View>
        <View style={styles.toggle}>
          <Text style={[styles.toggleLabel, { color: shop.online ? colors.brandPrimary : colors.muted }]}>
            {shop.online ? "Online" : "Offline"}
          </Text>
          <Switch
            testID="seller-availability-toggle"
            value={!!shop.online}
            disabled={shop.status !== "approved"}
            onValueChange={toggleAvailability}
          />
        </View>
      </View>

      {shop.status !== "approved" && (
        <View style={styles.hint}>
          <Feather name="clock" size={14} color={colors.brandPrimary} />
          <Text style={styles.hintText}>Your shop is {shop.status}. Once admin approves it, you can go online and accept orders.</Text>
        </View>
      )}

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        ListEmptyComponent={<Text style={styles.msg}>No orders yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.ref}>{item.ref}</Text>
              <Text style={[styles.status, { color: statusColor(item.status, colors) }]}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={styles.cust}>{item.customer_name || "Guest"} · {item.customer_phone || "no phone"}</Text>
            <Text style={styles.addr}>{item.delivery_address}</Text>
            <View style={styles.items}>
              {item.items.map((line: any, idx: number) => (
                <Text key={idx} style={styles.line}>• {line.qty} × {line.name} — ₹{(line.price * line.qty).toFixed(0)}</Text>
              ))}
            </View>
            <Text style={styles.total}>Total ₹{item.total}  ·  {paymentLabel(item.payment_method)}</Text>
            {(NEXT[item.status] || []).length > 0 && (
              <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: 8, flexWrap: "wrap" }}>
                {(NEXT[item.status] || []).map((a) => (
                  <Pressable key={a.next} testID={`advance-${item.id}-${a.next}`} onPress={() => advance(item.id, a.next)} style={styles.actionBtn}>
                    <Text style={styles.actionText}>{a.label}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

function paymentLabel(m: string) {
  if (m === "cod") return "COD";
  if (m === "online_stripe") return "Online (Stripe)";
  if (m === "online_razorpay") return "Online (Razorpay)";
  return m;
}

function statusColor(s: string, c: any) {
  if (s === "delivered") return c.brandPrimary;
  if (s === "cancelled") return c.error;
  return c.onSurface;
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surfaceSecondary },
  centered: { flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  sub: { fontSize: 11, color: colors.muted },
  toggle: { flexDirection: "row", alignItems: "center", gap: 6 },
  toggleLabel: { fontSize: 11, fontWeight: "800" },
  hint: { flexDirection: "row", gap: 6, padding: spacing.sm, margin: spacing.lg, borderRadius: radius.md, backgroundColor: colors.brandTertiary, alignItems: "flex-start" },
  hintText: { flex: 1, fontSize: 12, color: colors.onBrandTertiary },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, gap: 4 },
  ref: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  status: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  cust: { fontSize: 12, color: colors.onSurface, marginTop: 2 },
  addr: { fontSize: 11, color: colors.muted },
  items: { marginTop: spacing.sm, gap: 2 },
  line: { fontSize: 12, color: colors.onSurface },
  total: { marginTop: spacing.sm, fontSize: 13, fontWeight: "800", color: colors.brandPrimary },
  actionBtn: { backgroundColor: colors.brandPrimary, paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill },
  actionText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 11 },
  msg: { fontSize: 14, color: colors.onSurface, textAlign: "center" },
  primary: { backgroundColor: colors.brandPrimary, paddingVertical: 12, paddingHorizontal: spacing.lg, borderRadius: radius.md },
  primaryText: { color: colors.onBrandPrimary, fontWeight: "800" },
}));

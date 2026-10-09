// Customer — My orders.
import Feather from "@react-native-vector-icons/feather";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/lib/api";
import { useAuth } from "@/src/store/auth";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function MyOrdersScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.get<any[]>("/orders/mine").then(setOrders).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.msg}>Sign in to see your past orders.</Text>
        <Pressable style={styles.primary} onPress={() => router.push({ pathname: "/auth", params: { next: "/orders" } })}>
          <Text style={styles.primaryText}>Sign in</Text>
        </Pressable>
      </View>
    );
  }
  if (loading) return <View style={styles.centered}><ActivityIndicator color={colors.brandPrimary} /></View>;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}><Feather name="arrow-left" size={20} color={colors.onSurface} /></Pressable>
        <Text style={styles.title}>Your orders</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        ListEmptyComponent={<Text style={styles.msg}>No orders yet. Start adding items to your cart!</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.ref}>{item.ref}</Text>
              <Text style={styles.status}>{item.status.toUpperCase()}</Text>
            </View>
            <Text style={styles.meta}>{item.items.length} items · ₹{item.total} · {item.payment_method === "cod" ? "COD" : item.payment_method}</Text>
            <Text style={styles.addr}>Delivering to {item.delivery_address}</Text>
          </View>
        )}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surfaceSecondary },
  centered: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.surface, padding: spacing.xl, gap: spacing.md },
  header: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, alignItems: "center" },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  ref: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  status: { fontSize: 10, fontWeight: "800", color: colors.brandPrimary, letterSpacing: 0.5 },
  meta: { fontSize: 12, color: colors.onSurfaceSecondary, marginTop: 4 },
  addr: { fontSize: 11, color: colors.muted, marginTop: 2 },
  msg: { fontSize: 14, color: colors.onSurface, textAlign: "center" },
  primary: { backgroundColor: colors.brandPrimary, paddingVertical: 12, paddingHorizontal: spacing.lg, borderRadius: radius.md },
  primaryText: { color: colors.onBrandPrimary, fontWeight: "800" },
}));

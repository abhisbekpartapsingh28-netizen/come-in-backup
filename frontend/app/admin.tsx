// Admin — Operations dashboard (shops approvals + requests queue).
import Feather from "@react-native-vector-icons/feather";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { api } from "@/src/lib/api";
import { useAuth } from "@/src/store/auth";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

type Tab = "shops" | "orders" | "anything" | "assist";

export default function AdminScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>("shops");
  const [shops, setShops] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [anything, setAnything] = useState<any[]>([]);
  const [assist, setAssist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [s, o, a, g] = await Promise.all([
      api.get<any[]>("/admin/shops"),
      api.get<any[]>("/admin/orders"),
      api.get<any[]>("/admin/requests/anything"),
      api.get<any[]>("/admin/requests/assist"),
    ]);
    setShops(s); setOrders(o); setAnything(a); setAssist(g);
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (user.role !== "admin") {
      setLoading(false);
      return;
    }
    load().finally(() => setLoading(false));
  }, [user, load]);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.msg}>Please sign in as admin to continue.</Text>
        <Pressable style={styles.primary} onPress={() => router.push("/auth")}><Text style={styles.primaryText}>Sign in</Text></Pressable>
      </View>
    );
  }
  if (user.role !== "admin") {
    return (
      <View style={styles.centered}>
        <Feather name="shield" size={32} color={colors.muted} />
        <Text style={styles.msg}>This area is restricted to Come In admins.</Text>
      </View>
    );
  }
  if (loading) return <View style={styles.centered}><ActivityIndicator color={colors.brandPrimary} /></View>;

  const setShopStatus = async (id: string, status: string) => {
    await api.patch(`/admin/shops/${id}/status`, { status });
    await load();
  };

  const setReqStatus = async (kind: "anything" | "assist", id: string, status: string) => {
    await api.patch(`/admin/requests/${kind}/${id}/status`, { status, note: "" });
    await load();
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}><Feather name="arrow-left" size={20} color={colors.onSurface} /></Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Admin</Text>
          <Text style={styles.sub}>Come In operations</Text>
        </View>
      </View>

      <View style={styles.tabs}>
        {([
          { k: "shops", label: `Shops (${shops.length})` },
          { k: "orders", label: `Orders (${orders.length})` },
          { k: "anything", label: `Requests (${anything.length})` },
          { k: "assist", label: `Agent (${assist.length})` },
        ] as const).map((t) => (
          <Pressable key={t.k} onPress={() => setTab(t.k as Tab)} style={[styles.tab, tab === t.k && { backgroundColor: colors.brandPrimary }]} testID={`admin-tab-${t.k}`}>
            <Text style={[styles.tabText, tab === t.k && { color: colors.onBrandPrimary }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        {tab === "shops" && shops.map((s) => (
          <View key={s.id} style={styles.card} testID={`admin-shop-${s.id}`}>
            <Text style={styles.cardTitle}>{s.name}</Text>
            <Text style={styles.cardMeta}>{s.area || s.address || "—"} · {s.shop_type} · {s.status}</Text>
            <Text style={styles.cardMeta}>phone {s.phone || "—"}</Text>
            <View style={styles.btnRow}>
              {s.status !== "approved" && <ActionBtn label="Approve" onPress={() => setShopStatus(s.id, "approved")} testID={`approve-${s.id}`} />}
              {s.status !== "suspended" && <ActionBtn label="Suspend" onPress={() => setShopStatus(s.id, "suspended")} testID={`suspend-${s.id}`} tone="danger" />}
              {s.status !== "pending" && <ActionBtn label="Reset" onPress={() => setShopStatus(s.id, "pending")} tone="ghost" />}
            </View>
          </View>
        ))}
        {tab === "orders" && orders.map((o) => (
          <View key={o.id} style={styles.card}>
            <Text style={styles.cardTitle}>{o.ref} — ₹{o.total}</Text>
            <Text style={styles.cardMeta}>{o.customer_name || "Guest"} · {o.payment_method} · {o.status}</Text>
            <Text style={styles.cardMeta}>{o.delivery_address}</Text>
          </View>
        ))}
        {tab === "anything" && anything.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.cardTitle}>{r.ref}</Text>
            <Text style={styles.cardMeta}>{r.description}</Text>
            <Text style={styles.cardMeta}>drop {r.drop} · {r.status}</Text>
            <View style={styles.btnRow}>
              <ActionBtn label="Assign" onPress={() => setReqStatus("anything", r.id, "assigned")} />
              <ActionBtn label="Complete" onPress={() => setReqStatus("anything", r.id, "completed")} />
              <ActionBtn label="Cancel" onPress={() => setReqStatus("anything", r.id, "cancelled")} tone="danger" />
            </View>
          </View>
        ))}
        {tab === "assist" && assist.map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.cardTitle}>{r.ref}</Text>
            <Text style={styles.cardMeta}>{r.reason}</Text>
            <Text style={styles.cardMeta}>shop {r.shop_id || "–"} · {r.status}</Text>
            <View style={styles.btnRow}>
              <ActionBtn label="Assign" onPress={() => setReqStatus("assist", r.id, "assigned")} />
              <ActionBtn label="Complete" onPress={() => setReqStatus("assist", r.id, "completed")} />
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function ActionBtn({ label, onPress, tone, testID }: { label: string; onPress: () => void; tone?: "danger" | "ghost"; testID?: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const bg = tone === "danger" ? colors.error : tone === "ghost" ? colors.surfaceTertiary : colors.brandPrimary;
  const fg = tone === "ghost" ? colors.onSurface : colors.onBrandPrimary;
  return (
    <Pressable testID={testID} onPress={onPress} style={[styles.actionBtn, { backgroundColor: bg }]}>
      <Text style={[styles.actionText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surfaceSecondary },
  centered: { flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, backgroundColor: colors.surface, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  sub: { fontSize: 11, color: colors.muted },
  tabs: { flexDirection: "row", gap: 6, padding: spacing.sm, backgroundColor: colors.surface, flexWrap: "wrap" },
  tab: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border },
  tabText: { fontSize: 11, fontWeight: "800", color: colors.onSurfaceSecondary },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, gap: 4 },
  cardTitle: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  cardMeta: { fontSize: 11, color: colors.muted },
  btnRow: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  actionBtn: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.pill },
  actionText: { fontSize: 11, fontWeight: "800" },
  msg: { fontSize: 14, color: colors.onSurface, textAlign: "center" },
  primary: { backgroundColor: colors.brandPrimary, paddingVertical: 12, paddingHorizontal: spacing.lg, borderRadius: radius.md },
  primaryText: { color: colors.onBrandPrimary, fontWeight: "800" },
}));

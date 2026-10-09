// Seller — Product management
import Feather from "@react-native-vector-icons/feather";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
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
import { CATEGORIES } from "@/src/data/catalog";

type Product = {
  id: string;
  name: string;
  brand: string;
  unit: string;
  price: number;
  mrp?: number;
  stock: number;
  image_url?: string;
  category_id: string;
  description: string;
  available: boolean;
};

const EMPTY: Product = {
  id: "",
  name: "",
  brand: "",
  unit: "",
  price: 0,
  stock: 0,
  category_id: "",
  description: "",
  available: true,
};

export default function SellerProductsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { user } = useAuth();
  const [shopId, setShopId] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = async (sid: string) => {
    const list = await api.get<Product[]>(`/shops/${sid}/products`);
    setProducts(list);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api.get<{ id: string } | null>("/shops/mine").then(async (s) => {
      if (!s) {
        setLoading(false);
        return;
      }
      setShopId(s.id);
      await load(s.id);
      setLoading(false);
    });
  }, [user]);

  const openNew = () => setEditing({ ...EMPTY });
  const openEdit = (p: Product) => setEditing({ ...p });
  const close = () => setEditing(null);

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const up = await api.upload(file, file.name);
      setEditing((prev) => (prev ? { ...prev, image_url: up.url } : prev));
    } catch (e: any) {
      setError(e?.message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const save = async () => {
    if (!editing || !shopId) return;
    if (!editing.name.trim() || editing.price <= 0) {
      setError("Name and price are required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: any = { ...editing };
      delete payload.id;
      let saved: Product;
      if (editing.id) saved = await api.patch<Product>(`/products/${editing.id}`, payload);
      else saved = await api.post<Product>(`/shops/${shopId}/products`, payload);
      await load(shopId);
      setEditing(null);
    } catch (e: any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: Product) => {
    try {
      await api.del(`/products/${p.id}`);
      if (shopId) await load(shopId);
    } catch (e: any) {
      setError(e?.message);
    }
  };

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={styles.msg}>Please sign in to manage products.</Text>
        <Pressable style={styles.primary} onPress={() => router.push("/auth")}>
          <Text style={styles.primaryText}>Sign in</Text>
        </Pressable>
      </View>
    );
  }
  if (loading) return <View style={styles.centered}><ActivityIndicator color={colors.brandPrimary} /></View>;
  if (!shopId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.msg}>Register your shop first.</Text>
        <Pressable style={styles.primary} onPress={() => router.push("/become-seller")}>
          <Text style={styles.primaryText}>Open your shop</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Your products</Text>
          <Text style={styles.sub}>{products.length} listed</Text>
        </View>
        <Pressable testID="seller-add-product" onPress={openNew} style={styles.addBtn}>
          <Feather name="plus" size={16} color={colors.onBrandPrimary} />
          <Text style={styles.addText}>Add</Text>
        </Pressable>
      </View>

      {editing ? (
        <ScrollView
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 160 }}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable testID="prod-upload" onPress={() => fileRef.current?.click()} style={styles.logoRow}>
            <View style={styles.logoBox}>
              {uploading ? <ActivityIndicator /> : editing.image_url ? (
                <Image source={{ uri: resolveImage(editing.image_url) }} style={styles.logoImg} />
              ) : <Feather name="camera" size={22} color={colors.muted} />}
            </View>
            <Text style={styles.msg}>Product photo</Text>
          </Pressable>
          {Platform.OS === "web" && (
            // @ts-ignore
            <input ref={fileRef as any} type="file" accept="image/*" style={{ display: "none" }} onChange={(e: any) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
          )}

          <Field label="Name *" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
          <Field label="Brand" value={editing.brand} onChange={(v) => setEditing({ ...editing, brand: v })} />
          <Field label="Unit" value={editing.unit} onChange={(v) => setEditing({ ...editing, unit: v })} placeholder="e.g. 1 kg" />
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <Field label="Price (₹) *" value={String(editing.price)} onChange={(v) => setEditing({ ...editing, price: Number(v) || 0 })} keyboardType="decimal-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="MRP (₹)" value={editing.mrp != null ? String(editing.mrp) : ""} onChange={(v) => setEditing({ ...editing, mrp: v ? Number(v) : undefined })} keyboardType="decimal-pad" />
            </View>
            <View style={{ width: 100 }}>
              <Field label="Stock" value={String(editing.stock)} onChange={(v) => setEditing({ ...editing, stock: Number(v) || 0 })} keyboardType="number-pad" />
            </View>
          </View>

          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: 4 }}>
            {CATEGORIES.map((c) => {
              const active = c.id === editing.category_id;
              return (
                <Pressable key={c.id} onPress={() => setEditing({ ...editing, category_id: c.id })} style={[styles.catChip, active && { backgroundColor: colors.brandPrimary }]}>
                  <Text style={[styles.catChipText, active && { color: colors.onBrandPrimary }]}>{c.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Field label="Description" value={editing.description} onChange={(v) => setEditing({ ...editing, description: v })} multiline />
          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Available</Text>
            <Switch value={editing.available} onValueChange={(v) => setEditing({ ...editing, available: v })} />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
          <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg }}>
            <Pressable onPress={close} style={[styles.primary, { flex: 1, backgroundColor: colors.surfaceTertiary }]}><Text style={{ color: colors.onSurface, fontWeight: "700" }}>Cancel</Text></Pressable>
            <Pressable testID="prod-save" onPress={save} disabled={saving} style={[styles.primary, { flex: 2 }, saving && { opacity: 0.6 }]}>
              {saving ? <ActivityIndicator color={colors.onBrandPrimary} /> : <Text style={styles.primaryText}>{editing.id ? "Save changes" : "Add product"}</Text>}
            </Pressable>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}>
          {products.length === 0 && (
            <Text style={styles.msg}>You haven't added any products yet. Tap "Add" to list your first product.</Text>
          )}
          {products.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.thumb}>
                {p.image_url ? <Image source={{ uri: resolveImage(p.image_url) }} style={{ width: "100%", height: "100%" }} /> : <Feather name="package" size={22} color={colors.muted} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pname}>{p.name}</Text>
                <Text style={styles.pmeta}>₹{p.price} · {p.unit || "–"} · stock {p.stock}{!p.available && " · hidden"}</Text>
              </View>
              <Pressable onPress={() => openEdit(p)} hitSlop={10}><Feather name="edit-2" size={16} color={colors.brandPrimary} /></Pressable>
              <Pressable onPress={() => remove(p)} hitSlop={10}><Feather name="trash-2" size={16} color={colors.error} /></Pressable>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

function Field({ label, value, onChange, multiline, keyboardType, placeholder }: any) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, multiline && { alignItems: "flex-start" }]}>
        <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.muted} style={[styles.input, multiline && { minHeight: 60 }]} multiline={multiline} keyboardType={keyboardType} />
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  centered: { flex: 1, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", padding: spacing.xl, gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingBottom: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  sub: { fontSize: 11, color: colors.muted },
  addBtn: { flexDirection: "row", gap: 4, backgroundColor: colors.brandPrimary, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.pill },
  addText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 12 },
  card: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface },
  thumb: { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  pname: { fontSize: 14, fontWeight: "700", color: colors.onSurface },
  pmeta: { fontSize: 11, color: colors.muted, marginTop: 2 },
  label: { marginTop: spacing.sm, marginBottom: 6, fontSize: 12, fontWeight: "700", color: colors.onSurfaceSecondary },
  inputWrap: { backgroundColor: colors.surfaceTertiary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: Platform.OS === "ios" ? 12 : 8 },
  input: { fontSize: 14, color: colors.onSurface, padding: 0 },
  switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surfaceTertiary, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 10, marginTop: spacing.sm },
  switchLabel: { fontSize: 13, color: colors.onSurface },
  catChip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.surfaceTertiary },
  catChipText: { fontSize: 12, fontWeight: "700", color: colors.onSurfaceSecondary },
  logoRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginVertical: spacing.sm },
  logoBox: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.surfaceTertiary, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  logoImg: { width: "100%", height: "100%" },
  msg: { fontSize: 14, color: colors.onSurface },
  primary: { backgroundColor: colors.brandPrimary, paddingVertical: 12, paddingHorizontal: spacing.lg, borderRadius: radius.md, alignItems: "center" },
  primaryText: { color: colors.onBrandPrimary, fontWeight: "800" },
  errorText: { color: colors.error, fontSize: 12, marginTop: spacing.sm },
}));

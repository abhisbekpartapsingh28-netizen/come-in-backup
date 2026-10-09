import Feather from "@react-native-vector-icons/feather";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCard } from "@/src/components/ProductCard";
import { useT } from "@/src/i18n";
import { getShopById, getShopProducts, Shop as SeedShop } from "@/src/data/shops";
import { api, resolveImage } from "@/src/lib/api";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function ShopDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useT();

  // The shop can come from the live DB (approved shopkeeper) or from the
  // in-app seed catalog. We try the API first; if nothing matches we fall
  // back to the demo catalog so legacy IDs keep working.
  const [liveShop, setLiveShop] = useState<any>(null);
  const [liveProducts, setLiveProducts] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [assistOpen, setAssistOpen] = useState(false);
  const [assistReason, setAssistReason] = useState("");
  const [assistPhone, setAssistPhone] = useState("");
  const [assistBusy, setAssistBusy] = useState(false);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const s = await api.get<any>(`/shops/${id}`);
        setLiveShop(s);
        const prods = await api.get<any[]>(`/shops/${id}/products`);
        setLiveProducts(prods);
      } catch {
        setLiveShop(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const seedShop: SeedShop | undefined = id ? getShopById(id) : undefined;
  const shop: any = liveShop || seedShop;

  if (loading) {
    return (
      <View style={styles.missing}>
        <ActivityIndicator color={colors.brandPrimary} />
      </View>
    );
  }

  if (!shop) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>{t("shops.notFound")}</Text>
        <Pressable testID="shop-back-missing" onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{t("common.goHome")}</Text>
        </Pressable>
      </View>
    );
  }

  // Normalize fields between live + seed shapes
  const image = liveShop ? resolveImage(liveShop.image_url) : (seedShop?.image as string | undefined);
  const area = shop.area || "";
  const address = shop.address || "";
  const hours = shop.hours || "";
  const openNow = liveShop ? Boolean(liveShop.online) : Boolean(seedShop?.openNow);
  const shopType: string = shop.shop_type || seedShop?.type || "offline";
  const deliveryAvailable = Boolean(shop.delivery_available ?? seedShop?.deliveryAvailable);
  const pickupAvailable = Boolean(shop.pickup_available ?? seedShop?.pickupAvailable);
  const phoneNumber: string = shop.phone || "";
  const whatsapp: string = shop.whatsapp || "";
  const lat = shop.latitude;
  const lng = shop.longitude;

  const products = liveProducts ?? (seedShop ? getShopProducts(seedShop) : []);
  const typeTag =
    shopType === "online" ? t("shops.type.online") : shopType === "offline" ? t("shops.type.offline") : t("shops.type.both");

  const openUrl = async (url: string, fallbackMsg: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert(t("shops.callUnavailable"), fallbackMsg);
    } catch {
      Alert.alert(t("shops.callUnavailable"), fallbackMsg);
    }
  };

  const callShop = () => openUrl(`tel:${phoneNumber}`, phoneNumber);
  const waShop = () => {
    const num = (whatsapp || phoneNumber).replace(/[^0-9+]/g, "").replace(/^\+/, "");
    if (!num) {
      Alert.alert(t("shops.callUnavailable"));
      return;
    }
    openUrl(`https://wa.me/${num}?text=Hi%20${encodeURIComponent(shop.name)}`, num);
  };
  const directions = () => {
    const q = lat && lng ? `${lat},${lng}` : encodeURIComponent(`${address} ${area}`);
    const url = `https://www.google.com/maps/search/?api=1&query=${q}`;
    openUrl(url, address);
  };

  const submitAssist = async () => {
    if (!assistReason.trim()) return;
    setAssistBusy(true);
    try {
      const res = await api.post<any>("/requests/assist", {
        shop_id: liveShop?.id,
        reason: assistReason,
        customer_phone: assistPhone,
      }, false);
      setAssistOpen(false);
      setAssistReason("");
      setAssistPhone("");
      Alert.alert(
        "Request received",
        `A Come In agent will reach out shortly. Reference: ${res?.ref || "sent"}`,
      );
    } catch (e: any) {
      Alert.alert("Could not submit", e?.message || "Please try again");
    } finally {
      setAssistBusy(false);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxl + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          {image ? <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" /> : null}
          <View style={styles.heroShade} />
          <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
            <Pressable
              testID="shop-back-btn"
              onPress={() => router.back()}
              style={styles.circleBtn}
            >
              <Feather name="arrow-left" size={18} color={colors.onSurface} />
            </Pressable>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{shop.name}</Text>
            <View
              style={[
                styles.typePill,
                {
                  backgroundColor:
                    shopType === "offline" ? colors.brandSecondary : colors.brandTertiary,
                },
              ]}
            >
              <Text
                style={[
                  styles.typePillText,
                  {
                    color: shopType === "offline" ? colors.onBrandSecondary : colors.brandPrimary,
                  },
                ]}
              >
                {typeTag}
              </Text>
            </View>
          </View>
          {shop.tagline ? <Text style={styles.tagline}>{shop.tagline}</Text> : null}

          <View style={styles.metaCard}>
            <MetaRow icon="map-pin" label={t("shops.detail.address")} value={`${area}\n${address}`.trim()} />
            <View style={styles.divider} />
            <MetaRow icon="clock" label={t("shops.detail.hours")} value={`${hours}${openNow ? ` • ${t("shops.openNow")}` : ` • ${t("shops.closed")}`}`} />
            <View style={styles.divider} />
            <MetaRow
              icon="truck"
              label={t("shops.detail.services")}
              value={[
                shopType !== "offline" && t("shops.detail.canOrderOnline"),
                deliveryAvailable && t("shops.detail.deliveryAvailable"),
                pickupAvailable && t("shops.detail.pickupAvailable"),
                shopType === "offline" && t("shops.detail.visitInStore"),
              ].filter(Boolean).join(" • ")}
            />
          </View>

          <View style={styles.actionRow}>
            <Pressable testID="shop-call-btn" onPress={callShop} style={styles.callBtn}>
              <Feather name="phone" size={16} color={colors.onBrandPrimary} />
              <Text style={styles.callBtnText}>{t("shops.callShop")}</Text>
            </Pressable>
            <Pressable testID="shop-wa-btn" onPress={waShop} style={styles.secondaryBtn}>
              <Feather name="message-circle" size={16} color={colors.brandPrimary} />
              <Text style={styles.secondaryText}>WhatsApp</Text>
            </Pressable>
          </View>
          <View style={styles.actionRow}>
            <Pressable testID="shop-dir-btn" onPress={directions} style={styles.secondaryBtn}>
              <Feather name="navigation" size={16} color={colors.brandPrimary} />
              <Text style={styles.secondaryText}>Get directions</Text>
            </Pressable>
            <Pressable testID="shop-assist-btn" onPress={() => setAssistOpen(true)} style={styles.secondaryBtn}>
              <Feather name="life-buoy" size={16} color={colors.brandPrimary} />
              <Text style={styles.secondaryText}>Come In agent</Text>
            </Pressable>
          </View>

          <Text style={styles.sectionTitle}>{t("shops.detail.products")}</Text>
          {products.length === 0 ? (
            <View style={styles.emptyProducts}>
              <Feather name="package" size={24} color={colors.muted} />
              <Text style={styles.emptyProductsText}>{t("shops.detail.noProducts")}</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {products.map((p: any) => {
                const prod = liveProducts
                  ? {
                      id: p.id,
                      name: p.name,
                      brand: p.brand || "",
                      unit: p.unit || "",
                      price: p.price,
                      mrp: p.mrp,
                      image: resolveImage(p.image_url) || "",
                      categoryId: p.category_id || "",
                      description: p.description || "",
                    }
                  : p;
                return (
                  <View key={prod.id} style={styles.gridItem}>
                    <ProductCard product={prod as any} />
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      <Modal visible={assistOpen} transparent animationType="fade" onRequestClose={() => setAssistOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAssistOpen(false)}>
          <View style={styles.sheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.sheetTitle}>Request agent assistance</Text>
            <Text style={styles.sheetSub}>Unable to reach {shop.name}? Tell us what you need — a Come In agent will take over.</Text>
            <TextInput
              testID="assist-reason"
              placeholder="What do you need help with?"
              placeholderTextColor={colors.muted}
              value={assistReason}
              onChangeText={setAssistReason}
              multiline
              style={styles.assistInput}
            />
            <TextInput
              testID="assist-phone"
              placeholder="Phone to reach you"
              placeholderTextColor={colors.muted}
              value={assistPhone}
              onChangeText={setAssistPhone}
              keyboardType="phone-pad"
              style={styles.assistInput}
            />
            <Pressable testID="assist-submit" disabled={assistBusy} onPress={submitAssist} style={[styles.callBtn, { marginTop: spacing.md }, assistBusy && { opacity: 0.6 }]}>
              {assistBusy ? <ActivityIndicator color={colors.onBrandPrimary} /> : <Text style={styles.callBtnText}>Send request</Text>}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaIcon}>
        <Feather name={icon} size={14} color={colors.brandPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  hero: {
    width: "100%",
    height: 220,
    backgroundColor: colors.surfaceTertiary,
    overflow: "hidden",
  },
  heroShade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { padding: spacing.lg, gap: spacing.sm },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  name: { flex: 1, fontSize: 22, fontWeight: "800", color: colors.onSurface },
  typePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  typePillText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
  tagline: { fontSize: 13, color: colors.muted, marginTop: 2 },
  metaCard: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
  },
  metaIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
    color: colors.muted,
  },
  metaValue: { fontSize: 13, color: colors.onSurface, marginTop: 2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.md,
  },
  actionRow: { marginTop: spacing.md, flexDirection: "row", gap: spacing.sm },
  callBtn: {
    flex: 1,
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  callBtnText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 14 },
  secondaryBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.brandPrimary,
    backgroundColor: colors.surface,
  },
  secondaryText: { color: colors.brandPrimary, fontWeight: "800", fontSize: 13 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  sheet: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sheetTitle: { fontSize: 17, fontWeight: "800", color: colors.onSurface },
  sheetSub: { fontSize: 12, color: colors.muted },
  assistInput: {
    marginTop: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 14,
    color: colors.onSurface,
    minHeight: 44,
  },
  sectionTitle: {
    marginTop: spacing.xl,
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
  },
  grid: {
    marginTop: spacing.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  gridItem: { flexBasis: "48%", flexGrow: 1, maxWidth: "48.5%" },
  emptyProducts: {
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.xl,
  },
  emptyProductsText: { fontSize: 13, color: colors.muted },
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  missingText: { fontSize: 15, fontWeight: "700", color: colors.onSurface },
  backBtn: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  backBtnText: { color: colors.onBrandPrimary, fontWeight: "800" },
}));

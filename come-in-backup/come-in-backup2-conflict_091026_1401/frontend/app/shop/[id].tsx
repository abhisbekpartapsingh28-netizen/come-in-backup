import Feather from "@react-native-vector-icons/feather";
import { Image } from "expo-image";
import * as Linking from "expo-linking";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCard } from "@/src/components/ProductCard";
import { useT } from "@/src/i18n";
import { getShopById, getShopProducts } from "@/src/data/shops";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function ShopDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useT();

  const shop = id ? getShopById(id) : undefined;

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

  const products = getShopProducts(shop);
  const typeTag =
    shop.type === "online"
      ? t("shops.type.online")
      : shop.type === "offline"
      ? t("shops.type.offline")
      : t("shops.type.both");

  const callShop = async () => {
    const url = `tel:${shop.phone}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(t("shops.callUnavailable"), shop.phone);
      }
    } catch {
      Alert.alert(t("shops.callUnavailable"), shop.phone);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing.xxl + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Image source={shop.image} style={StyleSheet.absoluteFill} contentFit="cover" />
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
                    shop.type === "offline" ? colors.brandSecondary : colors.brandTertiary,
                },
              ]}
            >
              <Text
                style={[
                  styles.typePillText,
                  {
                    color:
                      shop.type === "offline"
                        ? colors.onBrandSecondary
                        : colors.brandPrimary,
                  },
                ]}
              >
                {typeTag}
              </Text>
            </View>
          </View>
          <Text style={styles.tagline}>{shop.tagline}</Text>

          <View style={styles.metaCard}>
            <MetaRow
              icon="map-pin"
              label={t("shops.detail.address")}
              value={`${shop.area}\n${shop.address}`}
            />
            <View style={styles.divider} />
            <MetaRow
              icon="clock"
              label={t("shops.detail.hours")}
              value={`${shop.hours} • ${shop.openNow ? t("shops.openNow") : t("shops.closed")}`}
            />
            <View style={styles.divider} />
            <MetaRow
              icon="truck"
              label={t("shops.detail.services")}
              value={[
                shop.type !== "offline" && t("shops.detail.canOrderOnline"),
                shop.deliveryAvailable && t("shops.detail.deliveryAvailable"),
                shop.pickupAvailable && t("shops.detail.pickupAvailable"),
                shop.type === "offline" && t("shops.detail.visitInStore"),
              ]
                .filter(Boolean)
                .join(" • ")}
            />
          </View>

          <View style={styles.actionRow}>
            <Pressable testID="shop-call-btn" onPress={callShop} style={styles.callBtn}>
              <Feather name="phone" size={16} color={colors.onBrandPrimary} />
              <Text style={styles.callBtnText}>{t("shops.callShop")}</Text>
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
              {products.map((p) => (
                <View key={p.id} style={styles.gridItem}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  actionRow: { marginTop: spacing.md },
  callBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.md,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  callBtnText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 14 },
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

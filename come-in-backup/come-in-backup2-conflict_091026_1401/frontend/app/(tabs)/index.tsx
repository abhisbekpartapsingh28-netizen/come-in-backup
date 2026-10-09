import Feather from "@react-native-vector-icons/feather";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandLogo } from "@/src/components/BrandLogo";
import { ProductCard } from "@/src/components/ProductCard";
import {
  CATEGORIES,
  POPULAR_PRODUCTS,
  QUICK_DELIVERY_PRODUCTS,
  SERVICES,
} from "@/src/data/catalog";
import { useT } from "@/src/i18n";
import { useLocationCtx } from "@/src/store/location";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

const DEFAULT_LOCATION = "Set delivery location";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { location, setLocation } = useLocationCtx();
  const { t } = useT();
  const [locModalOpen, setLocModalOpen] = useState(false);
  const [locInput, setLocInput] = useState(
    location === DEFAULT_LOCATION ? "" : location,
  );

  // Re-sync the modal input with the currently-saved location every time
  // the modal is opened so stale text from a prior session isn't shown
  // after the address was changed from Account / Request Anything.
  useEffect(() => {
    if (locModalOpen) {
      setLocInput(location === DEFAULT_LOCATION ? "" : location);
    }
  }, [locModalOpen, location]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {/* Sticky Header */}
      <View
        style={[styles.header, { paddingTop: insets.top + spacing.sm }]}
      >
        <View style={styles.topRow}>
          <BrandLogo testID="brand-logo" />
        </View>
        <Pressable
          testID="location-selector"
          onPress={() => setLocModalOpen(true)}
          style={styles.locRow}
        >
          <Feather name="map-pin" size={16} color={colors.brandPrimary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.locLabel}>{t("home.deliverTo")}</Text>
            <Text style={styles.locValue} numberOfLines={1}>
              {location === DEFAULT_LOCATION ? t("home.setLocation") : location}
            </Text>
          </View>
          <Feather name="chevron-down" size={18} color={colors.onSurfaceSecondary} />
        </Pressable>
        <Pressable
          testID="home-search-bar"
          onPress={() => router.push("/(tabs)/search")}
          style={styles.searchBar}
        >
          <Feather name="search" size={18} color={colors.muted} />
          <Text style={styles.searchPlaceholder}>{t("home.searchPlaceholder")}</Text>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
      >
        {/* Hero Banner */}
        <View style={styles.heroWrap}>
          <View style={styles.hero}>
            <Image
              source="https://images.unsplash.com/photo-1579113800032-c38bd7635818?crop=entropy&cs=srgb&fm=jpg&w=1200&q=80"
              style={StyleSheet.absoluteFill}
              contentFit="cover"
            />
            <LinearGradient
              colors={[`${colors.brandForest}E8`, `${colors.brandPrimary}B8`]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <View style={styles.heroPill}>
                <Text style={styles.heroPillText}>{t("home.limitedTime")}</Text>
              </View>
              <Text style={styles.heroTitle}>{t("home.heroTitle")}</Text>
              <Text style={styles.heroSub}>{t("home.heroSub")}</Text>
              <View style={styles.heroCta}>
                <Text style={styles.heroCtaText}>{t("home.shopNow")}</Text>
                <Feather name="arrow-right" size={14} color={colors.brandPrimary} />
              </View>
            </View>
          </View>
        </View>

        {/* Shops Near You — Online & Offline */}
        <SectionHeader
          title={t("home.shops")}
          onSeeAll={() => router.push("/shops")}
        />
        <View style={styles.requestWrap}>
          <Pressable
            testID="browse-shops-card"
            onPress={() => router.push("/shops")}
            style={styles.requestCard}
          >
            <View style={styles.requestLeft}>
              <View style={styles.requestIcon}>
                <Feather name="shopping-bag" size={22} color={colors.onBrandPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.requestTitle}>{t("home.browseShops")}</Text>
                <Text style={styles.requestSub}>{t("home.shopsSub")}</Text>
              </View>
            </View>
            <Feather name="arrow-right" size={20} color={colors.brandPrimary} />
          </Pressable>
        </View>

        {/* Grocery Categories */}
        <SectionHeader title={t("home.shopByCategory")} onSeeAll={() => router.push("/(tabs)/categories")} />
        <FlatList
          data={CATEGORIES}
          keyExtractor={(c) => c.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
          renderItem={({ item }) => (
            <Pressable
              testID={`home-cat-${item.id}`}
              onPress={() => router.push(`/category/${item.id}`)}
              style={[styles.catTile, { backgroundColor: item.tint }]}
            >
              <Image source={item.image} style={styles.catImage} contentFit="cover" />
              <Text style={styles.catName} numberOfLines={2}>
                {item.name}
              </Text>
            </Pressable>
          )}
        />

        {/* Quick Delivery */}
        <View style={styles.quickHeader}>
          <View style={styles.quickBadge}>
            <Feather name="zap" size={12} color={colors.onBrandSecondary} />
            <Text style={styles.quickBadgeText}>{t("home.minBadge")}</Text>
          </View>
          <Text style={styles.quickTitle}>{t("home.quickDelivery")}</Text>
        </View>
        <FlatList
          data={QUICK_DELIVERY_PRODUCTS}
          keyExtractor={(p) => p.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
          renderItem={({ item }) => <ProductCard product={item} width={160} />}
        />

        {/* Popular Products */}
        <SectionHeader title={t("home.popular")} onSeeAll={() => router.push("/(tabs)/categories")} />
        <View style={styles.popularGrid}>
          {POPULAR_PRODUCTS.map((p) => (
            <View key={p.id} style={styles.gridItem}>
              <ProductCard product={p} />
            </View>
          ))}
        </View>

        {/* Home Services */}
        <SectionHeader title={t("home.homeServices")} onSeeAll={() => router.push("/services")} />
        <FlatList
          data={SERVICES.slice(0, 4)}
          keyExtractor={(s) => s.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.md }}
          renderItem={({ item }) => (
            <Pressable
              testID={`home-service-${item.id}`}
              onPress={() => router.push("/services")}
              style={styles.serviceCard}
            >
              <Image source={item.image} style={styles.serviceImg} contentFit="cover" />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.serviceTag} numberOfLines={1}>
                  {item.tagline}
                </Text>
                <Text style={styles.servicePrice}>{item.price}</Text>
              </View>
            </Pressable>
          )}
        />

        {/* Request Anything */}
        <View style={styles.requestWrap}>
          <Pressable
            testID="request-anything-card"
            onPress={() => router.push("/request")}
            style={styles.requestCard}
          >
            <View style={styles.requestLeft}>
              <View style={styles.requestIcon}>
                <Feather name="package" size={22} color={colors.onBrandPrimary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.requestTitle}>{t("home.requestAnything")}</Text>
                <Text style={styles.requestSub}>
                  {t("home.requestAnythingSub")}
                </Text>
              </View>
            </View>
            <Feather name="arrow-right" size={20} color={colors.brandPrimary} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Location modal */}
      <Modal
        visible={locModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setLocModalOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setLocModalOpen(false)} />
        <View style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{t("home.whereDeliver")}</Text>
          <Text style={styles.modalSub}>{t("home.whereDeliverSub")}</Text>
          <TextInput
            testID="location-input"
            value={locInput}
            onChangeText={setLocInput}
            placeholder={t("home.locationExample")}
            placeholderTextColor={colors.muted}
            style={styles.modalInput}
            autoFocus
          />
          <Pressable
            testID="location-save-btn"
            onPress={() => {
              setLocation(locInput);
              setLocModalOpen(false);
            }}
            style={styles.modalBtn}
          >
            <Text style={styles.modalBtnText}>{t("home.saveLocation")}</Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useT();
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} hitSlop={10}>
          <Text style={[styles.seeAll, { color: colors.brandPrimary }]}>{t("home.seeAll")}</Text>
        </Pressable>
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  topRow: {
    marginBottom: spacing.md,
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 11,
    color: colors.muted,
    marginTop: -2,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  locLabel: { fontSize: 10, color: colors.muted, fontWeight: "600", letterSpacing: 0.3 },
  locValue: { fontSize: 14, color: colors.onSurface, fontWeight: "600" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
  },
  searchPlaceholder: {
    color: colors.muted,
    fontSize: 14,
  },
  heroWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  hero: {
    height: 160,
    borderRadius: radius.lg,
    overflow: "hidden",
    backgroundColor: colors.brandPrimary,
  },
  heroContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: "center",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  heroPill: {
    backgroundColor: colors.brandSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  heroPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.onBrandSecondary,
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.onBrandPrimary,
    lineHeight: 28,
    marginTop: spacing.xs,
  },
  heroSub: {
    fontSize: 13,
    color: colors.onBrandPrimary,
    marginTop: 2,
  },
  heroCta: {
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  heroCtaText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.brandPrimary,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.onSurface,
  },
  seeAll: { fontSize: 13, fontWeight: "700" },
  catTile: {
    width: 96,
    borderRadius: radius.lg,
    padding: spacing.sm,
    alignItems: "center",
    gap: spacing.xs,
  },
  catImage: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
  },
  catName: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.onSurface,
    textAlign: "center",
  },
  quickHeader: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  quickBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.brandSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  quickBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.onBrandSecondary,
    letterSpacing: 0.5,
  },
  quickTitle: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  popularGrid: {
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  gridItem: {
    flexBasis: "48%",
    flexGrow: 1,
    maxWidth: "48.5%",
  },
  serviceCard: {
    width: 220,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  serviceImg: {
    width: "100%",
    height: 110,
    backgroundColor: colors.surfaceTertiary,
  },
  serviceInfo: { padding: spacing.md, gap: 2 },
  serviceTitle: { fontSize: 14, fontWeight: "700", color: colors.onSurface },
  serviceTag: { fontSize: 12, color: colors.muted },
  servicePrice: {
    fontSize: 13,
    color: colors.brandPrimary,
    fontWeight: "700",
    marginTop: 4,
  },
  requestWrap: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  requestCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.brandTertiary,
    borderWidth: 1,
    borderColor: colors.brandPrimary + "33",
    gap: spacing.md,
  },
  requestLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  requestIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  requestTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
  },
  requestSub: { fontSize: 12, color: colors.onSurfaceSecondary, marginTop: 2 },

  // Modal
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.onSurface,
  },
  modalSub: { fontSize: 13, color: colors.muted, marginTop: -spacing.sm },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    fontSize: 15,
    color: colors.onSurface,
  },
  modalBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  modalBtnText: { fontSize: 15, fontWeight: "800", color: colors.onBrandPrimary },
}));

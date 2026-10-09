import Feather from "@react-native-vector-icons/feather";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useT } from "@/src/i18n";
import { filterShops, Shop, ShopType } from "@/src/data/shops";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

type TabKey = "all" | ShopType;

const TAB_ORDER: TabKey[] = ["all", "online", "offline"];

export default function ShopsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useT();

  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [deliveryOnly, setDeliveryOnly] = useState(false);

  const shops = useMemo(
    () =>
      filterShops({
        type: tab,
        query,
        openNowOnly,
        deliveryOnly,
      }),
    [tab, query, openNowOnly, deliveryOnly],
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="shops-back-btn" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("shops.title")}</Text>
          <Text style={styles.sub}>{t("shops.sub")}</Text>
        </View>
      </View>

      <View style={styles.toolbar}>
        <View style={styles.inputWrap}>
          <Feather name="search" size={16} color={colors.muted} />
          <TextInput
            testID="shops-search"
            value={query}
            onChangeText={setQuery}
            placeholder={t("shops.searchPlaceholder")}
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
          {query.length > 0 && (
            <Pressable testID="shops-clear" onPress={() => setQuery("")} hitSlop={10}>
              <Feather name="x-circle" size={16} color={colors.muted} />
            </Pressable>
          )}
        </View>

        <View style={styles.tabRow}>
          {TAB_ORDER.map((key) => (
            <Pressable
              key={key}
              testID={`shops-tab-${key}`}
              onPress={() => setTab(key)}
              style={[
                styles.tab,
                tab === key && {
                  backgroundColor: colors.brandPrimary,
                  borderColor: colors.brandPrimary,
                },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  tab === key && { color: colors.onBrandPrimary },
                ]}
              >
                {t(`shops.tab.${key}`)}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.filterRow}>
          <FilterChip
            testID="filter-open-now"
            icon="clock"
            label={t("shops.filter.openNow")}
            active={openNowOnly}
            onPress={() => setOpenNowOnly((v) => !v)}
          />
          <FilterChip
            testID="filter-delivery"
            icon="truck"
            label={t("shops.filter.delivery")}
            active={deliveryOnly}
            onPress={() => setDeliveryOnly((v) => !v)}
          />
        </View>
      </View>

      <FlatList
        testID="shops-list"
        data={shops}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: spacing.xxl,
          gap: spacing.md,
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="shopping-bag" size={28} color={colors.muted} />
            <Text style={styles.emptyText}>{t("shops.empty")}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ShopRow
            shop={item}
            onPress={() => router.push(`/shop/${item.id}`)}
          />
        )}
      />
    </View>
  );
}

function FilterChip({
  testID,
  icon,
  label,
  active,
  onPress,
}: {
  testID: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={[
        styles.chip,
        active && {
          backgroundColor: colors.brandTertiary,
          borderColor: colors.brandPrimary,
        },
      ]}
    >
      <Feather name={icon} size={12} color={active ? colors.brandPrimary : colors.muted} />
      <Text style={[styles.chipText, active && { color: colors.brandPrimary }]}>{label}</Text>
    </Pressable>
  );
}

function ShopRow({ shop, onPress }: { shop: Shop; onPress: () => void }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useT();
  const typeTag =
    shop.type === "online"
      ? t("shops.type.online")
      : shop.type === "offline"
      ? t("shops.type.offline")
      : t("shops.type.both");

  return (
    <Pressable testID={`shop-row-${shop.id}`} onPress={onPress} style={styles.card}>
      <Image source={shop.image} style={styles.img} contentFit="cover" />
      <View style={styles.info}>
        <View style={styles.rowBetween}>
          <Text style={styles.name} numberOfLines={1}>
            {shop.name}
          </Text>
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
        <Text style={styles.tagline} numberOfLines={1}>
          {shop.tagline}
        </Text>
        <View style={styles.metaRow}>
          <Feather name="map-pin" size={11} color={colors.muted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {shop.area}
          </Text>
          <View style={styles.dot} />
          <Feather
            name="circle"
            size={9}
            color={shop.openNow ? colors.brandPrimary : colors.muted}
          />
          <Text
            style={[
              styles.metaText,
              { color: shop.openNow ? colors.brandPrimary : colors.muted },
            ]}
          >
            {shop.openNow ? t("shops.openNow") : t("shops.closed")}
          </Text>
        </View>
      </View>
    </Pressable>
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
  toolbar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceTertiary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
  },
  input: { flex: 1, fontSize: 14, color: colors.onSurface, padding: 0 },
  tabRow: { flexDirection: "row", gap: spacing.sm },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabText: { fontSize: 12, fontWeight: "700", color: colors.onSurfaceSecondary },
  filterRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: { fontSize: 11, fontWeight: "700", color: colors.muted },
  card: {
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  img: {
    width: 76,
    height: 76,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
  },
  info: { flex: 1, gap: 2, justifyContent: "center" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  name: { flex: 1, fontSize: 15, fontWeight: "800", color: colors.onSurface },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  typePillText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
  tagline: { fontSize: 12, color: colors.muted },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  metaText: { fontSize: 11, color: colors.muted },
  dot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.borderStrong,
    marginHorizontal: 4,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
  },
  emptyText: { fontSize: 13, color: colors.muted },
}));

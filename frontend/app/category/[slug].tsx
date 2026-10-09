import Feather from "@react-native-vector-icons/feather";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCard } from "@/src/components/ProductCard";
import { CATEGORIES, getCategoryById, getProductsByCategory } from "@/src/data/catalog";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();

  const category = slug ? getCategoryById(slug) : undefined;
  const products = slug ? getProductsByCategory(slug) : [];

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="cat-back-btn" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>
            {category?.name ?? "Category"}
          </Text>
          <Text style={styles.sub}>{products.length} products available</Text>
        </View>
      </View>

      <View style={styles.chipRow}>
        <FlatList
          data={CATEGORIES}
          keyExtractor={(c) => c.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
          renderItem={({ item }) => {
            const selected = item.id === slug;
            return (
              <Pressable
                testID={`chip-${item.id}`}
                onPress={() => router.replace(`/category/${item.id}`)}
                style={[
                  styles.chip,
                  selected && { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selected && { color: colors.onBrandPrimary },
                  ]}
                >
                  {item.name}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {products.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="package" size={28} color={colors.muted} />
          <Text style={styles.emptyText}>No products in this category.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.md, paddingHorizontal: spacing.lg }}
          contentContainerStyle={{ paddingVertical: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl }}
          renderItem={({ item }) => (
            <View style={{ flex: 1, maxWidth: "48.5%" }}>
              <ProductCard product={item} />
            </View>
          )}
        />
      )}
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
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
  chipRow: {
    height: 56,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  chip: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chipText: { fontSize: 12, fontWeight: "700", color: colors.onSurfaceSecondary },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  emptyText: { fontSize: 14, color: colors.muted },
}));

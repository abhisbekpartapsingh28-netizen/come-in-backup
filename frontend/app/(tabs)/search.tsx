import Feather from "@react-native-vector-icons/feather";
import { useMemo, useState } from "react";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ProductCard } from "@/src/components/ProductCard";
import { PRODUCTS, searchProducts } from "@/src/data/catalog";
import { useT } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

const SUGGESTIONS = ["Milk", "Atta", "Salt", "Butter", "Bread", "Oil", "Rice", "Apple"];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useT();
  const [query, setQuery] = useState("");

  const results = useMemo(() => searchProducts(query), [query]);
  const hasQuery = query.trim().length > 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <View style={styles.inputWrap}>
          <Feather name="search" size={18} color={colors.muted} />
          <TextInput
            testID="search-input"
            value={query}
            onChangeText={setQuery}
            placeholder={t("search.placeholder")}
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoFocus
            returnKeyType="search"
          />
          {hasQuery && (
            <Pressable testID="clear-search-btn" onPress={() => setQuery("")} hitSlop={10}>
              <Feather name="x-circle" size={18} color={colors.muted} />
            </Pressable>
          )}
        </View>
      </View>

      {!hasQuery ? (
        <View style={styles.emptyContent}>
          <Text style={styles.sectionTitle}>{t("search.popular")}</Text>
          <View style={styles.chipRow}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                testID={`suggest-${s}`}
                onPress={() => setQuery(s)}
                style={styles.chip}
              >
                <Feather name="trending-up" size={12} color={colors.brandPrimary} />
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>{t("search.youMayLike")}</Text>
          <View style={styles.grid}>
            {PRODUCTS.slice(0, 6).map((p) => (
              <View key={p.id} style={styles.gridItem}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.noResults}>
          <View style={styles.noResultsIcon}>
            <Feather name="search" size={30} color={colors.muted} />
          </View>
          <Text style={styles.noResultsTitle}>{t("search.noResults", { q: query })}</Text>
          <Text style={styles.noResultsSub}>{t("search.noResultsSub")}</Text>
        </View>
      ) : (
        <FlatList
          testID="search-results"
          data={results}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.md, paddingHorizontal: spacing.lg }}
          contentContainerStyle={{ paddingVertical: spacing.md, gap: spacing.md }}
          onScrollBeginDrag={Keyboard.dismiss}
          renderItem={({ item }) => (
            <View style={{ flex: 1, maxWidth: "48.5%" }}>
              <ProductCard product={item} />
            </View>
          )}
          ListHeaderComponent={
            <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.lg }]}>
              {results.length} result{results.length === 1 ? "" : "s"}
            </Text>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
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
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.onSurface,
    padding: 0,
  },
  emptyContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.pill,
  },
  chipText: { fontSize: 13, fontWeight: "600", color: colors.onBrandTertiary },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  gridItem: { flexBasis: "48%", flexGrow: 1, maxWidth: "48.5%" },
  noResults: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
  },
  noResultsIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  noResultsTitle: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  noResultsSub: { fontSize: 13, color: colors.muted, textAlign: "center" },
}));

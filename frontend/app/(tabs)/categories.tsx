import Feather from "@react-native-vector-icons/feather";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CATEGORIES } from "@/src/data/catalog";
import { useT } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function CategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { t } = useT();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.title}>{t("categories.title")}</Text>
        <Pressable
          testID="header-services-btn"
          onPress={() => router.push("/services")}
          style={styles.servicesPill}
        >
          <Feather name="tool" size={14} color={colors.brandPrimary} />
          <Text style={styles.servicesPillText}>{t("categories.servicesPill")}</Text>
        </Pressable>
      </View>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(c) => c.id}
        numColumns={2}
        columnWrapperStyle={{ gap: spacing.md, paddingHorizontal: spacing.lg }}
        contentContainerStyle={{ paddingVertical: spacing.md, gap: spacing.md }}
        renderItem={({ item }) => (
          <Pressable
            testID={`cat-${item.id}`}
            style={[styles.card, { backgroundColor: item.tint }]}
            onPress={() => router.push(`/category/${item.id}`)}
          >
            <Image source={item.image} style={styles.image} contentFit="cover" />
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.onSurface },
  servicesPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.brandTertiary,
    borderRadius: radius.pill,
  },
  servicesPillText: { fontSize: 12, fontWeight: "700", color: colors.brandPrimary },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.sm,
    aspectRatio: 1,
  },
  image: {
    width: "72%",
    height: "60%",
    borderRadius: radius.md,
  },
  name: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.onSurface,
    textAlign: "center",
  },
}));

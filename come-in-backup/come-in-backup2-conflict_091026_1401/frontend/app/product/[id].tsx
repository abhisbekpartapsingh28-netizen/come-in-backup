import Feather from "@react-native-vector-icons/feather";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QuantityStepper } from "@/src/components/QuantityStepper";
import { getProductById, PRODUCTS } from "@/src/data/catalog";
import { useCart } from "@/src/store/cart";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { getQty, add, increment, decrement } = useCart();

  const product = id ? getProductById(id) : undefined;

  if (!product) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundTitle}>Product not found</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const qty = getQty(product.id);
  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  const related = PRODUCTS.filter(
    (p) => p.categoryId === product.categoryId && p.id !== product.id,
  ).slice(0, 6);

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="back-btn" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.topTitle} numberOfLines={1}>
          Product details
        </Text>
        <Pressable
          testID="goto-cart-btn"
          onPress={() => router.push("/(tabs)/cart")}
          style={styles.iconBtn}
        >
          <Feather name="shopping-bag" size={20} color={colors.onSurface} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroImgWrap}>
          <Image source={product.image} style={styles.heroImg} contentFit="cover" transition={200} />
          {discount > 0 && (
            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text testID="product-title" style={styles.name}>
            {product.name}
          </Text>
          <Text style={styles.unit}>{product.unit}</Text>

          <View style={styles.priceRow}>
            <Text testID="product-price" style={styles.price}>
              ₹{product.price}
            </Text>
            {product.mrp && product.mrp > product.price && (
              <>
                <Text style={styles.mrp}>₹{product.mrp}</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveText}>Save ₹{product.mrp - product.price}</Text>
                </View>
              </>
            )}
          </View>

          <View style={styles.deliveryBar}>
            <Feather name="clock" size={14} color={colors.brandPrimary} />
            <Text style={styles.deliveryBarText}>Delivery in 10-15 mins</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>About this product</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.featureRow}>
            <Feature icon="check-circle" title="100% Authentic" sub="Sourced from trusted brands" />
            <Feature icon="refresh-ccw" title="Easy returns" sub="Within 15 minutes" />
          </View>
        </View>

        {related.length > 0 && (
          <View style={styles.relatedWrap}>
            <Text style={styles.sectionTitle}>You may also like</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: spacing.md, paddingVertical: spacing.sm }}
            >
              {related.map((r) => (
                <Pressable
                  key={r.id}
                  testID={`related-${r.id}`}
                  onPress={() => router.push(`/product/${r.id}`)}
                  style={styles.relCard}
                >
                  <Image source={r.image} style={styles.relImg} contentFit="cover" />
                  <Text style={styles.relName} numberOfLines={2}>
                    {r.name}
                  </Text>
                  <Text style={styles.relPrice}>₹{r.price}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </ScrollView>

      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaPrice}>₹{product.price * Math.max(1, qty)}</Text>
          <Text style={styles.ctaLabel}>
            {qty > 0 ? `${qty} in cart` : product.unit}
          </Text>
        </View>
        <View style={{ minWidth: 160 }}>
          <QuantityStepper
            qty={qty}
            onAdd={() => add(product.id)}
            onInc={() => increment(product.id)}
            onDec={() => decrement(product.id)}
            size="md"
            testID="pdp-stepper"
          />
        </View>
      </View>
    </View>
  );
}

function Feature({
  icon,
  title,
  sub,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  title: string;
  sub: string;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.feature}>
      <Feather name={icon} size={16} color={colors.brandPrimary} />
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureSub}>{sub}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surface },
  topBar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "700",
    color: colors.onSurface,
  },
  heroImgWrap: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surfaceTertiary,
    position: "relative",
  },
  heroImg: { width: "100%", height: "100%" },
  heroBadge: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.brandSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.onBrandSecondary,
    letterSpacing: 0.5,
  },
  body: { padding: spacing.lg, gap: spacing.xs },
  brand: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brandPrimary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  name: { fontSize: 22, fontWeight: "800", color: colors.onSurface, marginTop: 4 },
  unit: { fontSize: 13, color: colors.muted, marginTop: 2 },
  priceRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flexWrap: "wrap",
  },
  price: { fontSize: 24, fontWeight: "800", color: colors.onSurface },
  mrp: { fontSize: 14, color: colors.muted, textDecorationLine: "line-through" },
  saveBadge: {
    backgroundColor: colors.brandTertiary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  saveText: { fontSize: 11, fontWeight: "800", color: colors.onBrandTertiary },
  deliveryBar: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brandTertiary,
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignSelf: "flex-start",
  },
  deliveryBarText: { fontSize: 12, fontWeight: "700", color: colors.onBrandTertiary },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
    marginBottom: spacing.sm,
  },
  description: { fontSize: 13, color: colors.onSurfaceSecondary, lineHeight: 20 },
  featureRow: { flexDirection: "row", gap: spacing.md, marginTop: spacing.lg },
  feature: {
    flex: 1,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    gap: 4,
  },
  featureTitle: { fontSize: 13, fontWeight: "700", color: colors.onSurface, marginTop: 4 },
  featureSub: { fontSize: 11, color: colors.muted },

  relatedWrap: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
  },
  relCard: {
    width: 130,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
    padding: spacing.sm,
    gap: 4,
  },
  relImg: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTertiary,
  },
  relName: { fontSize: 12, fontWeight: "600", color: colors.onSurface, marginTop: 4 },
  relPrice: { fontSize: 13, fontWeight: "800", color: colors.onSurface },

  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  ctaPrice: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  ctaLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },

  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
  },
  notFoundTitle: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  backBtn: {
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  backBtnText: { color: colors.onBrandPrimary, fontWeight: "700" },
}));

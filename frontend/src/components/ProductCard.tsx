import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { QuantityStepper } from "@/src/components/QuantityStepper";
import { Product } from "@/src/data/catalog";
import { useCart } from "@/src/store/cart";
import { makeStyles, radius, spacing } from "@/src/theme";

type Props = {
  product: Product;
  width?: number;
};

export function ProductCard({ product, width }: Props) {
  const styles = useStyles();
  const router = useRouter();
  const { getQty, add, increment, decrement } = useCart();
  const qty = getQty(product.id);
  const discount =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : 0;

  return (
    <Pressable
      testID={`product-card-${product.id}`}
      onPress={() => router.push(`/product/${product.id}`)}
      style={[styles.card, width ? { width } : undefined]}
    >
      <View style={styles.imageWrap}>
        <Image source={product.image} style={styles.image} contentFit="cover" transition={150} />
        {discount > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discount}% OFF</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.unit}>{product.unit}</Text>
        <View style={styles.footer}>
          <View style={styles.priceCol}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.mrp && product.mrp > product.price && (
              <Text style={styles.mrp}>₹{product.mrp}</Text>
            )}
          </View>
          <QuantityStepper
            testID={`stepper-${product.id}`}
            qty={qty}
            onAdd={() => add(product.id)}
            onInc={() => increment(product.id)}
            onDec={() => decrement(product.id)}
          />
        </View>
      </View>
    </Pressable>
  );
}

const useStyles = makeStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: colors.surfaceTertiary,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  discountBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.brandSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  discountText: {
    fontSize: 10,
    fontWeight: "800",
    color: colors.onBrandSecondary,
    letterSpacing: 0.3,
  },
  info: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.onSurface,
    lineHeight: 18,
  },
  unit: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  priceCol: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
    flexShrink: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.onSurface,
  },
  mrp: {
    fontSize: 12,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
}));

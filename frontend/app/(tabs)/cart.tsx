import Feather from "@react-native-vector-icons/feather";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { QuantityStepper } from "@/src/components/QuantityStepper";
import { useT } from "@/src/i18n";
import { useCart } from "@/src/store/cart";
import { useLocationCtx } from "@/src/store/location";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

const DEFAULT_LOCATION = "Set delivery location";
const DELIVERY_FEE_THRESHOLD = 199;

export default function CartScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { cartLines, subtotal, deliveryFee, total, increment, decrement, remove, clear } =
    useCart();
  const { location } = useLocationCtx();
  const { t } = useT();

  if (cartLines.length === 0) {
    return (
      <View style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Text style={styles.title}>{t("cart.title")}</Text>
        </View>
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Feather name="shopping-bag" size={34} color={colors.brandPrimary} />
          </View>
          <Text style={styles.emptyTitle}>{t("cart.empty")}</Text>
          <Text style={styles.emptySub}>{t("cart.emptySub")}</Text>
          <Pressable
            testID="start-shopping-btn"
            onPress={() => router.replace("/(tabs)")}
            style={styles.emptyBtn}
          >
            <Text style={styles.emptyBtnText}>{t("cart.startShopping")}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const savings = cartLines.reduce(
    (s, l) => s + (l.product.mrp ? (l.product.mrp - l.product.price) * l.qty : 0),
    0,
  );

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.title}>{t("cart.title")}</Text>
        <Pressable testID="clear-cart-btn" onPress={clear} hitSlop={10}>
          <Text style={[styles.clearText, { color: colors.error }]}>{t("cart.clear")}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 160 + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.deliveryCard}>
          <Feather name="clock" size={18} color={colors.brandPrimary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.deliveryTitle}>{t("cart.deliveryIn")}</Text>
            <Text style={styles.deliveryTo} numberOfLines={1}>
              {t("cart.to", { loc: location === DEFAULT_LOCATION ? t("home.setLocation") : location })}
            </Text>
          </View>
        </View>

        {savings > 0 && (
          <View style={styles.savingBanner}>
            <Feather name="tag" size={14} color={colors.onBrandSecondary} />
            <Text style={styles.savingText}>{t("cart.savings", { n: savings })}</Text>
          </View>
        )}

        <Text style={styles.sectionLabel}>
          {t(cartLines.length === 1 ? "cart.item" : "cart.items", { n: cartLines.length })}
        </Text>
        <View style={styles.card}>
          {cartLines.map((line, idx) => (
            <View key={line.product.id}>
              <View style={styles.row} testID={`cart-row-${line.product.id}`}>
                <Image source={line.product.image} style={styles.rowImage} contentFit="cover" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowName} numberOfLines={2}>
                    {line.product.name}
                  </Text>
                  <Text style={styles.rowUnit}>{line.product.unit}</Text>
                  <View style={styles.rowBottom}>
                    <View style={styles.priceWrap}>
                      <Text style={styles.rowPrice}>₹{line.product.price * line.qty}</Text>
                      {line.product.mrp && (
                        <Text style={styles.rowMrp}>
                          ₹{line.product.mrp * line.qty}
                        </Text>
                      )}
                    </View>
                    <QuantityStepper
                      qty={line.qty}
                      onAdd={() => increment(line.product.id)}
                      onInc={() => increment(line.product.id)}
                      onDec={() => decrement(line.product.id)}
                      testID={`cart-stepper-${line.product.id}`}
                    />
                  </View>
                </View>
              </View>
              {idx < cartLines.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <Text style={styles.sectionLabel}>{t("cart.billDetails")}</Text>
        <View style={styles.billCard}>
          <BillRow label={t("cart.itemTotal")} value={`₹${subtotal}`} />
          <BillRow
            label={t("cart.deliveryFee")}
            value={deliveryFee === 0 ? t("cart.free") : `₹${deliveryFee}`}
            highlight={deliveryFee === 0}
          />
          <View style={styles.divider} />
          <BillRow label={t("cart.toPay")} value={`₹${total}`} bold />
        </View>
        {deliveryFee > 0 && (
          <Text style={styles.hint}>
            {t("cart.hint", { n: DELIVERY_FEE_THRESHOLD - subtotal })}
          </Text>
        )}
      </ScrollView>

      <View
        style={[styles.checkoutBar, { paddingBottom: insets.bottom + spacing.sm }]}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.checkoutTotal}>₹{total}</Text>
          <Text style={styles.checkoutLabel}>{t("cart.total")}</Text>
        </View>
        <Pressable testID="checkout-btn" onPress={() => router.push("/checkout")} style={styles.checkoutBtn}>
          <Text style={styles.checkoutBtnText}>{t("cart.checkout")}</Text>
          <Feather name="arrow-right" size={18} color={colors.onBrandPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

function BillRow({
  label,
  value,
  bold,
  highlight,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.billRow}>
      <Text style={[styles.billLabel, bold && { fontWeight: "800", color: colors.onSurface }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.billValue,
          bold && { fontWeight: "800", fontSize: 16 },
          highlight && { color: colors.brandPrimary, fontWeight: "800" },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surfaceSecondary },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "800", color: colors.onSurface },
  clearText: { fontSize: 13, fontWeight: "700" },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  emptySub: {
    fontSize: 13,
    color: colors.muted,
    textAlign: "center",
    maxWidth: 260,
  },
  emptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  emptyBtnText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 14 },

  deliveryCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  deliveryTitle: { fontSize: 14, fontWeight: "800", color: colors.onSurface },
  deliveryTo: { fontSize: 12, color: colors.muted, marginTop: 2 },

  savingBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brandSecondary,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
  },
  savingText: { fontSize: 12, fontWeight: "700", color: colors.onBrandSecondary },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.muted,
    letterSpacing: 0.6,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  row: { flexDirection: "row", gap: spacing.md, paddingVertical: spacing.sm },
  rowImage: {
    width: 68,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTertiary,
  },
  rowName: { fontSize: 14, fontWeight: "600", color: colors.onSurface },
  rowUnit: { fontSize: 12, color: colors.muted, marginTop: 2 },
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  priceWrap: { flexDirection: "row", alignItems: "baseline", gap: spacing.xs },
  rowPrice: { fontSize: 15, fontWeight: "800", color: colors.onSurface },
  rowMrp: {
    fontSize: 12,
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.divider, marginVertical: 2 },

  billCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  billRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  billLabel: { fontSize: 13, color: colors.onSurfaceSecondary },
  billValue: { fontSize: 13, color: colors.onSurface, fontWeight: "600" },

  hint: {
    fontSize: 12,
    color: colors.brandPrimary,
    fontWeight: "600",
    marginTop: spacing.sm,
    textAlign: "center",
  },

  checkoutBar: {
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
  checkoutTotal: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  checkoutLabel: { fontSize: 10, color: colors.muted, letterSpacing: 0.5, fontWeight: "700" },
  checkoutBtn: {
    flex: 2,
    backgroundColor: colors.brandPrimary,
    paddingVertical: 14,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  checkoutBtnText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 15 },
}));

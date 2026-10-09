import Feather from "@react-native-vector-icons/feather";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandLogo, BrandMark } from "@/src/components/BrandLogo";
import { useT } from "@/src/i18n";
import { useAuth } from "@/src/store/auth";
import { useCart } from "@/src/store/cart";
import { useLocationCtx } from "@/src/store/location";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

type Row = {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  hint?: string;
  onPress?: () => void;
};

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { totalCount } = useCart();
  const { location } = useLocationCtx();
  const { t, current } = useT();
  const { user, logout } = useAuth();
  const [signInOpen, setSignInOpen] = useState(false);

  const sellerGroup = {
    title: user?.role === "admin" ? "Admin" : "Shop & seller",
    rows: [
      user?.role === "admin"
        ? { icon: "shield" as const, label: "Admin dashboard", onPress: () => router.push("/admin") }
        : { icon: "shopping-bag" as const, label: user?.role === "shopkeeper" ? "My shop" : "Open your shop", onPress: () => router.push("/become-seller") },
      ...(user?.role === "shopkeeper"
        ? [
            { icon: "package" as const, label: "My products", onPress: () => router.push("/seller/products") },
            { icon: "clipboard" as const, label: "Shop orders", onPress: () => router.push("/seller/orders") },
          ]
        : []),
    ],
  };

  const groups: { title: string; rows: Row[] }[] = [
    {
      title: t("account.yourShopping"),
      rows: [
        {
          icon: "shopping-bag",
          label: t("account.cart"),
          hint:
            totalCount > 0
              ? t(totalCount === 1 ? "account.cartItem" : "account.cartItems", { n: totalCount })
              : t("account.empty"),
          onPress: () => router.push("/(tabs)/cart"),
        },
        { icon: "clock", label: t("account.pastOrders"), hint: user ? undefined : t("account.noOrders"), onPress: () => router.push("/orders") },
        { icon: "heart", label: t("account.savedItems") },
      ],
    },
    sellerGroup,
    {
      title: t("account.delivery"),
      rows: [
        {
          icon: "map-pin",
          label: t("account.deliveryAddress"),
          hint: location === "Set delivery location" ? t("home.setLocation") : location,
          onPress: () => router.push("/delivery-address"),
        },
        { icon: "package", label: t("account.requestAnything"), onPress: () => router.push("/request") },
        { icon: "shopping-bag", label: t("home.browseShops"), onPress: () => router.push("/shops") },
        { icon: "tool", label: t("account.homeServices"), onPress: () => router.push("/services") },
      ],
    },
    {
      title: t("account.preferences"),
      rows: [
        {
          icon: "globe",
          label: t("account.language"),
          hint: current.nativeName,
          onPress: () => router.push("/language"),
        },
        { icon: "bell", label: t("account.notifications") },
        { icon: "credit-card", label: t("account.paymentMethods") },
        { icon: "help-circle", label: t("account.help") },
      ],
    },
  ];

  return (
    <>
      <ScrollView
        style={styles.root}
        contentContainerStyle={{ paddingBottom: spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <BrandMark size={52} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user ? user.name : t("account.hi")}</Text>
          <Text style={styles.sub}>{user ? user.email : t("account.signInSub")}</Text>
        </View>
        {user ? (
          <Pressable
            testID="account-logout-btn"
            onPress={logout}
            style={[styles.signInBtn, { backgroundColor: colors.surfaceTertiary }]}
          >
            <Text style={[styles.signInText, { color: colors.onSurface }]}>Sign out</Text>
          </Pressable>
        ) : (
          <Pressable
            testID="account-signin-btn"
            onPress={() => router.push("/auth")}
            style={styles.signInBtn}
          >
            <Text style={styles.signInText}>{t("account.signIn")}</Text>
          </Pressable>
        )}
      </View>

      {groups.map((g) => (
        <View key={g.title} style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <Text style={styles.groupTitle}>{g.title}</Text>
          <View style={styles.groupCard}>
            {g.rows.map((r, idx) => (
              <Pressable
                testID={`account-row-${r.label}`}
                key={r.label}
                onPress={r.onPress}
                style={({ pressed }) => [
                  styles.row,
                  idx < g.rows.length - 1 && styles.rowDivider,
                  pressed && { backgroundColor: colors.surfaceTertiary },
                ]}
              >
                <View style={styles.rowIcon}>
                  <Feather name={r.icon} size={18} color={colors.brandPrimary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{r.label}</Text>
                  {r.hint && (
                    <Text style={styles.rowHint} numberOfLines={1}>
                      {r.hint}
                    </Text>
                  )}
                </View>
                <Feather name="chevron-right" size={18} color={colors.muted} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <View style={styles.brandFooter}>
        <BrandLogo size="sm" />
        <Text style={styles.version}>{t("account.version")}</Text>
      </View>
    </ScrollView>

      <Modal
        visible={signInOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSignInOpen(false)}
      >
        <Pressable style={styles.signInBackdrop} onPress={() => setSignInOpen(false)}>
          <View style={styles.signInSheet}>
            <View style={styles.signInIcon}>
              <Feather name="user" size={28} color={colors.onBrandPrimary} />
            </View>
            <Text style={styles.signInTitle}>{t("account.signInComingSoon")}</Text>
            <Text style={styles.signInSub}>
              {t("account.signInComingSoonSub")}
            </Text>
            <Pressable
              testID="signin-close-btn"
              onPress={() => setSignInOpen(false)}
              style={styles.signInCloseBtn}
            >
              <Text style={styles.signInCloseText}>{t("account.gotIt")}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surfaceSecondary },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 20, fontWeight: "800", color: colors.brandPrimary },
  name: { fontSize: 17, fontWeight: "800", color: colors.onSurface },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },
  signInBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  signInText: { fontSize: 12, fontWeight: "800", color: colors.onBrandPrimary },

  groupTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: colors.muted,
    marginBottom: spacing.sm,
  },
  groupCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.brandTertiary,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { fontSize: 14, fontWeight: "600", color: colors.onSurface },
  rowHint: { fontSize: 12, color: colors.muted, marginTop: 2 },

  brandFooter: {
    alignItems: "center",
    marginTop: spacing.xl,
    gap: 2,
  },
  brandFooterTitle: { fontSize: 20, fontWeight: "800", color: colors.brandPrimary },
  brandFooterSub: { fontSize: 12, color: colors.muted },
  version: { fontSize: 10, color: colors.muted, marginTop: spacing.sm },

  signInBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  signInSheet: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  signInIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  signInTitle: { fontSize: 17, fontWeight: "800", color: colors.onSurface },
  signInSub: { fontSize: 13, color: colors.muted, textAlign: "center", lineHeight: 20 },
  signInCloseBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  signInCloseText: { color: colors.onBrandPrimary, fontWeight: "800" },
}));

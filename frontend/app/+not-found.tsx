import { Link } from "expo-router";

import { BrandLogo } from "@/src/components/BrandLogo";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { makeStyles, radius, spacing } from "@/src/theme";

export default function NotFoundScreen() {
  const insets = useSafeAreaInsets();
  const styles = useStyles();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.card}>
        <BrandLogo size="lg" />
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.sub}>
          The link you followed does not lead anywhere in Come In. Let's take you back home.
        </Text>
        <Link href="/(tabs)" asChild>
          <Pressable testID="not-found-home-btn" style={styles.btn}>
            <Text style={styles.btnText}>Go to Home</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  card: {
    alignItems: "center",
    gap: spacing.sm,
    maxWidth: 320,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.onSurface,
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 20,
  },
  btn: {
    marginTop: spacing.lg,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 14,
    borderRadius: radius.pill,
  },
  btnText: {
    color: colors.onBrandPrimary,
    fontWeight: "800",
    fontSize: 14,
  },
}));

import Feather from "@react-native-vector-icons/feather";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SERVICES } from "@/src/data/catalog";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function ServicesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const [bookedTitle, setBookedTitle] = useState<string | null>(null);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable testID="svc-back-btn" onPress={() => router.back()} style={styles.iconBtn}>
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Home services</Text>
          <Text style={styles.sub}>Trusted professionals at your doorstep</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          gap: spacing.md,
          paddingBottom: spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Flat 15% off</Text>
            <Text style={styles.bannerSub}>on your first service booking</Text>
          </View>
          <View style={styles.bannerIcon}>
            <Feather name="gift" size={22} color={colors.onBrandSecondary} />
          </View>
        </View>

        {SERVICES.map((s) => (
          <View key={s.id} style={styles.card} testID={`service-${s.id}`}>
            <Image source={s.image} style={styles.img} contentFit="cover" />
            <View style={styles.info}>
              <Text style={styles.sTitle}>{s.title}</Text>
              <Text style={styles.sTag}>{s.tagline}</Text>
              <View style={styles.cardBottom}>
                <Text style={styles.price}>{s.price}</Text>
                <Pressable
                  testID={`book-${s.id}`}
                  onPress={() => setBookedTitle(s.title)}
                  style={styles.bookBtn}
                >
                  <Text style={styles.bookText}>Book</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={!!bookedTitle}
        transparent
        animationType="fade"
        onRequestClose={() => setBookedTitle(null)}
      >
        <Pressable style={styles.backdrop} onPress={() => setBookedTitle(null)}>
          <Pressable style={styles.toast}>
            <View style={styles.toastIcon}>
              <Feather name="check" size={24} color={colors.onBrandPrimary} />
            </View>
            <Text style={styles.toastTitle}>Request received</Text>
            <Text style={styles.toastSub}>
              Your request for "{bookedTitle}" has been noted. A specialist will reach out shortly.
            </Text>
            <Pressable
              testID="toast-ok-btn"
              onPress={() => setBookedTitle(null)}
              style={styles.toastBtn}
            >
              <Text style={styles.toastBtnText}>Great, thanks</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.surfaceSecondary },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
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
  title: { fontSize: 18, fontWeight: "800", color: colors.onSurface },
  sub: { fontSize: 12, color: colors.muted, marginTop: 2 },

  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.brandSecondary,
    padding: spacing.lg,
    borderRadius: radius.lg,
  },
  bannerTitle: { fontSize: 18, fontWeight: "800", color: colors.onBrandSecondary },
  bannerSub: { fontSize: 13, color: colors.onBrandSecondary, marginTop: 2 },
  bannerIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: "#FFFFFF55",
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    overflow: "hidden",
  },
  img: { width: 110, height: 120, backgroundColor: colors.surfaceTertiary },
  info: { flex: 1, padding: spacing.md, gap: 4, justifyContent: "space-between" },
  sTitle: { fontSize: 15, fontWeight: "800", color: colors.onSurface },
  sTag: { fontSize: 12, color: colors.muted, marginTop: 2 },
  cardBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  price: { fontSize: 13, fontWeight: "800", color: colors.brandPrimary },
  bookBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.brandPrimary,
  },
  bookText: { fontSize: 12, fontWeight: "800", color: colors.onBrandPrimary },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  toast: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.surface,
    padding: spacing.xl,
    borderRadius: radius.lg,
    alignItems: "center",
    gap: spacing.sm,
  },
  toastIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  toastTitle: { fontSize: 17, fontWeight: "800", color: colors.onSurface },
  toastSub: { fontSize: 13, color: colors.muted, textAlign: "center" },
  toastBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  toastBtnText: { color: colors.onBrandPrimary, fontWeight: "800" },
}));

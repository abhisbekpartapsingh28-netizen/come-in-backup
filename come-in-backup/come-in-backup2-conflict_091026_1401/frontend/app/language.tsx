import Feather from "@react-native-vector-icons/feather";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LanguageCode, useT } from "@/src/i18n";
import { makeStyles, radius, spacing, useTheme } from "@/src/theme";

export default function LanguageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useStyles();
  const { colors } = useTheme();
  const { lang, setLang, options, t } = useT();
  const [selected, setSelected] = useState<LanguageCode>(lang);

  const handleSave = () => {
    setLang(selected);
    router.back();
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          testID="lang-back-btn"
          onPress={() => router.back()}
          style={styles.iconBtn}
        >
          <Feather name="arrow-left" size={20} color={colors.onSurface} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{t("lang.title")}</Text>
          <Text style={styles.sub}>{t("lang.sub")}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: 120 + insets.bottom,
          gap: spacing.sm,
        }}
        showsVerticalScrollIndicator={false}
      >
        {options.map((opt) => {
          const isSel = opt.code === selected;
          return (
            <Pressable
              key={opt.code}
              testID={`lang-${opt.code}`}
              onPress={() => setSelected(opt.code)}
              style={[
                styles.row,
                isSel && {
                  borderColor: colors.brandPrimary,
                  backgroundColor: colors.brandTertiary,
                },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.native,
                    opt.isRTL && { writingDirection: "rtl" },
                  ]}
                >
                  {opt.nativeName}
                </Text>
                <Text style={styles.english}>{opt.name}</Text>
              </View>
              {isSel ? (
                <View style={styles.checkWrap}>
                  <Feather name="check" size={16} color={colors.onBrandPrimary} />
                </View>
              ) : (
                <View style={styles.radio} />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.ctaBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <Pressable testID="lang-save-btn" onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveText}>{t("lang.continue")}</Text>
          <Feather name="arrow-right" size={18} color={colors.onBrandPrimary} />
        </Pressable>
      </View>
    </View>
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

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  native: { fontSize: 16, fontWeight: "700", color: colors.onSurface },
  english: { fontSize: 12, color: colors.muted, marginTop: 2 },
  checkWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },

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
  },
  saveBtn: {
    backgroundColor: colors.brandPrimary,
    paddingVertical: 14,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  saveText: { color: colors.onBrandPrimary, fontWeight: "800", fontSize: 15 },
}));

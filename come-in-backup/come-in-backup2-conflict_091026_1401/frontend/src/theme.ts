// Design tokens for Come In app. Forest green / warm paper / sunshine yellow light theme.
import { useMemo } from "react";
import { Appearance, StyleSheet, useColorScheme } from "react-native";

export type ColorScheme = "light" | "dark";

const light = {
  // ---------------------------------------------------------------------------
  // Surfaces — warm, welcoming paper with clean white cards.
  // ---------------------------------------------------------------------------
  surface: "#FFFDF8",
  onSurface: "#173326",
  surfaceSecondary: "#F6F7F0",
  onSurfaceSecondary: "#33483B",
  surfaceTertiary: "#EDF3E9",
  onSurfaceTertiary: "#4D6254",
  surfaceInverse: "#173326",
  onSurfaceInverse: "#FFFDF8",
  muted: "#66766B",

  // ---------------------------------------------------------------------------
  // Brand — forest green foundation, leaf green actions, yellow door accent.
  // ---------------------------------------------------------------------------
  brand: "#173326",
  brandForest: "#173326",
  brandLeaf: "#2F8F4E",
  onBrand: "#FFFFFF",
  brandPrimary: "#2F8F4E",
  onBrandPrimary: "#FFFFFF",
  brandSecondary: "#F0C94D",
  onBrandSecondary: "#173326",
  brandTertiary: "#DDEEDB",
  onBrandTertiary: "#1E5A33",

  // ---------------------------------------------------------------------------
  // Status
  // ---------------------------------------------------------------------------
  success: "#2F8F4E",
  onSuccess: "#FFFFFF",
  warning: "#A66B12",
  onWarning: "#FFFFFF",
  error: "#A83A32",
  onError: "#FFFFFF",
  info: "#365A50",
  onInfo: "#FFFFFF",

  // ---------------------------------------------------------------------------
  // Lines
  // ---------------------------------------------------------------------------
  border: "#D8E3D4",
  borderStrong: "#B8CDB8",
  divider: "#E5ECE1",
};

export type ThemeColors = typeof light;

export const defaultScheme = "light" satisfies ColorScheme;

export const themes: { light: ThemeColors; dark?: ThemeColors } = { light };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 6,
  md: 12,
  lg: 20,
  pill: 999,
};

export function setColorScheme(scheme: ColorScheme | null) {
  Appearance.setColorScheme?.(scheme ?? "unspecified");
}

setColorScheme?.(themes.dark ? null : defaultScheme);

export function useTheme(): { scheme: ColorScheme; colors: ThemeColors } {
  const system = useColorScheme();
  const scheme: ColorScheme =
    system === "light" || system === "dark"
      ? (themes[system] ? system : defaultScheme)
      : defaultScheme;
  return { scheme, colors: themes[scheme] ?? themes.light };
}

export const colors = themes.light;

export function makeStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): () => T {
  return function useStyles(): T {
    const { colors } = useTheme();
    return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  };
}

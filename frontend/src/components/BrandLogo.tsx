import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

type LogoSize = "sm" | "md" | "lg";

type BrandMarkProps = {
  size?: number;
};

type BrandLogoProps = {
  compact?: boolean;
  size?: LogoSize;
  showSupportingText?: boolean;
  testID?: string;
};

const DIMENSIONS: Record<LogoSize, number> = {
  sm: 34,
  md: 42,
  lg: 58,
};

// Full horizontal artwork is 1179×393 (exactly 3:1). It renders fluidly at
// 100% of its container width, capped per size token, so the complete image
// (house mark, wordmark, tagline, handwritten text) is always fully visible.
const FULL_LOGO_MAX_WIDTH: Record<LogoSize, number> = {
  sm: 220,
  md: 320,
  lg: 340,
};
const FULL_LOGO_RATIO = 3;

export function BrandMark({ size = DIMENSIONS.md }: BrandMarkProps) {
  return (
    <Image
      accessible
      accessibilityLabel="Come In house entrance logo"
      source={require("../../assets/images/icon.png")}
      style={[styles.mark, { width: size, height: size }]}
      contentFit="contain"
    />
  );
}

export function BrandLogo({
  compact = false,
  size = "md",
  testID,
}: BrandLogoProps) {
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Come In — your town, at your door"
      style={[styles.logo, compact && styles.logoCompact]}
    >
      {compact ? (
        <BrandMark size={DIMENSIONS[size]} />
      ) : (
        <Image
          testID={testID ?? "brand-logo"}
          source={require("../../assets/branding/come-in-logo-full.png")}
          style={[styles.fullLogo, { maxWidth: FULL_LOGO_MAX_WIDTH[size] }]}
          contentFit="contain"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    alignSelf: "stretch",
    alignItems: "center",
  },
  logoCompact: {
    alignSelf: "auto",
  },
  mark: {
    aspectRatio: 1,
  },
  fullLogo: {
    // Fluid width + aspectRatio: the whole artwork is always visible,
    // never cropped or stretched. Height derives from the 3:1 ratio.
    width: "100%",
    aspectRatio: FULL_LOGO_RATIO,
  },
});

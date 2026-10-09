// Platform-aware navigation helpers for the tab layout.
//
// `usesNativeTabs` is the single gate used by `app/(tabs)/_layout.tsx` to
// pick between the iOS 26+ liquid-glass NativeTabs and the classic JS Tabs
// fallback. iOS below 26, Android and web all use the fallback.
import { Platform } from "react-native";

export const usesNativeTabs =
  Platform.OS === "ios" && parseInt(String(Platform.Version), 10) >= 26;

import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { LogBox, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/src/components/error-boundary";
import { I18nProvider, useT } from "@/src/i18n";
import { queryClient } from "@/src/query-client";
import { AuthProvider } from "@/src/store/auth";
import { CartProvider } from "@/src/store/cart";
import { LocationProvider } from "@/src/store/location";

LogBox.ignoreAllLogs(true);

function RTLRoot({ children }: { children: React.ReactNode }) {
  const { isRTL } = useT();
  return (
    <View
      // The `direction` style is honored on web and iOS; Android picks it up
      // after a native reload (I18nManager.forceRTL is also called in setLang).
      style={{ flex: 1, direction: isRTL ? "rtl" : "ltr" } as never}
    >
      {children}
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <KeyboardProvider>
              <I18nProvider>
                <AuthProvider>
                  <LocationProvider>
                    <CartProvider>
                      <RTLRoot>
                        <Stack screenOptions={{ headerShown: false }} />
                      </RTLRoot>
                    </CartProvider>
                  </LocationProvider>
                </AuthProvider>
              </I18nProvider>
            </KeyboardProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

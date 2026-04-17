import { Slot, useRouter, useSegments, useRootNavigationState, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useAuthStore } from "../store/useAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const { colors, themeName } = useThemeStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [isNavReady, setIsNavReady] = useState(false);

  useEffect(() => {
    if (navigationState?.key) {
      setIsNavReady(true);
    }
  }, [navigationState?.key]);

  // Tema yÃ¼klenene kadar siyah ekran/spinner gÃ¶ster
  if (!colors) return null;

  const inAuthGroup = segments[0] === "(auth)";

  // Navigasyon hazÄ±r deÄŸilse bekle
  if (!isNavReady) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  // Auth KontrolÃ¼ - Redirect bileÅŸeni ile daha gÃ¼venli yÃ¶nlendirme
  if (!isAuthenticated && !inAuthGroup) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isAuthenticated && inAuthGroup) {
    return <Redirect href="/" />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={themeName === 'EMBER_MOSS' || themeName === 'AURA_LIGHT' ? "dark" : "light"} />
      <Slot />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});

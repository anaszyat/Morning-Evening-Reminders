import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
  useFonts,
} from "@expo-google-fonts/ibm-plex-sans-arabic";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

if (Text.defaultProps) {
  Text.defaultProps.style = { fontFamily: "IBMPlexSansArabic_400Regular" };
} else {
  Text.defaultProps = { style: { fontFamily: "IBMPlexSansArabic_400Regular" } };
}
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppSplash } from "@/components/AppSplash";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { OnboardingPermissions } from "@/components/OnboardingPermissions";
import { AppProvider, useApp } from "@/contexts/AppContext";
import colors from "@/constants/colors";

const ONBOARDED_KEY = "athkari:onboarded:v1";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function ThemedStack() {
  const { theme } = useApp();
  const palette = theme === "dark" ? colors.dark : colors.light;
  const [splashDone, setSplashDone] = useState(false);
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDED_KEY).then((val) => {
      setOnboarded(val === "true");
    }).catch(() => setOnboarded(true));
  }, []);

  const handleSplashFinish = useCallback(() => setSplashDone(true), []);

  const handleOnboardingDone = useCallback(() => {
    AsyncStorage.setItem(ONBOARDED_KEY, "true").catch(() => {});
    setOnboarded(true);
  }, []);

  const isDark = theme === "dark";

  return (
    <View style={[layoutStyles.root, { backgroundColor: palette.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.foreground,
          headerTitleStyle: { fontFamily: "IBMPlexSansArabic_700Bold" },
          headerBackTitle: "رجوع",
          contentStyle: { backgroundColor: palette.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="dhikr/[category]"
          options={{
            headerShown: true,
            title: "",
            headerTransparent: true,
          }}
        />
      </Stack>
      {!splashDone && <AppSplash onFinish={handleSplashFinish} />}
      {splashDone && onboarded === false && (
        <OnboardingPermissions onDone={handleOnboardingDone} />
      )}
    </View>
  );
}

const layoutStyles = StyleSheet.create({
  root: { flex: 1 },
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AppProvider>
                <ThemedStack />
              </AppProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    <BannerAd unitId="ca-app-pub-6484709364382743/4375129391" size={BannerAdSize.BANNER} />
    </SafeAreaProvider>
  );
}

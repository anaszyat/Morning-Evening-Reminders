import { Feather } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";

const LOGO = require("@/assets/images/logo.png");

export function Header() {
  const colors = useColors();
  const { theme, toggleTheme } = useApp();

  return (
    <View style={[styles.row, { backgroundColor: colors.background }]}>
      <Pressable
        onPress={toggleTheme}
        style={({ pressed }) => [
          styles.themeBtn,
          {
            backgroundColor: colors.secondary,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
        hitSlop={10}
      >
        <Feather
          name={theme === "dark" ? "sun" : "moon"}
          size={16}
          color={colors.primary}
        />
      </Pressable>

      <View style={styles.titleWrap}>
        <Image
          source={LOGO}
          style={styles.logo}
          contentFit="contain"
          transition={150}
          accessibilityLabel="شعار أذكاري"
        />
        <Text
          style={[
            styles.title,
            { color: colors.primary, fontFamily: "IBMPlexSansArabic_700Bold" },
          ]}
        >
          أذكاري
        </Text>
      </View>

      <View style={{ width: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 8,
  },
  titleWrap: {
    alignItems: "center",
    flex: 1,
    gap: 2,
  },
  logo: {
    width: 56,
    height: 56,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  themeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

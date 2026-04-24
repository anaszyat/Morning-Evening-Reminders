import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useApp } from "@/contexts/AppContext";

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
        <Text style={[styles.title, { color: colors.primary, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
          أذكاري
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_400Regular" }]}>
          حصن المسلم
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
    paddingVertical: 6,
  },
  titleWrap: {
    alignItems: "center",
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 10,
    marginTop: 1,
  },
  themeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});

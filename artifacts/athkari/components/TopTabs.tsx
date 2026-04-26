import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export type TabKey = "athkar" | "mawaqit" | "qibla" | "tasbih";

export type TabDef = {
  key: TabKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
};

export const TABS: TabDef[] = [
  { key: "athkar",  label: "الأذكار",  icon: "book-open" },
  { key: "tasbih",  label: "المسبحة",  icon: "star" },
  { key: "qibla",   label: "القبلة",   icon: "compass" },
  { key: "mawaqit", label: "المواقيت", icon: "clock" },
];

type Props = {
  active: TabKey;
  onChange: (k: TabKey) => void;
  onSettingsPress: () => void;
  settingsActive?: boolean;
};

export function TopTabs({ active, onChange, onSettingsPress, settingsActive }: Props) {
  const colors = useColors();
  const { theme, toggleTheme } = useApp();
  const isDark = theme === "dark";

  return (
    <View style={styles.wrapper}>
      {/* Left — theme toggle */}
      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
          toggleTheme();
        }}
        style={({ pressed }) => [styles.iconBtn, { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
      >
        <Feather name={isDark ? "sun" : "moon"} size={18} color={colors.primary} />
      </Pressable>

      {/* Center — 4-tab pill bar */}
      <View style={[styles.bar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {TABS.map((t) => {
          const isActive = !settingsActive && active === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => {
                if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
                onChange(t.key);
              }}
              style={styles.tabWrap}
            >
              {({ pressed }) =>
                isActive ? (
                  <LinearGradient
                    colors={[colors.primaryLight, colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.chip, { opacity: pressed ? 0.9 : 1 }]}
                  >
                    <Feather name={t.icon} size={16} color="#fff" />
                    <Text style={[styles.label, { color: "#fff", fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
                      {t.label}
                    </Text>
                  </LinearGradient>
                ) : (
                  <View style={[styles.chip, { opacity: pressed ? 0.7 : 1 }]}>
                    <Feather name={t.icon} size={16} color={colors.mutedForeground} />
                    <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_500Medium" }]}>
                      {t.label}
                    </Text>
                  </View>
                )
              }
            </Pressable>
          );
        })}
      </View>

      {/* Right — settings gear */}
      <Pressable
        onPress={() => {
          if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {});
          onSettingsPress();
        }}
        style={({ pressed }) => [
          styles.iconBtn,
          settingsActive && { backgroundColor: colors.primary, borderColor: colors.primary },
          !settingsActive && { backgroundColor: colors.card, borderColor: colors.border },
          { opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <Feather name="settings" size={18} color={settingsActive ? "#fff" : colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    gap: 8,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  bar: {
    flex: 1,
    flexDirection: "row",
    borderRadius: 22,
    borderWidth: 1,
    padding: 5,
    gap: 3,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tabWrap: { flex: 1 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 11,
    paddingHorizontal: 2,
    borderRadius: 16,
  },
  label: { fontSize: 11 },
});

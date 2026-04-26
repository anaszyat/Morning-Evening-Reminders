import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export type TabKey = "athkar" | "mawaqit" | "qibla" | "tasbih" | "stats" | "settings";

export type TabDef = {
  key: TabKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
};

export const TABS: TabDef[] = [
  { key: "athkar", label: "الأذكار", icon: "book-open" },
  { key: "mawaqit", label: "المواقيت", icon: "clock" },
  { key: "qibla", label: "القبلة", icon: "compass" },
  { key: "tasbih", label: "المسبحة", icon: "star" },
  { key: "stats", label: "إحصائياتي", icon: "bar-chart-2" },
  { key: "settings", label: "الإعدادات", icon: "settings" },
];

type Props = {
  active: TabKey;
  onChange: (k: TabKey) => void;
};

export function TopTabs({ active, onChange }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TABS.map((t) => {
          const isActive = active === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.selectionAsync().catch(() => {});
                }
                onChange(t.key);
              }}
              style={({ pressed }) => [styles.tab, { opacity: pressed ? 0.85 : 1 }]}
            >
              {isActive ? (
                <LinearGradient
                  colors={[colors.primaryLight, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeBg}
                >
                  <Feather name={t.icon} size={16} color="#fff" />
                  <Text style={[styles.label, { color: "#fff", fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
                    {t.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactive}>
                  <Feather name={t.icon} size={16} color={colors.mutedForeground} />
                  <Text
                    style={[styles.label, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_500Medium" }]}
                    numberOfLines={1}
                  >
                    {t.label}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    padding: 6,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  scrollContent: {
    flexDirection: "row",
    gap: 4,
  },
  tab: {},
  activeBg: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  inactive: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
});

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export type TabKey = "athkar" | "mawaqit" | "qibla" | "tasbih";

export type TabDef = {
  key: TabKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
};

export const TABS: TabDef[] = [
  { key: "tasbih", label: "المسبحة", icon: "star" },
  { key: "qibla", label: "القبلة", icon: "compass" },
  { key: "mawaqit", label: "المواقيت", icon: "clock" },
  { key: "athkar", label: "الأذكار", icon: "book-open" },
];

type Props = {
  active: TabKey;
  onChange: (k: TabKey) => void;
};

export function TopTabs({ active, onChange }: Props) {
  const colors = useColors();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
                <Feather name={t.icon} size={18} color="#fff" />
                <Text style={[styles.label, { color: "#fff", fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
                  {t.label}
                </Text>
              </LinearGradient>
            ) : (
              <View style={styles.inactive}>
                <Feather name={t.icon} size={18} color={colors.mutedForeground} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    marginHorizontal: 16,
    padding: 6,
    borderRadius: 22,
    borderWidth: 1,
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tab: {
    flex: 1,
  },
  activeBg: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 16,
  },
  inactive: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
});

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

export type TabKey = "athkar" | "mawaqit" | "qibla" | "tasbih" | "stats" | "settings";

export type TabDef = {
  key: TabKey;
  label: string;
  icon: keyof typeof Feather.glyphMap;
};

const ROW_ONE: TabDef[] = [
  { key: "athkar",  label: "الأذكار",   icon: "book-open" },
  { key: "tasbih",  label: "المسبحة",   icon: "star" },
  { key: "mawaqit", label: "المواقيت",  icon: "clock" },
];

const ROW_TWO: TabDef[] = [
  { key: "qibla",    label: "القبلة",      icon: "compass" },
  { key: "stats",    label: "إحصائياتي",   icon: "bar-chart-2" },
  { key: "settings", label: "الإعدادات",   icon: "settings" },
];

type Props = {
  active: TabKey;
  onChange: (k: TabKey) => void;
};

function TabRow({
  tabs,
  active,
  onChange,
  colors,
}: {
  tabs: TabDef[];
  active: TabKey;
  onChange: (k: TabKey) => void;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.bar, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {tabs.map((t) => {
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
                  <Feather name={t.icon} size={15} color="#fff" />
                  <Text style={[styles.label, { color: "#fff", fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
                    {t.label}
                  </Text>
                </LinearGradient>
              ) : (
                <View style={[styles.chip, styles.chipInactive, { opacity: pressed ? 0.7 : 1 }]}>
                  <Feather name={t.icon} size={15} color={colors.mutedForeground} />
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
  );
}

export function TopTabs({ active, onChange }: Props) {
  const colors = useColors();
  return (
    <View style={styles.wrapper}>
      <TabRow tabs={ROW_ONE} active={active} onChange={onChange} colors={colors} />
      <TabRow tabs={ROW_TWO} active={active} onChange={onChange} colors={colors} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    gap: 8,
  },
  bar: {
    flexDirection: "row",
    borderRadius: 22,
    borderWidth: 1,
    padding: 6,
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  tabWrap: {
    flex: 1,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 16,
  },
  chipInactive: {},
  label: {
    fontSize: 12,
  },
});

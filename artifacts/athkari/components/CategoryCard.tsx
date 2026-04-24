import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useMemo } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import type { AdhkarCategory } from "@/constants/adhkar";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const ICON_MAP: Record<AdhkarCategory["id"], { icon: keyof typeof Feather.glyphMap; gradient: [string, string] }> = {
  morning: { icon: "sunrise", gradient: ["#3B82F6", "#1E40AF"] },
  evening: { icon: "sunset", gradient: ["#6366F1", "#4338CA"] },
  sleep: { icon: "moon", gradient: ["#1E3A8A", "#0F172A"] },
  wake: { icon: "sun", gradient: ["#F59E0B", "#D97706"] },
};

type Props = {
  category: AdhkarCategory;
  onPress: () => void;
};

export function CategoryCard({ category, onPress }: Props) {
  const colors = useColors();
  const { getCategoryCompletedCount } = useApp();
  const total = category.items.length;
  const done = getCategoryCompletedCount(category.id);
  const percent = total ? Math.round((done / total) * 100) : 0;

  const meta = ICON_MAP[category.id];

  const progressBar = useMemo(
    () => `${Math.min(100, Math.max(0, percent))}%`,
    [percent],
  );

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPress();
      }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.95 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <Feather name="chevron-left" size={22} color={colors.mutedForeground} />
      <View style={styles.center}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
          {category.title}
        </Text>
        <Text
          style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_400Regular" }]}
        >
          {category.subtitle}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.percent, { color: colors.primary, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
            {percent}%
          </Text>
          <Text
            style={[styles.count, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_500Medium" }]}
          >
            {done} / {total}
          </Text>
        </View>
        <View style={[styles.barTrack, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.barFill,
              {
                width: progressBar as unknown as number,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>
      <LinearGradient
        colors={meta.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconWrap}
      >
        <Feather name={meta.icon} size={28} color="#fff" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 22,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 10,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  center: {
    flex: 1,
    alignItems: "flex-end",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "right",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "right",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  percent: {
    fontSize: 13,
    fontWeight: "700",
  },
  count: {
    fontSize: 12,
  },
  barTrack: {
    width: "100%",
    height: 4,
    borderRadius: 99,
    marginTop: 8,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 99,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});

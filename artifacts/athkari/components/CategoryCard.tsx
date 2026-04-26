import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";

import type { AdhkarCategory } from "@/constants/adhkar";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const ICON_MAP: Record<AdhkarCategory["id"], { icon: keyof typeof Feather.glyphMap; gradient: [string, string] }> = {
  morning: { icon: "sunrise", gradient: ["#3B82F6", "#1E40AF"] },
  evening: { icon: "sunset", gradient: ["#6366F1", "#4338CA"] },
  prayer: { icon: "book-open", gradient: ["#0EA5E9", "#0369A1"] },
  sleep: { icon: "moon", gradient: ["#1E3A8A", "#0F172A"] },
  wake: { icon: "sun", gradient: ["#F59E0B", "#D97706"] },
  duas: { icon: "heart", gradient: ["#7C3AED", "#4C1D95"] },
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
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <LinearGradient
        colors={meta.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconWrap}
      >
        <Feather name={meta.icon} size={26} color="#fff" />
      </LinearGradient>

      <Text
        style={[styles.title, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" }]}
        numberOfLines={1}
      >
        {category.title}
      </Text>
      <Text
        style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_400Regular" }]}
        numberOfLines={2}
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
              width: `${Math.min(100, Math.max(0, percent))}%`,
              backgroundColor: colors.primary,
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 22,
    borderWidth: 1,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    minHeight: 180,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
    minHeight: 30,
  },
  metaRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: "auto",
    paddingTop: 10,
  },
  percent: {
    fontSize: 13,
    fontWeight: "700",
  },
  count: {
    fontSize: 11,
  },
  barTrack: {
    width: "100%",
    height: 4,
    borderRadius: 99,
    marginTop: 6,
    overflow: "hidden",
    position: "relative",
  },
  barFill: {
    height: "100%",
    borderRadius: 99,
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
  },
});

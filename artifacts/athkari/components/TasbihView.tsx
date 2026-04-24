import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle } from "react-native-svg";

import { tasbihPhrases } from "@/constants/tasbih";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export function TasbihView() {
  const colors = useColors();
  const { tasbih, totalTasbih, incrementTasbih, resetTasbih } = useApp();
  const [activeId, setActiveId] = useState<string>(tasbihPhrases[0].id);
  const active = tasbihPhrases.find((p) => p.id === activeId)!;
  const count = tasbih[active.id] ?? 0;
  const percent = Math.min(100, Math.round((count / active.target) * 100));

  const ringSize = 230;
  const stroke = 10;
  const r = (ringSize - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  const onTap = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    incrementTasbih(active.id);
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 120 }}
      showsVerticalScrollIndicator={false}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
        inverted
      >
        {tasbihPhrases.map((p) => {
          const isActive = p.id === activeId;
          return (
            <Pressable
              key={p.id}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.selectionAsync().catch(() => {});
                }
                setActiveId(p.id);
              }}
              style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
            >
              {isActive ? (
                <LinearGradient
                  colors={[colors.primaryLight, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.chipActive}
                >
                  <Text style={[styles.chipText, { color: "#fff", fontFamily: "Tajawal_700Bold" }]}>
                    {p.short}
                  </Text>
                </LinearGradient>
              ) : (
                <View
                  style={[
                    styles.chip,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <Text
                    style={[styles.chipText, { color: colors.foreground, fontFamily: "Tajawal_500Medium" }]}
                  >
                    {p.short}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={onTap}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            opacity: pressed ? 0.97 : 1,
            transform: [{ scale: pressed ? 0.99 : 1 }],
          },
        ]}
      >
        <Text style={[styles.phrase, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
          {active.text}
        </Text>

        <View style={[styles.ringWrap, { width: ringSize, height: ringSize }]}>
          <Svg width={ringSize} height={ringSize}>
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r}
              stroke={colors.muted}
              strokeWidth={stroke}
              fill="none"
            />
            <Circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r}
              stroke={colors.primary}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${c} ${c}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              rotation={-90}
              origin={`${ringSize / 2}, ${ringSize / 2}`}
            />
          </Svg>
          <View style={styles.ringCenter} pointerEvents="none">
            <Text style={[styles.bigCount, { color: colors.primary, fontFamily: "Tajawal_700Bold" }]}>
              {count}
            </Text>
            <Text style={[styles.target, { color: colors.mutedForeground, fontFamily: "Tajawal_500Medium" }]}>
              الهدف: {active.target}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.totalPill}>
            <Text style={[styles.totalLabel, { color: colors.mutedForeground, fontFamily: "Tajawal_500Medium" }]}>
              المجموع الكلي:{" "}
              <Text style={{ color: colors.primary, fontFamily: "Tajawal_700Bold" }}>{totalTasbih}</Text>
            </Text>
          </View>

          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              if (Platform.OS !== "web") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
              }
              resetTasbih(active.id);
            }}
            style={({ pressed }) => [
              styles.resetBtn,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Feather name="rotate-ccw" size={14} color={colors.mutedForeground} />
            <Text style={[styles.resetText, { color: colors.foreground, fontFamily: "Tajawal_500Medium" }]}>
              تصفير العد
            </Text>
          </Pressable>
        </View>
      </Pressable>

      <View
        style={[styles.fadlCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <Text style={[styles.fadlTitle, { color: colors.primary, fontFamily: "Tajawal_700Bold" }]}>
          فضل الذكر
        </Text>
        <Text style={[styles.fadlText, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
          {active.fadl}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabsRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1,
  },
  chipActive: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
  },
  chipText: { fontSize: 13 },
  card: {
    marginHorizontal: 16,
    paddingVertical: 28,
    paddingHorizontal: 18,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    gap: 14,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  phrase: {
    fontSize: 26,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  ringCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  bigCount: { fontSize: 70, fontWeight: "700" },
  target: { fontSize: 13, marginTop: 4 },
  actionRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 6,
    marginTop: 4,
  },
  totalPill: {},
  totalLabel: { fontSize: 13 },
  resetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    borderWidth: 1,
  },
  resetText: { fontSize: 12 },
  fadlCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  fadlTitle: {
    fontSize: 14,
    textAlign: "right",
    marginBottom: 6,
  },
  fadlText: {
    fontSize: 13,
    lineHeight: 22,
    textAlign: "right",
  },
});

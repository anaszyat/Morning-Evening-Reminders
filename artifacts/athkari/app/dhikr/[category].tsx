import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { StarPattern } from "@/components/StarPattern";
import { getCategory, type Dhikr } from "@/constants/adhkar";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

export default function CategoryScreen() {
  const { category: categoryParam } = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { progress, incrementDhikr, resetCategory, getCategoryCompletedCount } = useApp();

  const category = useMemo(
    () => (categoryParam ? getCategory(categoryParam) : undefined),
    [categoryParam],
  );

  if (!category) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground, fontFamily: "Cairo_500Medium" }]}>
          الفئة غير موجودة
        </Text>
      </View>
    );
  }

  const total = category.items.length;
  const done = getCategoryCompletedCount(category.id);
  const percent = total ? Math.round((done / total) * 100) : 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerTitle: "" }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 20,
          paddingBottom: 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerShadow}>
          <LinearGradient
            colors={["#1E40AF", "#1E3A8A", "#172554"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <StarPattern color="#fff" opacity={0.06} />
            <View style={styles.headerRow}>
              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.iconBtn,
                  { backgroundColor: "rgba(255,255,255,0.18)", opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="chevron-right" size={20} color="#fff" />
              </Pressable>
              <View style={styles.headerCenter}>
                <Text style={[styles.heroTitle, { fontFamily: "Cairo_700Bold" }]}>
                  {category.title}
                </Text>
                <Text style={[styles.heroSub, { fontFamily: "Cairo_400Regular" }]}>
                  {category.subtitle}
                </Text>
              </View>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                  }
                  resetCategory(category.id);
                }}
                hitSlop={10}
                style={({ pressed }) => [
                  styles.iconBtn,
                  { backgroundColor: "rgba(255,255,255,0.18)", opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="rotate-ccw" size={18} color="#fff" />
              </Pressable>
            </View>

            <View style={styles.progressRow}>
              <Text style={[styles.percentText, { fontFamily: "Cairo_700Bold" }]}>
                {percent}%
              </Text>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: `${percent}%` }]} />
              </View>
              <Text style={[styles.progressText, { fontFamily: "Cairo_500Medium" }]}>
                {done} / {total}
              </Text>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.list}>
          {category.items.map((d, idx) => (
            <DhikrCard
              key={d.id}
              dhikr={d}
              index={idx + 1}
              currentCount={progress[`${category.id}:${d.id}`] ?? 0}
              onIncrement={() => incrementDhikr(category.id, d.id, d.count)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function DhikrCard({
  dhikr,
  index,
  currentCount,
  onIncrement,
}: {
  dhikr: Dhikr;
  index: number;
  currentCount: number;
  onIncrement: () => void;
}) {
  const colors = useColors();
  const isDone = currentCount >= dhikr.count;
  const percent = Math.min(100, Math.round((currentCount / dhikr.count) * 100));

  const ringSize = 56;
  const stroke = 5;
  const r = (ringSize - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <Pressable
      onPress={() => {
        if (isDone) return;
        if (Platform.OS !== "web") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onIncrement();
      }}
      style={({ pressed }) => [
        styles.dhikrCard,
        {
          backgroundColor: colors.card,
          borderColor: isDone ? colors.success : colors.border,
          opacity: pressed ? 0.96 : 1,
        },
      ]}
    >
      <View style={styles.dhikrHeader}>
        <View style={styles.indexBadge}>
          <Text style={[styles.indexText, { color: colors.primary, fontFamily: "Cairo_700Bold" }]}>
            {index}
          </Text>
        </View>
        {isDone && (
          <View style={[styles.doneBadge, { backgroundColor: colors.success }]}>
            <Feather name="check" size={14} color="#fff" />
          </View>
        )}
      </View>

      <Text
        style={[
          styles.dhikrText,
          {
            color: colors.foreground,
            fontFamily: "Cairo_500Medium",
            opacity: isDone ? 0.6 : 1,
          },
        ]}
      >
        {dhikr.text}
      </Text>

      {dhikr.fadl && (
        <View style={[styles.fadlBox, { backgroundColor: colors.accent }]}>
          <Feather name="award" size={12} color={colors.primary} />
          <Text
            style={[styles.fadlText, { color: colors.accentForeground, fontFamily: "Cairo_400Regular" }]}
          >
            {dhikr.fadl}
          </Text>
        </View>
      )}

      <View style={[styles.dhikrFooter, { borderTopColor: colors.border }]}>
        {dhikr.reference && (
          <Text style={[styles.refText, { color: colors.mutedForeground, fontFamily: "Cairo_400Regular" }]}>
            {dhikr.reference}
          </Text>
        )}
        <View style={[styles.counterWrap, { width: ringSize, height: ringSize }]}>
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
              stroke={isDone ? colors.success : colors.primary}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${c} ${c}`}
              strokeDashoffset={offset}
              strokeLinecap="round"
              rotation={-90}
              origin={`${ringSize / 2}, ${ringSize / 2}`}
            />
          </Svg>
          <View style={styles.counterCenter} pointerEvents="none">
            <Text style={[styles.counterCurrent, { color: colors.foreground, fontFamily: "Cairo_700Bold" }]}>
              {currentCount}
            </Text>
            <Text style={[styles.counterTarget, { color: colors.mutedForeground, fontFamily: "Cairo_500Medium" }]}>
              /{dhikr.count}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 16 },
  headerShadow: {
    marginHorizontal: 16,
    borderRadius: 26,
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  heroCard: {
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingVertical: 18,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  heroTitle: { color: "#fff", fontSize: 20 },
  heroSub: { color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4 },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
    backgroundColor: "rgba(0,0,0,0.18)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  percentText: { color: "#93C5FD", fontSize: 14 },
  barTrack: {
    flex: 1,
    height: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 99,
    overflow: "hidden",
  },
  barFill: { height: "100%", backgroundColor: "#93C5FD", borderRadius: 99 },
  progressText: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  list: { marginTop: 18 },
  dhikrCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: "#0F172A",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  dhikrHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  indexBadge: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(30,64,175,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  indexText: { fontSize: 13 },
  doneBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  dhikrText: {
    fontSize: 17,
    lineHeight: 32,
    textAlign: "right",
    writingDirection: "rtl",
  },
  fadlBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  fadlText: { fontSize: 12, flex: 1, textAlign: "right", lineHeight: 20 },
  dhikrFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  refText: { fontSize: 11, flex: 1, textAlign: "right" },
  counterWrap: { alignItems: "center", justifyContent: "center" },
  counterCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  counterCurrent: { fontSize: 16 },
  counterTarget: { fontSize: 11 },
});

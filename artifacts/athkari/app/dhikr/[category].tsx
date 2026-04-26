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

import { getCategory, type AdhkarCategory, type Dhikr } from "@/constants/adhkar";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

type HeaderStyle = {
  gradient: [string, string];
  iconBg: string;
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  textColor: string;
  subColor: string;
  cornerColor: string;
  cornerBg: string;
  trackColor: string;
};

const HEADER_STYLES: Record<
  AdhkarCategory["id"],
  { light: HeaderStyle; dark: HeaderStyle }
> = {
  morning: {
    light: {
      gradient: ["#DBEAFE", "#93C5FD"],
      iconBg: "#FEF3C7",
      icon: "sunrise",
      iconColor: "#F59E0B",
      textColor: "#1E3A8A",
      subColor: "#1E40AF",
      cornerColor: "#1E3A8A",
      cornerBg: "rgba(255,255,255,0.55)",
      trackColor: "rgba(30,58,138,0.18)",
    },
    dark: {
      gradient: ["#1E3A5F", "#0F2440"],
      iconBg: "rgba(251,191,36,0.18)",
      icon: "sunrise",
      iconColor: "#FBBF24",
      textColor: "#F8FAFC",
      subColor: "#CBD5E1",
      cornerColor: "#F8FAFC",
      cornerBg: "rgba(255,255,255,0.12)",
      trackColor: "rgba(255,255,255,0.18)",
    },
  },
  evening: {
    light: {
      gradient: ["#A7F3D0", "#5EEAD4"],
      iconBg: "#FED7AA",
      icon: "sunset",
      iconColor: "#EA580C",
      textColor: "#134E4A",
      subColor: "#0F766E",
      cornerColor: "#134E4A",
      cornerBg: "rgba(255,255,255,0.55)",
      trackColor: "rgba(19,78,74,0.18)",
    },
    dark: {
      gradient: ["#134E4A", "#042F2E"],
      iconBg: "rgba(251,146,60,0.2)",
      icon: "sunset",
      iconColor: "#FB923C",
      textColor: "#F8FAFC",
      subColor: "#A7F3D0",
      cornerColor: "#F8FAFC",
      cornerBg: "rgba(255,255,255,0.12)",
      trackColor: "rgba(255,255,255,0.18)",
    },
  },
  prayer: {
    light: {
      gradient: ["#BBF7D0", "#86EFAC"],
      iconBg: "#DCFCE7",
      icon: "book-open",
      iconColor: "#16A34A",
      textColor: "#14532D",
      subColor: "#166534",
      cornerColor: "#14532D",
      cornerBg: "rgba(255,255,255,0.55)",
      trackColor: "rgba(20,83,45,0.18)",
    },
    dark: {
      gradient: ["#064E3B", "#022C22"],
      iconBg: "rgba(74,222,128,0.18)",
      icon: "book-open",
      iconColor: "#4ADE80",
      textColor: "#F8FAFC",
      subColor: "#BBF7D0",
      cornerColor: "#F8FAFC",
      cornerBg: "rgba(255,255,255,0.12)",
      trackColor: "rgba(255,255,255,0.18)",
    },
  },
  sleep: {
    light: {
      gradient: ["#1E3A8A", "#172554"],
      iconBg: "rgba(255,255,255,0.18)",
      icon: "moon",
      iconColor: "#E0E7FF",
      textColor: "#FFFFFF",
      subColor: "rgba(255,255,255,0.8)",
      cornerColor: "#FFFFFF",
      cornerBg: "rgba(255,255,255,0.18)",
      trackColor: "rgba(255,255,255,0.18)",
    },
    dark: {
      gradient: ["#0F172A", "#020617"],
      iconBg: "rgba(255,255,255,0.1)",
      icon: "moon",
      iconColor: "#E0E7FF",
      textColor: "#FFFFFF",
      subColor: "rgba(255,255,255,0.7)",
      cornerColor: "#FFFFFF",
      cornerBg: "rgba(255,255,255,0.12)",
      trackColor: "rgba(255,255,255,0.18)",
    },
  },
  wake: {
    light: {
      gradient: ["#FECACA", "#FCA5A5"],
      iconBg: "#FEE2E2",
      icon: "sun",
      iconColor: "#DC2626",
      textColor: "#7F1D1D",
      subColor: "#991B1B",
      cornerColor: "#7F1D1D",
      cornerBg: "rgba(255,255,255,0.55)",
      trackColor: "rgba(127,29,29,0.18)",
    },
    dark: {
      gradient: ["#3F1818", "#1F0808"],
      iconBg: "rgba(251,113,133,0.2)",
      icon: "sun",
      iconColor: "#FB7185",
      textColor: "#F8FAFC",
      subColor: "#FCA5A5",
      cornerColor: "#F8FAFC",
      cornerBg: "rgba(255,255,255,0.12)",
      trackColor: "rgba(255,255,255,0.18)",
    },
  },
};

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
        <Text style={[styles.errorText, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_500Medium" }]}>
          الفئة غير موجودة
        </Text>
      </View>
    );
  }

  const total = category.items.length;
  const done = getCategoryCompletedCount(category.id);
  const percent = total ? Math.round((done / total) * 100) : 0;
  const headerStyle = HEADER_STYLES[category.id][colors.mode];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrap}>
          <View style={styles.headerShadow}>
            <LinearGradient
              colors={headerStyle.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <Pressable
                onPress={() => router.back()}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="رجوع"
                style={({ pressed }) => [
                  styles.cornerBtn,
                  styles.cornerRight,
                  { backgroundColor: headerStyle.cornerBg, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="chevron-right" size={20} color={headerStyle.cornerColor} />
              </Pressable>
              <Pressable
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
                  }
                  resetCategory(category.id);
                }}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="إعادة تعيين"
                style={({ pressed }) => [
                  styles.cornerBtn,
                  styles.cornerLeft,
                  { backgroundColor: headerStyle.cornerBg, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="rotate-ccw" size={16} color={headerStyle.cornerColor} />
              </Pressable>

              <View style={styles.heroBody}>
                <View style={styles.heroText}>
                  <Text
                    style={[
                      styles.heroTitle,
                      { color: headerStyle.textColor, fontFamily: "IBMPlexSansArabic_700Bold" },
                    ]}
                    numberOfLines={1}
                  >
                    {category.title}
                  </Text>
                  <Text
                    style={[
                      styles.heroSub,
                      { color: headerStyle.subColor, fontFamily: "IBMPlexSansArabic_400Regular" },
                    ]}
                    numberOfLines={1}
                  >
                    {category.subtitle}
                  </Text>
                </View>
                <View style={[styles.heroIcon, { backgroundColor: headerStyle.iconBg }]}>
                  <Feather name={headerStyle.icon} size={32} color={headerStyle.iconColor} />
                </View>
              </View>

              <View style={styles.heroFooter}>
                <Text
                  style={[
                    styles.heroFooterText,
                    { color: headerStyle.subColor, fontFamily: "IBMPlexSansArabic_500Medium" },
                  ]}
                >
                  {done} / {total}
                </Text>
                <View style={[styles.barTrack, { backgroundColor: headerStyle.trackColor }]}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${percent}%`, backgroundColor: headerStyle.iconColor },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.heroFooterText,
                    { color: headerStyle.textColor, fontFamily: "IBMPlexSansArabic_700Bold" },
                  ]}
                >
                  {percent}%
                </Text>
              </View>
            </LinearGradient>
          </View>
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
          <Text style={[styles.indexText, { color: colors.primary, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
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
            fontFamily: "IBMPlexSansArabic_500Medium",
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
            style={[styles.fadlText, { color: colors.accentForeground, fontFamily: "IBMPlexSansArabic_400Regular" }]}
          >
            {dhikr.fadl}
          </Text>
        </View>
      )}

      <View style={[styles.dhikrFooter, { borderTopColor: colors.border }]}>
        {dhikr.reference && (
          <Text style={[styles.refText, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_400Regular" }]}>
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
            <Text style={[styles.counterCurrent, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
              {currentCount}
            </Text>
            <Text style={[styles.counterTarget, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_500Medium" }]}>
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
  headerWrap: {
    paddingHorizontal: 16,
    alignItems: "center",
  },
  headerShadow: {
    width: "100%",
    maxWidth: 420,
    height: 120,
    borderRadius: 24,
    shadowColor: "#0F172A",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  heroCard: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    overflow: "hidden",
  },
  cornerBtn: {
    position: "absolute",
    top: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  cornerRight: { right: 10 },
  cornerLeft: { left: 10 },
  heroBody: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingHorizontal: 48,
  },
  heroText: {
    flex: 1,
    alignItems: "flex-end",
  },
  heroTitle: {
    fontSize: 20,
    textAlign: "right",
  },
  heroSub: {
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  heroFooter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  heroFooterText: { fontSize: 11 },
  barTrack: {
    flex: 1,
    height: 5,
    borderRadius: 99,
    overflow: "hidden",
    position: "relative",
  },
  barFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    borderRadius: 99,
  },
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

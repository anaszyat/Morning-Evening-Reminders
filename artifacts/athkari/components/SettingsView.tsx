import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React from "react";
import { Alert, Linking, Platform, Pressable, Share, StyleSheet, Switch, Text, View, ScrollView } from "react-native";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const LOGO = require("@/assets/images/logo.png");

type RowProps = {
  icon: keyof typeof Feather.glyphMap;
  iconColor: string;
  label: string;
  subLabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
};

function SettingRow({ icon, iconColor, label, subLabel, right, onPress }: RowProps) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed && onPress ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + "22" }]}>
        <Feather name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
          {label}
        </Text>
        {subLabel ? (
          <Text style={[styles.rowSub, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_400Regular" }]}>
            {subLabel}
          </Text>
        ) : null}
      </View>
      {right ?? (onPress ? <Feather name="chevron-left" size={18} color={colors.mutedForeground} /> : null)}
    </Pressable>
  );
}

export function SettingsView() {
  const colors = useColors();
  const { theme, toggleTheme } = useApp();
  const isDark = theme === "dark";

  const handleShare = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    try {
      await Share.share({
        message: "تطبيق أذكاري — أذكار الصباح والمساء والصلاة وأوقات الصلاة والقبلة. جرّبه الآن!",
        title: "أذكاري",
      });
    } catch (_) {}
  };

  const handleRate = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    const url = Platform.OS === "ios"
      ? "https://apps.apple.com"
      : "https://play.google.com";
    try {
      await Linking.openURL(url);
    } catch (_) {
      Alert.alert("تنبيه", "تعذّر فتح متجر التطبيقات.");
    }
  };

  const handleContact = async () => {
    try {
      await Linking.openURL("mailto:support@athkari.app?subject=دعم تطبيق أذكاري");
    } catch (_) {}
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <View style={styles.profileCard}>
        <Image
          source={LOGO}
          style={styles.logo}
          contentFit="contain"
          accessibilityLabel="شعار أذكاري"
        />
        <Text style={[styles.appName, { color: colors.primary, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
          أذكاري
        </Text>
        <Text style={[styles.appVersion, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_400Regular" }]}>
          الإصدار 1.0.0
        </Text>
      </View>

      <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
        المظهر
      </Text>

      <SettingRow
        icon={isDark ? "moon" : "sun"}
        iconColor="#6366F1"
        label={isDark ? "الوضع الليلي" : "الوضع النهاري"}
        subLabel="تبديل بين الوضع الفاتح والداكن"
        right={
          <Switch
            value={isDark}
            onValueChange={() => {
              if (Platform.OS !== "web") {
                Haptics.selectionAsync().catch(() => {});
              }
              toggleTheme();
            }}
            trackColor={{ false: colors.muted, true: colors.primary }}
            thumbColor="#fff"
          />
        }
      />

      <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
        التطبيق
      </Text>

      <SettingRow
        icon="share-2"
        iconColor="#0EA5E9"
        label="مشاركة التطبيق"
        subLabel="شارك أذكاري مع الأهل والأصدقاء"
        onPress={handleShare}
      />
      <SettingRow
        icon="star"
        iconColor="#F59E0B"
        label="تقييم التطبيق"
        subLabel="دعمك يساعدنا على التطوير"
        onPress={handleRate}
      />
      <SettingRow
        icon="mail"
        iconColor="#10B981"
        label="تواصل معنا"
        subLabel="support@athkari.app"
        onPress={handleContact}
      />

      <Text style={[styles.section, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
        معلومات
      </Text>

      <View style={[styles.quoteCard, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" }]}>
        <Text style={[styles.quoteText, { color: colors.primary, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
          {'"أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"'}
        </Text>
        <Text style={[styles.quoteRef, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_400Regular" }]}>
          سورة الرعد: 28
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 100 },
  profileCard: { alignItems: "center", paddingVertical: 28 },
  logo: { width: 80, height: 80 },
  appName: { fontSize: 22, marginTop: 8 },
  appVersion: { fontSize: 13, marginTop: 4 },
  section: { fontSize: 12, textTransform: "uppercase", letterSpacing: 1, marginTop: 24, marginBottom: 8, textAlign: "right" },
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  rowIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1, alignItems: "flex-end" },
  rowLabel: { fontSize: 15 },
  rowSub: { fontSize: 12, marginTop: 2 },
  quoteCard: {
    marginTop: 28,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  quoteText: { fontSize: 16, textAlign: "center", lineHeight: 28 },
  quoteRef: { fontSize: 13 },
});

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { triggerTestNotification } from "@/lib/notifications";
import { prayerLabels, type PrayerKey } from "@/lib/prayerTimes";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const ORDER: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

export function NotificationsModal({ visible, onClose }: Props) {
  const colors = useColors();
  const {
    notificationsEnabled,
    toggleNotifications,
    prayerNotifications,
    togglePrayerNotification,
  } = useApp();
  const [testSent, setTestSent] = useState<"idle" | "ok" | "fail">("idle");

  const onTest = async () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    const ok = await triggerTestNotification();
    setTestSent(ok ? "ok" : "fail");
    setTimeout(() => setTestSent("idle"), 2500);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.wrap, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderColor: colors.border }]}>
          <Pressable onPress={onClose} hitSlop={12}>
            <Feather name="x" size={22} color={colors.foreground} />
          </Pressable>
          <Text
            style={[styles.title, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" }]}
          >
            تنبيهات الأذان
          </Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}>
          {/* Master row */}
          <View style={[styles.cardRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Switch
              value={notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor="#fff"
            />
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text
                style={[styles.itemTitle, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" }]}
              >
                تنبيهات الأذان
              </Text>
              <Text
                style={[
                  styles.itemSub,
                  { color: notificationsEnabled ? colors.primary : colors.mutedForeground, fontFamily: "IBMPlexSansArabic_500Medium" },
                ]}
              >
                {notificationsEnabled ? "مفعّلة" : "موقوفة"}
              </Text>
            </View>
            <LinearGradient
              colors={notificationsEnabled ? ["#3B82F6", "#1E40AF"] : [colors.muted, colors.muted]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconBtn}
            >
              <Feather
                name={notificationsEnabled ? "bell" : "bell-off"}
                size={20}
                color="#fff"
              />
            </LinearGradient>
          </View>

          {/* Test button */}
          <Pressable
            onPress={onTest}
            disabled={!notificationsEnabled}
            style={({ pressed }) => [
              styles.testBtn,
              {
                backgroundColor: notificationsEnabled ? colors.card : colors.muted,
                borderColor: colors.border,
                opacity: pressed ? 0.85 : notificationsEnabled ? 1 : 0.6,
              },
            ]}
          >
            <Feather
              name={testSent === "ok" ? "check-circle" : testSent === "fail" ? "alert-circle" : "play"}
              size={16}
              color={testSent === "fail" ? "#B91C1C" : colors.primary}
            />
            <Text
              style={[
                styles.testText,
                {
                  color: testSent === "fail" ? "#B91C1C" : colors.foreground,
                  fontFamily: "IBMPlexSansArabic_600SemiBold",
                },
              ]}
            >
              {testSent === "ok"
                ? "تم إرسال التنبيه"
                : testSent === "fail"
                  ? "لم يُسمح بالتنبيهات"
                  : "تجربة التنبيه"}
            </Text>
          </Pressable>

          <Text
            style={[
              styles.sectionLabel,
              { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" },
            ]}
          >
            تفعيل التنبيه لكل صلاة
          </Text>

          {ORDER.map((key) => {
            const value = prayerNotifications[key] && notificationsEnabled;
            return (
              <View
                key={key}
                style={[
                  styles.prayerRow,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Switch
                  value={prayerNotifications[key]}
                  onValueChange={() => togglePrayerNotification(key)}
                  disabled={!notificationsEnabled}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor="#fff"
                />
                <Text
                  style={[
                    styles.prayerName,
                    {
                      color: value ? colors.foreground : colors.mutedForeground,
                      fontFamily: "IBMPlexSansArabic_700Bold",
                    },
                  ]}
                >
                  {prayerLabels[key]}
                </Text>
              </View>
            );
          })}

          <View style={[styles.note, { backgroundColor: "#FEF3C7" }]}>
            <Text style={styles.noteIcon}>💡</Text>
            <Text
              style={[
                styles.noteText,
                { color: "#92400E", fontFamily: "IBMPlexSansArabic_500Medium" },
              ]}
            >
              {Platform.OS === "web"
                ? "يجب أن يبقى التطبيق مفتوحًا في المتصفح ليُشغّل التنبيه. على الأجهزة المحمولة قد لا تظهر بعض التنبيهات إلا بعد تثبيت التطبيق."
                : "تأكد من تفعيل التنبيهات للتطبيق من إعدادات الجهاز ليصلك تنبيه الأذان حتى لو كان التطبيق مغلقًا."}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 17 },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  itemTitle: { fontSize: 15, textAlign: "right" },
  itemSub: { fontSize: 12, marginTop: 2, textAlign: "right" },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 12,
  },
  testText: { fontSize: 13 },
  sectionLabel: {
    fontSize: 14,
    marginTop: 22,
    marginBottom: 10,
    textAlign: "right",
  },
  prayerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  prayerName: { fontSize: 15 },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 14,
    borderRadius: 14,
    marginTop: 18,
  },
  noteIcon: { fontSize: 16 },
  noteText: { flex: 1, fontSize: 12, textAlign: "right", lineHeight: 20 },
});

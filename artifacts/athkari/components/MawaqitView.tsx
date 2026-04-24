import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { MosqueArches } from "@/components/MosqueArches";
import { StarPattern } from "@/components/StarPattern";
import { cities } from "@/constants/cities";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import {
  calculatePrayerTimes,
  formatCountdown,
  formatTime12,
  getNextPrayer,
  prayerLabels,
  type PrayerKey,
} from "@/lib/prayerTimes";

const PRAYER_ICONS: Record<PrayerKey, keyof typeof Feather.glyphMap> = {
  fajr: "sunrise",
  sunrise: "sun",
  dhuhr: "sun",
  asr: "cloud",
  maghrib: "sunset",
  isha: "moon",
};

export function MawaqitView() {
  const colors = useColors();
  const {
    city,
    setCity,
    notificationsEnabled,
    toggleNotifications,
    effectiveLocation,
    useDeviceLocation,
    deviceLocation,
    locationStatus,
    locationError,
    requestDeviceLocation,
    disableDeviceLocation,
  } = useApp();
  const [now, setNow] = useState(new Date());
  const [showCityPicker, setShowCityPicker] = useState(false);

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  const times = useMemo(
    () =>
      calculatePrayerTimes(
        now,
        effectiveLocation.latitude,
        effectiveLocation.longitude,
        "UmmAlQura",
      ),
    // recompute only when day or location changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveLocation.latitude, effectiveLocation.longitude, now.getDate()],
  );

  const next = useMemo(() => getNextPrayer(times, now), [times, now]);
  const remaining = next.time.getTime() - now.getTime();

  const prayerOrder: PrayerKey[] = ["isha", "maghrib", "asr", "dhuhr", "fajr"];

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroShadow}>
        <LinearGradient
          colors={["#1E40AF", "#1E3A8A", "#172554"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <StarPattern color="#ffffff" opacity={0.04} />
          <MosqueArches color="#ffffff" opacity={0.18} />
          <View style={styles.heroTop}>
            <Pressable
              onPress={toggleNotifications}
              style={({ pressed }) => [
                styles.pill,
                {
                  backgroundColor: notificationsEnabled
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(255,255,255,0.08)",
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              <Feather
                name={notificationsEnabled ? "bell" : "bell-off"}
                size={14}
                color="#fff"
              />
              <Text style={[styles.pillText, { fontFamily: "Tajawal_500Medium" }]}>
                تنبيهات الأذان
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowCityPicker(true)}
              style={({ pressed }) => [styles.cityRow, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Feather name="chevron-down" size={14} color="#fff" />
              <Text style={[styles.cityText, { fontFamily: "Tajawal_700Bold" }]} numberOfLines={1}>
                {effectiveLocation.name}
                {effectiveLocation.country ? `، ${effectiveLocation.country}` : ""}
              </Text>
              <Feather
                name={effectiveLocation.isDevice ? "navigation-2" : "map-pin"}
                size={14}
                color="#fff"
              />
            </Pressable>
          </View>

          <View style={styles.heroCenter}>
            <Text style={[styles.heroLabel, { fontFamily: "Tajawal_400Regular" }]}>
              متبقي على الأذان
            </Text>
            <Text style={[styles.heroPrayer, { fontFamily: "Tajawal_700Bold" }]}>
              {prayerLabels[next.key]}
            </Text>
            <View style={styles.countWrap}>
              <Text style={[styles.countdown, { fontFamily: "Tajawal_700Bold" }]}>
                {formatCountdown(remaining)}
              </Text>
            </View>
          </View>

          <View style={styles.heroBottom}>
            <Text style={[styles.heroBottomTime, { fontFamily: "Tajawal_700Bold" }]}>
              {formatTime12(next.time)}
            </Text>
            <View style={styles.nextRow}>
              <Feather name="sun" size={14} color="#FCD34D" />
              <Text style={[styles.heroBottomLabel, { fontFamily: "Tajawal_400Regular" }]}>
                الأذان القادم
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
          مواقيت الصلاة
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.timesRow}
          inverted
        >
          {prayerOrder.map((key) => {
            const isNext = next.key === key && !next.isTomorrow;
            return (
              <View
                key={key}
                style={[
                  styles.timeCard,
                  {
                    backgroundColor: isNext ? colors.primary : colors.card,
                    borderColor: isNext ? colors.primary : colors.border,
                  },
                ]}
              >
                <Feather
                  name={PRAYER_ICONS[key]}
                  size={20}
                  color={isNext ? "#fff" : colors.gold}
                />
                <Text
                  style={[
                    styles.timeName,
                    {
                      color: isNext ? "#fff" : colors.foreground,
                      fontFamily: "Tajawal_700Bold",
                    },
                  ]}
                >
                  {prayerLabels[key]}
                </Text>
                <Text
                  style={[
                    styles.timeValue,
                    {
                      color: isNext ? "rgba(255,255,255,0.9)" : colors.mutedForeground,
                      fontFamily: "Tajawal_500Medium",
                    },
                  ]}
                >
                  {formatTime12(times[key])}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.sunriseBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sunriseTime, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
          {formatTime12(times.sunrise)}
        </Text>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={[styles.sunriseTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
            الشروق
          </Text>
          <Text style={[styles.sunriseSub, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
            وقت ممنوع للصلاة
          </Text>
        </View>
        <View style={[styles.iconCircle, { backgroundColor: "rgba(245,158,11,0.12)" }]}>
          <Feather name="sun" size={20} color={colors.gold} />
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            }
            requestDeviceLocation();
          }}
          disabled={locationStatus === "requesting"}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              backgroundColor: useDeviceLocation ? colors.primary : colors.card,
              borderColor: useDeviceLocation ? colors.primary : colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          {locationStatus === "requesting" ? (
            <ActivityIndicator size="small" color={useDeviceLocation ? "#fff" : colors.primary} />
          ) : (
            <Feather
              name={useDeviceLocation ? "navigation-2" : "navigation"}
              size={14}
              color={useDeviceLocation ? "#fff" : colors.primary}
            />
          )}
          <Text
            style={[
              styles.actionText,
              {
                color: useDeviceLocation ? "#fff" : colors.foreground,
                fontFamily: "Tajawal_700Bold",
              },
            ]}
          >
            {useDeviceLocation ? "موقعي الحالي" : "استخدام موقعي"}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setShowCityPicker(true)}
          style={({ pressed }) => [
            styles.actionBtn,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather name="map" size={14} color={colors.primary} />
          <Text style={[styles.actionText, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
            اختر مدينة
          </Text>
        </Pressable>
      </View>

      {locationError && (
        <View style={[styles.errBox, { backgroundColor: "#FEE2E2" }]}>
          <Feather name="alert-circle" size={14} color="#B91C1C" />
          <Text style={[styles.errText, { color: "#B91C1C", fontFamily: "Tajawal_500Medium" }]}>
            {locationError}
          </Text>
        </View>
      )}

      <Text style={[styles.footer, { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" }]}>
        صدقة جارية - تطبيق أذكاري
      </Text>

      <Modal
        visible={showCityPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCityPicker(false)}
      >
        <View style={[styles.modalWrap, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderColor: colors.border }]}>
            <Pressable onPress={() => setShowCityPicker(false)} hitSlop={10}>
              <Feather name="x" size={24} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "Tajawal_700Bold" }]}>
              اختر موقعك
            </Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView contentContainerStyle={{ paddingVertical: 8 }}>
            <Pressable
              onPress={async () => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                }
                const ok = await requestDeviceLocation();
                if (ok) setShowCityPicker(false);
              }}
              style={({ pressed }) => [
                styles.deviceItem,
                {
                  backgroundColor: useDeviceLocation ? colors.primary : colors.accent,
                  opacity: pressed ? 0.85 : 1,
                },
              ]}
            >
              {locationStatus === "requesting" ? (
                <ActivityIndicator color={useDeviceLocation ? "#fff" : colors.primary} />
              ) : (
                <Feather
                  name="navigation-2"
                  size={18}
                  color={useDeviceLocation ? "#fff" : colors.primary}
                />
              )}
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text
                  style={[
                    styles.deviceName,
                    {
                      color: useDeviceLocation ? "#fff" : colors.primary,
                      fontFamily: "Tajawal_700Bold",
                    },
                  ]}
                >
                  استخدام موقعي الحالي (GPS)
                </Text>
                <Text
                  style={[
                    styles.deviceSub,
                    {
                      color: useDeviceLocation ? "rgba(255,255,255,0.85)" : colors.primary,
                      fontFamily: "Tajawal_500Medium",
                    },
                  ]}
                >
                  {useDeviceLocation && deviceLocation
                    ? `${deviceLocation.name}${deviceLocation.country ? `، ${deviceLocation.country}` : ""}`
                    : "أدق توقيت لمواقيت صلاتك واتجاه القبلة"}
                </Text>
              </View>
            </Pressable>

            {useDeviceLocation && (
              <Pressable
                onPress={() => disableDeviceLocation()}
                style={({ pressed }) => [
                  styles.disableBtn,
                  { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Feather name="x-circle" size={14} color={colors.mutedForeground} />
                <Text
                  style={[
                    styles.disableText,
                    { color: colors.mutedForeground, fontFamily: "Tajawal_500Medium" },
                  ]}
                >
                  إيقاف استخدام موقعي
                </Text>
              </Pressable>
            )}

            <Text
              style={[
                styles.sectionLabel,
                { color: colors.mutedForeground, fontFamily: "Tajawal_700Bold" },
              ]}
            >
              أو اختر مدينة
            </Text>

            {cities.map((c) => {
              const selected = !useDeviceLocation && c.id === city.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    setCity(c);
                    setShowCityPicker(false);
                  }}
                  style={({ pressed }) => [
                    styles.cityItem,
                    {
                      backgroundColor: selected ? colors.accent : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  {selected && (
                    <Feather name="check" size={18} color={colors.primary} />
                  )}
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text
                      style={[
                        styles.cityItemName,
                        { color: colors.foreground, fontFamily: "Tajawal_700Bold" },
                      ]}
                    >
                      {c.name}
                    </Text>
                    <Text
                      style={[
                        styles.cityItemCountry,
                        { color: colors.mutedForeground, fontFamily: "Tajawal_400Regular" },
                      ]}
                    >
                      {c.country}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  heroShadow: {
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 28,
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  hero: {
    borderRadius: 28,
    paddingHorizontal: 18,
    paddingVertical: 18,
    overflow: "hidden",
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
  },
  pillText: { color: "#fff", fontSize: 12 },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 1,
  },
  cityText: { color: "#fff", fontSize: 13, flexShrink: 1 },
  heroCenter: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 14,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 4,
  },
  heroPrayer: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "700",
    marginVertical: 6,
  },
  countWrap: {
    backgroundColor: "rgba(0,0,0,0.18)",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 8,
  },
  countdown: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: 1,
  },
  heroBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    marginTop: 16,
  },
  heroBottomTime: { color: "#fff", fontSize: 14 },
  nextRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroBottomLabel: { color: "rgba(255,255,255,0.85)", fontSize: 12 },
  section: { marginTop: 22, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 10,
  },
  timesRow: { gap: 10, paddingVertical: 4 },
  timeCard: {
    width: 78,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    gap: 6,
  },
  timeName: { fontSize: 13, fontWeight: "600" },
  timeValue: { fontSize: 11 },
  sunriseBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  sunriseTime: { fontSize: 17, fontWeight: "700" },
  sunriseTitle: { fontSize: 15, fontWeight: "700", textAlign: "right" },
  sunriseSub: { fontSize: 11, marginTop: 2, textAlign: "right" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 18,
    paddingHorizontal: 16,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1,
    minWidth: 140,
    justifyContent: "center",
  },
  actionText: { fontSize: 13, fontWeight: "600" },
  errBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  errText: { fontSize: 12, flex: 1, textAlign: "right" },
  footer: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 18,
  },
  modalWrap: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontWeight: "700" },
  deviceItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 18,
  },
  deviceName: { fontSize: 14, textAlign: "right" },
  deviceSub: { fontSize: 12, marginTop: 2, textAlign: "right" },
  disableBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginHorizontal: 12,
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 99,
    borderWidth: 1,
  },
  disableText: { fontSize: 12 },
  sectionLabel: {
    fontSize: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    textAlign: "right",
  },
  cityItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginHorizontal: 12,
    borderRadius: 14,
  },
  cityItemName: { fontSize: 15, fontWeight: "600", textAlign: "right" },
  cityItemCountry: { fontSize: 12, marginTop: 2, textAlign: "right" },
});

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

import { CountdownMosqueArch } from "@/components/CountdownMosqueArch";
import { NotificationsModal } from "@/components/NotificationsModal";
import { StarPattern } from "@/components/StarPattern";
import { cities } from "@/constants/cities";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { schedulePrayerNotifications } from "@/lib/notifications";
import {
  calculatePrayerTimes,
  formatCountdown,
  formatTime12,
  getNextPrayer,
  getPrevPrayerTime,
  prayerLabels,
  prayerMethodLabels,
  prayerMethods,
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
    prayerNotifications,
    calculationMethod,
    setCalculationMethod,
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
  const [showNotifModal, setShowNotifModal] = useState(false);

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
        calculationMethod,
      ),
    // recompute when day, location, or method changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveLocation.latitude, effectiveLocation.longitude, now.getDate(), calculationMethod],
  );

  const next = useMemo(() => getNextPrayer(times, now), [times, now]);
  const remaining = next.time.getTime() - now.getTime();

  // Fraction of the interval between previous and next prayer that REMAINS.
  const remainingFraction = useMemo(() => {
    const prev = getPrevPrayerTime(times, now);
    const total = next.time.getTime() - prev.getTime();
    if (total <= 0) return 1;
    const elapsed = now.getTime() - prev.getTime();
    return Math.max(0, Math.min(1, 1 - elapsed / total));
  }, [times, next.time, now]);

  // Order shown right-to-left in the row: fajr first on the right, isha last on the left
  const prayerOrder: PrayerKey[] = ["isha", "maghrib", "asr", "dhuhr", "fajr"];

  // Hijri + Gregorian dates (re-computed each day)
  const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const { hijriDate, gregorianDate } = useMemo(() => {
    let hijri = "";
    let gregorian = "";
    try {
      hijri = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now);
    } catch {
      hijri = "";
    }
    try {
      gregorian = new Intl.DateTimeFormat("ar-EG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(now);
    } catch {
      gregorian = now.toDateString();
    }
    return { hijriDate: hijri, gregorianDate: gregorian };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayKey]);

  // Re-schedule local notifications whenever times or settings change
  useEffect(() => {
    schedulePrayerNotifications(times, prayerNotifications, notificationsEnabled).catch(
      () => {},
    );
  }, [
    times.fajr.getTime(),
    times.dhuhr.getTime(),
    times.asr.getTime(),
    times.maghrib.getTime(),
    times.isha.getTime(),
    prayerNotifications.fajr,
    prayerNotifications.dhuhr,
    prayerNotifications.asr,
    prayerNotifications.maghrib,
    prayerNotifications.isha,
    notificationsEnabled,
  ]);

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
          <View style={styles.heroTop}>
            <Pressable
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
                }
                setShowNotifModal(true);
              }}
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
              <Text style={[styles.pillText, { fontFamily: "IBMPlexSansArabic_500Medium" }]}>
                تنبيهات الأذان
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setShowCityPicker(true)}
              style={({ pressed }) => [styles.cityRow, { opacity: pressed ? 0.8 : 1 }]}
            >
              <Feather name="chevron-down" size={14} color="#fff" />
              <Text style={[styles.cityText, { fontFamily: "IBMPlexSansArabic_600SemiBold" }]} numberOfLines={1}>
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

          <View style={styles.archRow}>
            <CountdownMosqueArch
              width={220}
              height={120}
              progress={remainingFraction}
              outlineColor="rgba(255,255,255,0.18)"
              traceColor="#ffffff"
              glowColor="#67E8F9"
              baseColor="rgba(255,255,255,0.45)"
              strokeWidth={4}
            />
          </View>

          <View style={styles.heroCenter}>
            <Text style={[styles.heroPrayer, { fontFamily: "IBMPlexSansArabic_700Bold" }]}>
              {prayerLabels[next.key]}
            </Text>
            <Text style={[styles.heroLabel, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>
              متبقي على الأذان
            </Text>
            <View style={styles.countdownPill}>
              <Text style={[styles.countdown, { fontFamily: "IBMPlexSansArabic_700Bold" }]}>
                {formatCountdown(remaining)}
              </Text>
            </View>
          </View>

          <View style={styles.datesRow}>
            <Text style={[styles.dateText, { fontFamily: "IBMPlexSansArabic_500Medium" }]}>
              {hijriDate}
            </Text>
            <View style={styles.dateDot} />
            <Text style={[styles.dateText, { fontFamily: "IBMPlexSansArabic_500Medium" }]}>
              {gregorianDate}
            </Text>
          </View>

          <View style={styles.heroBottom}>
            <Text style={[styles.heroBottomTime, { fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
              {formatTime12(next.time)}
            </Text>
            <View style={styles.nextRow}>
              <Feather name="sun" size={14} color="#FCD34D" />
              <Text style={[styles.heroBottomLabel, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>
                الأذان القادم
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
          مواقيت الصلاة
        </Text>
        <View style={styles.timesRow}>
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
                  size={16}
                  color={isNext ? "#fff" : colors.gold}
                />
                <Text
                  style={[
                    styles.timeName,
                    {
                      color: isNext ? "#fff" : colors.foreground,
                      fontFamily: "IBMPlexSansArabic_600SemiBold",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {prayerLabels[key]}
                </Text>
                <Text
                  style={[
                    styles.timeValue,
                    {
                      color: isNext ? "rgba(255,255,255,0.9)" : colors.mutedForeground,
                      fontFamily: "IBMPlexSansArabic_500Medium",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {formatTime12(times[key])}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.sunriseBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sunriseTime, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
          {formatTime12(times.sunrise)}
        </Text>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={[styles.sunriseTitle, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
            الشروق
          </Text>
          <Text style={[styles.sunriseSub, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_400Regular" }]}>
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
                fontFamily: "IBMPlexSansArabic_600SemiBold",
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
          <Text style={[styles.actionText, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
            اختر مدينة
          </Text>
        </Pressable>
      </View>

      {locationError && (
        <View style={[styles.errBox, { backgroundColor: "#FEE2E2" }]}>
          <Feather name="alert-circle" size={14} color="#B91C1C" />
          <Text style={[styles.errText, { color: "#B91C1C", fontFamily: "IBMPlexSansArabic_500Medium" }]}>
            {locationError}
          </Text>
        </View>
      )}

      <Text style={[styles.footer, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_400Regular" }]}>
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
            <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
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
                      fontFamily: "IBMPlexSansArabic_700Bold",
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
                      fontFamily: "IBMPlexSansArabic_500Medium",
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
                    { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_500Medium" },
                  ]}
                >
                  إيقاف استخدام موقعي
                </Text>
              </Pressable>
            )}

            <Text
              style={[
                styles.sectionLabel,
                { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_600SemiBold" },
              ]}
            >
              طريقة الحساب
            </Text>

            {prayerMethods.map((m) => {
              const selected = m === calculationMethod;
              return (
                <Pressable
                  key={m}
                  onPress={() => setCalculationMethod(m)}
                  style={({ pressed }) => [
                    styles.cityItem,
                    {
                      backgroundColor: selected ? colors.accent : "transparent",
                      opacity: pressed ? 0.7 : 1,
                    },
                  ]}
                >
                  {selected && <Feather name="check" size={18} color={colors.primary} />}
                  <View style={{ flex: 1, alignItems: "flex-end" }}>
                    <Text
                      style={[
                        styles.cityItemName,
                        { color: colors.foreground, fontFamily: "IBMPlexSansArabic_600SemiBold" },
                      ]}
                    >
                      {prayerMethodLabels[m]}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            <Text
              style={[
                styles.sectionLabel,
                { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_600SemiBold" },
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
                        { color: colors.foreground, fontFamily: "IBMPlexSansArabic_600SemiBold" },
                      ]}
                    >
                      {c.name}
                    </Text>
                    <Text
                      style={[
                        styles.cityItemCountry,
                        { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_400Regular" },
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

      <NotificationsModal
        visible={showNotifModal}
        onClose={() => setShowNotifModal(false)}
      />
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
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  archRow: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  heroCenter: {
    alignItems: "center",
    paddingTop: 6,
    paddingBottom: 4,
  },
  heroPrayer: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginTop: 0,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    marginTop: 2,
    marginBottom: 8,
  },
  countdownPill: {
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingHorizontal: 18,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  countdown: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: 1.5,
    fontFamily: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "ui-monospace, SFMono-Regular, Menlo, monospace",
    }),
  },
  datesRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  dateText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
  },
  dateDot: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  heroBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 10,
  },
  heroBottomTime: { color: "#fff", fontSize: 13 },
  nextRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroBottomLabel: { color: "rgba(255,255,255,0.85)", fontSize: 11 },
  section: { marginTop: 22, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 10,
  },
  timesRow: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 4,
  },
  timeCard: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  timeName: { fontSize: 12, fontWeight: "600" },
  timeValue: { fontSize: 10 },
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

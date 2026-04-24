import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Magnetometer } from "expo-sensors";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from "react-native-svg";

import { CompassCalibration } from "@/components/CompassCalibration";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";
import { calculateDistanceToMecca, calculateQiblaBearing } from "@/lib/prayerTimes";

function angleToCompass(angle: number): string {
  const a = ((angle % 360) + 360) % 360;
  if (a < 22.5 || a >= 337.5) return "شمال";
  if (a < 67.5) return "شمال شرق";
  if (a < 112.5) return "شرق";
  if (a < 157.5) return "جنوب شرق";
  if (a < 202.5) return "جنوب";
  if (a < 247.5) return "جنوب غرب";
  if (a < 292.5) return "غرب";
  return "شمال غرب";
}

export function QiblaView() {
  const colors = useColors();
  const { effectiveLocation, requestDeviceLocation, locationStatus, useDeviceLocation } = useApp();
  const [heading, setHeading] = useState<number | null>(null);
  const [hasSensor, setHasSensor] = useState<boolean>(false);
  const [showCalibration, setShowCalibration] = useState<boolean>(false);
  const [accuracyHint, setAccuracyHint] = useState<"good" | "low">("good");
  const magBufferRef = useRef<number[]>([]);
  const alignedRef = useRef<boolean>(false);

  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    if (Platform.OS === "web") {
      setHasSensor(false);
      return;
    }
    Magnetometer.isAvailableAsync()
      .then((available) => {
        if (!available) {
          setHasSensor(false);
          return;
        }
        setHasSensor(true);
        Magnetometer.setUpdateInterval(120);
        sub = Magnetometer.addListener((data) => {
          const { x, y, z } = data;
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          setHeading(angle);
          // Track field magnitude for rough calibration check (Earth's field ~25-65 µT)
          const mag = Math.sqrt(x * x + y * y + z * z);
          const buf = magBufferRef.current;
          buf.push(mag);
          if (buf.length > 30) buf.shift();
          if (buf.length >= 15) {
            const avg = buf.reduce((s, v) => s + v, 0) / buf.length;
            const variance =
              buf.reduce((s, v) => s + (v - avg) ** 2, 0) / buf.length;
            const std = Math.sqrt(variance);
            const looksOk = avg > 15 && avg < 90 && std < 25;
            setAccuracyHint(looksOk ? "good" : "low");
          }
        });
      })
      .catch(() => setHasSensor(false));
    return () => {
      if (sub) sub.remove();
    };
  }, []);

  const qiblaBearing = useMemo(
    () => calculateQiblaBearing(effectiveLocation.latitude, effectiveLocation.longitude),
    [effectiveLocation.latitude, effectiveLocation.longitude],
  );
  const distance = useMemo(
    () => calculateDistanceToMecca(effectiveLocation.latitude, effectiveLocation.longitude),
    [effectiveLocation.latitude, effectiveLocation.longitude],
  );

  // Rotation of compass dial: -heading so North stays at top relative to device
  const dialRotation = heading !== null ? -heading : 0;
  // Kaaba marker absolute angle relative to current heading
  const kaabaAngle = heading !== null ? qiblaBearing - heading : qiblaBearing;
  const turnAmount = ((qiblaBearing - (heading ?? 0)) + 360) % 360;
  const turnDirection = turnAmount > 180 ? 360 - turnAmount : turnAmount;
  const turnSide = turnAmount > 180 ? "يساراً" : "يميناً";
  const aligned = heading !== null && Math.abs(turnDirection) < 5;

  // Haptic feedback when first aligned with qibla
  useEffect(() => {
    if (aligned && !alignedRef.current) {
      alignedRef.current = true;
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    } else if (!aligned && alignedRef.current) {
      alignedRef.current = false;
    }
  }, [aligned]);

  const onRequestLocation = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    requestDeviceLocation();
  };

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.locationBar,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Pressable
          onPress={() => setShowCalibration(true)}
          style={({ pressed }) => [
            styles.calibBtn,
            {
              backgroundColor: accuracyHint === "low" ? "#FEF3C7" : colors.accent,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather
            name={accuracyHint === "low" ? "alert-triangle" : "activity"}
            size={14}
            color={accuracyHint === "low" ? "#B45309" : colors.primary}
          />
          <Text
            style={[
              styles.calibText,
              {
                color: accuracyHint === "low" ? "#B45309" : colors.primary,
                fontFamily: "IBMPlexSansArabic_600SemiBold",
              },
            ]}
          >
            معايرة
          </Text>
        </Pressable>

        <View style={styles.locationCenter}>
          <Text
            style={[
              styles.locationName,
              { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" },
            ]}
            numberOfLines={1}
          >
            {effectiveLocation.name}
          </Text>
          {effectiveLocation.country ? (
            <Text
              style={[
                styles.locationCountry,
                { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_400Regular" },
              ]}
              numberOfLines={1}
            >
              {effectiveLocation.country}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={onRequestLocation}
          disabled={locationStatus === "requesting"}
          style={({ pressed }) => [
            styles.locBtn,
            {
              backgroundColor: useDeviceLocation ? colors.primary : colors.accent,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Feather
            name={useDeviceLocation ? "navigation-2" : "map-pin"}
            size={14}
            color={useDeviceLocation ? "#fff" : colors.primary}
          />
        </Pressable>
      </View>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderColor: aligned ? colors.success : colors.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
          القبلة
        </Text>
        <Text style={[styles.distance, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_500Medium" }]}>
          المسافة إلى مكة: {Math.round(distance).toLocaleString("ar-EG")} كم
        </Text>

        <View style={styles.compassWrap}>
          <Compass
            dialRotation={dialRotation}
            kaabaAngle={kaabaAngle}
            colors={colors}
            aligned={aligned}
          />
        </View>

        <Text style={[styles.angle, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
          {Math.round(qiblaBearing)}°
        </Text>
        <Text style={[styles.angleLabel, { color: aligned ? colors.success : colors.mutedForeground, fontFamily: "IBMPlexSansArabic_500Medium" }]}>
          {hasSensor && heading !== null
            ? aligned
              ? "أنت متجه نحو القبلة الآن ✓"
              : `استدر ${Math.round(turnDirection)}° ${turnSide} نحو القبلة`
            : `اتجاه القبلة من ${effectiveLocation.name}: ${angleToCompass(qiblaBearing)}`}
        </Text>

        {accuracyHint === "low" && hasSensor && (
          <Pressable
            onPress={() => setShowCalibration(true)}
            style={({ pressed }) => [
              styles.warning,
              { backgroundColor: "#FEF3C7", opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Feather name="alert-triangle" size={14} color="#B45309" />
            <Text
              style={[styles.warningText, { color: "#B45309", fontFamily: "IBMPlexSansArabic_500Medium" }]}
            >
              قراءة البوصلة غير مستقرة. اضغط للمعايرة.
            </Text>
          </Pressable>
        )}

        {!hasSensor && (
          <View style={[styles.notice, { backgroundColor: colors.accent }]}>
            <Feather name="info" size={14} color={colors.primary} />
            <Text
              style={[
                styles.noticeText,
                { color: colors.accentForeground, fontFamily: "IBMPlexSansArabic_500Medium" },
              ]}
            >
              {Platform.OS === "web"
                ? "البوصلة غير متاحة في المتصفح. افتح التطبيق على الجوال لتحديد القبلة."
                : "البوصلة غير متوفرة على هذا الجهاز. الزاوية المعروضة من الشمال الجغرافي."}
            </Text>
          </View>
        )}
      </View>

      <View
        style={[
          styles.tipCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.tipRow}>
          <View style={[styles.tipIcon, { backgroundColor: colors.accent }]}>
            <Feather name="navigation" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={[styles.tipTitle, { color: colors.foreground, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
              نصائح لاستخدام البوصلة
            </Text>
            <Text style={[styles.tipText, { color: colors.mutedForeground, fontFamily: "IBMPlexSansArabic_400Regular" }]}>
              ضع جهازك أفقياً، وابتعد عن المعادن. لو كانت القراءة غير دقيقة شغّل المعايرة على شكل ٨.
            </Text>
          </View>
        </View>
      </View>

      <CompassCalibration
        visible={showCalibration}
        onClose={() => {
          setShowCalibration(false);
          // Reset accuracy buffer after calibration so it re-evaluates
          magBufferRef.current = [];
          setAccuracyHint("good");
        }}
      />
    </ScrollView>
  );
}

function Compass({
  dialRotation,
  kaabaAngle,
  colors,
  aligned,
}: {
  dialRotation: number;
  kaabaAngle: number;
  colors: ReturnType<typeof useColors>;
  aligned: boolean;
}) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const labelR = r - 28;

  const cardinals = [
    { label: "N", angle: 0 },
    { label: "E", angle: 90 },
    { label: "S", angle: 180 },
    { label: "W", angle: 270 },
  ];

  const ticks = Array.from({ length: 24 }, (_, i) => i * 15);

  // Kaaba position
  const angleRad = ((kaabaAngle - 90) * Math.PI) / 180;
  const kx = cx + Math.cos(angleRad) * (r - 6);
  const ky = cy + Math.sin(angleRad) * (r - 6);

  const ringColor = aligned ? colors.success : colors.primary;

  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cy} r={r + 6} fill={colors.card} stroke={ringColor} strokeWidth={aligned ? 2 : 1} opacity={aligned ? 0.6 : 1} />
      <Circle cx={cx} cy={cy} r={r - 14} fill="transparent" stroke={colors.border} strokeWidth={1} />

      {/* Pointer (top arrow) */}
      <Polygon
        points={`${cx},${cy - r - 2} ${cx - 8},${cy - r + 12} ${cx + 8},${cy - r + 12}`}
        fill={ringColor}
        opacity={0.85}
      />

      <G rotation={dialRotation} origin={`${cx}, ${cy}`}>
        {ticks.map((t) => {
          const rad = ((t - 90) * Math.PI) / 180;
          const isCardinal = t % 90 === 0;
          const inner = r - (isCardinal ? 16 : 8);
          const x1 = cx + Math.cos(rad) * inner;
          const y1 = cy + Math.sin(rad) * inner;
          const x2 = cx + Math.cos(rad) * r;
          const y2 = cy + Math.sin(rad) * r;
          return (
            <Line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={colors.border}
              strokeWidth={isCardinal ? 2 : 1}
            />
          );
        })}

        {cardinals.map((c) => {
          const rad = ((c.angle - 90) * Math.PI) / 180;
          const tx = cx + Math.cos(rad) * labelR;
          const ty = cy + Math.sin(rad) * labelR;
          const isNorth = c.label === "N";
          return (
            <SvgText
              key={c.label}
              x={tx}
              y={ty + 5}
              fontSize={isNorth ? 18 : 16}
              fontWeight="700"
              fill={isNorth ? colors.primary : colors.foreground}
              textAnchor="middle"
            >
              {c.label}
            </SvgText>
          );
        })}

        {[45, 135, 225, 315].map((a) => {
          const rad = ((a - 90) * Math.PI) / 180;
          const px = cx + Math.cos(rad) * (labelR - 18);
          const py = cy + Math.sin(rad) * (labelR - 18);
          return (
            <Circle key={a} cx={px} cy={py} r={4} fill={colors.primary} opacity={0.7} />
          );
        })}

        {/* Kaaba marker */}
        <G>
          <Circle cx={kx} cy={ky} r={20} fill="#fff" stroke={ringColor} strokeWidth={2.5} />
          <SvgText
            x={kx}
            y={ky + 6}
            fontSize={20}
            textAnchor="middle"
            fill="#000"
          >
            🕋
          </SvgText>
        </G>
      </G>

      <Circle cx={cx} cy={cy} r={20} fill={ringColor} />
      <Circle cx={cx} cy={cy} r={6} fill="#fff" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  calibBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
  },
  calibText: { fontSize: 12 },
  locationCenter: { flex: 1, alignItems: "center" },
  locationName: { fontSize: 14, textAlign: "center" },
  locationCountry: { fontSize: 11, marginTop: 1, textAlign: "center" },
  locBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    marginHorizontal: 16,
    marginTop: 10,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: "700" },
  distance: { fontSize: 13, marginTop: 4 },
  compassWrap: { marginTop: 16, marginBottom: 8 },
  angle: { fontSize: 36, fontWeight: "700", marginTop: 8 },
  angleLabel: { fontSize: 13, marginTop: 4, textAlign: "center" },
  warning: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 14,
    width: "100%",
  },
  warningText: { flex: 1, fontSize: 12, textAlign: "right" },
  notice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginTop: 14,
    width: "100%",
  },
  noticeText: { flex: 1, fontSize: 12, textAlign: "right" },
  tipCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: { fontSize: 14, fontWeight: "700", textAlign: "right" },
  tipText: { fontSize: 12, marginTop: 2, textAlign: "right", lineHeight: 20 },
});

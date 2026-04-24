import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgLinear, Path, Stop } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

type Props = {
  visible: boolean;
  onClose: () => void;
};

const SIZE = 240;
const SCALE = 80; // half-width of figure-8

function buildFigureEightPath(): string {
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const points: string[] = [];
  const steps = 200;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * 2 * Math.PI;
    const x = cx + SCALE * Math.sin(t);
    const y = cy + (SCALE * 0.7) * Math.sin(2 * t);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return `M ${points.join(" L ")}`;
}

const FIG8_PATH = buildFigureEightPath();

export function CompassCalibration({ visible, onClose }: Props) {
  const colors = useColors();
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const lapsRef = useRef<number>(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setT(0);
    setDone(false);
    lapsRef.current = 0;
    startRef.current = Date.now();
    let prev = 0;
    const loop = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      // 4 seconds per full figure-8 cycle
      const tt = (elapsed / 4) * 2 * Math.PI;
      setT(tt);
      const cycle = Math.floor(elapsed / 4);
      if (cycle > prev) {
        prev = cycle;
        lapsRef.current = cycle;
      }
      if (elapsed >= 12) {
        setDone(true);
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [visible]);

  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const px = cx + SCALE * Math.sin(t);
  const py = cy + SCALE * 0.7 * Math.sin(2 * t);
  const lapPercent = Math.min(100, Math.round(((Date.now() - startRef.current) / 12000) * 100));

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={styles.headerRow}>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Feather name="x" size={22} color={colors.foreground} />
            </Pressable>
            <Text style={[styles.title, { color: colors.foreground, fontFamily: "Cairo_700Bold" }]}>
              معايرة البوصلة
            </Text>
            <View style={{ width: 32 }} />
          </View>

          <Text
            style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: "Cairo_500Medium" }]}
          >
            حرّك جهازك في الهواء على شكل الرقم ٨
            {"\n"}عدة مرات لمعايرة الحساس المغناطيسي
          </Text>

          <View style={[styles.svgWrap, { backgroundColor: colors.background }]}>
            <Svg width={SIZE} height={SIZE}>
              <Defs>
                <SvgLinear id="trail" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={colors.primary} stopOpacity="0.25" />
                  <Stop offset="1" stopColor={colors.primaryLight} stopOpacity="0.45" />
                </SvgLinear>
              </Defs>

              <Path
                d={FIG8_PATH}
                stroke={colors.border}
                strokeWidth={2}
                strokeDasharray="4 6"
                fill="none"
                strokeLinecap="round"
              />
              <Path
                d={FIG8_PATH}
                stroke="url(#trail)"
                strokeWidth={6}
                fill="none"
                strokeLinecap="round"
                opacity={0.6}
              />

              {/* Centered phone hint icon */}
              <Circle cx={cx} cy={cy} r={4} fill={colors.mutedForeground} opacity={0.3} />

              {/* Moving dot — represents the phone */}
              <Circle cx={px} cy={py} r={18} fill={colors.primary} opacity={0.18} />
              <Circle cx={px} cy={py} r={11} fill={colors.primary} />
              <Circle cx={px} cy={py} r={4} fill="#fff" />
            </Svg>
          </View>

          <View style={styles.progressWrap}>
            <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
              <LinearGradient
                colors={[colors.primaryLight, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${lapPercent}%` }]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.mutedForeground, fontFamily: "Cairo_500Medium" }]}>
              {done ? "اكتملت المعايرة" : "جارٍ المعايرة..."}
            </Text>
          </View>

          <View style={styles.tipsBox}>
            <View style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text
                style={[styles.tipText, { color: colors.foreground, fontFamily: "Cairo_400Regular" }]}
              >
                ابتعد عن الأجهزة الإلكترونية والمعادن
              </Text>
            </View>
            <View style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text
                style={[styles.tipText, { color: colors.foreground, fontFamily: "Cairo_400Regular" }]}
              >
                حرّك الجهاز ببطء على شكل ∞ لمدة 10 ثوان
              </Text>
            </View>
            <View style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text
                style={[styles.tipText, { color: colors.foreground, fontFamily: "Cairo_400Regular" }]}
              >
                كرّر العملية إذا كانت قراءة البوصلة غير دقيقة
              </Text>
            </View>
          </View>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }]}
          >
            <LinearGradient
              colors={done ? ["#10B981", "#059669"] : [colors.primaryLight, colors.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.confirmBtn}
            >
              <Feather name={done ? "check" : "compass"} size={16} color="#fff" />
              <Text style={[styles.confirmText, { fontFamily: "Cairo_700Bold" }]}>
                {done ? "تمّت المعايرة" : "تخطّي والعودة للبوصلة"}
              </Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 28,
    padding: 18,
    shadowColor: "#0F172A",
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, flex: 1, textAlign: "center" },
  subtitle: { fontSize: 13, textAlign: "center", marginTop: 6, lineHeight: 22 },
  svgWrap: {
    alignSelf: "center",
    borderRadius: 24,
    padding: 8,
    marginVertical: 14,
  },
  progressWrap: { gap: 6, marginBottom: 14 },
  progressTrack: { height: 6, borderRadius: 99, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99 },
  progressText: { fontSize: 12, textAlign: "center" },
  tipsBox: { gap: 8, marginBottom: 14 },
  tipRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  tipDot: { width: 6, height: 6, borderRadius: 3 },
  tipText: { fontSize: 12, flex: 1, textAlign: "right" },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
  },
  confirmText: { color: "#fff", fontSize: 14 },
});

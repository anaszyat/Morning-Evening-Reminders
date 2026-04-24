import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { StarPattern } from "@/components/StarPattern";
import { useApp } from "@/contexts/AppContext";

export function HeroProgress() {
  const { totalCompletedToday, totalAdhkar, overallPercent } = useApp();
  const size = 110;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (overallPercent / 100) * c;

  return (
    <View style={styles.shadow}>
      <LinearGradient
        colors={["#1E40AF", "#1E3A8A", "#172554"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <StarPattern color="#ffffff" opacity={0.06} />
        <View style={styles.row}>
          <View style={styles.right}>
            <Text style={[styles.salam, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>
              السلام عليكم
            </Text>
            <Text style={[styles.headline, { fontFamily: "IBMPlexSansArabic_700Bold" }]}>
              ابدأ يومك بذكر الله
            </Text>
            <Text style={[styles.sub, { fontFamily: "IBMPlexSansArabic_500Medium" }]}>
              أكملت <Text style={styles.subBold}>{totalCompletedToday}</Text> من{" "}
              <Text style={styles.subBold}>{totalAdhkar}</Text> ذكرًا
            </Text>
          </View>
          <View style={[styles.ringWrap, { width: size, height: size }]}>
            <Svg width={size} height={size}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke="rgba(255,255,255,0.18)"
                strokeWidth={stroke}
                fill="none"
              />
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke="#93C5FD"
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${c} ${c}`}
                strokeDashoffset={offset}
                strokeLinecap="round"
                rotation={-90}
                origin={`${size / 2}, ${size / 2}`}
              />
            </Svg>
            <View style={styles.ringCenter} pointerEvents="none">
              <Text style={[styles.percent, { fontFamily: "IBMPlexSansArabic_700Bold" }]}>
                {overallPercent}%
              </Text>
              <Text style={[styles.percentLabel, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>
                إنجاز اليوم
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: "#1E3A8A",
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    borderRadius: 26,
  },
  card: {
    borderRadius: 26,
    paddingHorizontal: 22,
    paddingVertical: 24,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  right: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 12,
  },
  salam: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginBottom: 6,
    textAlign: "right",
  },
  headline: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "right",
    marginBottom: 8,
  },
  sub: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    textAlign: "right",
  },
  subBold: {
    color: "#93C5FD",
    fontWeight: "700",
  },
  ringWrap: {
    alignItems: "center",
    justifyContent: "center",
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
  percent: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  percentLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    marginTop: 2,
  },
});

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useApp } from "@/contexts/AppContext";
import { ensureNotificationPermission } from "@/lib/notifications";

const NAVY = "#1a2a6c";
const GOLD = "#f4c542";

type Step = {
  icon: keyof typeof Feather.glyphMap;
  iconBg: string;
  title: string;
  description: string;
  allowLabel: string;
  onAllow: () => Promise<void>;
};

type Props = {
  onDone: () => void;
};

export function OnboardingPermissions({ onDone }: Props) {
  const { requestDeviceLocation } = useApp();
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const steps: Step[] = [
    {
      icon: "map-pin",
      iconBg: "#0EA5E9",
      title: "الوصول إلى موقعك",
      description:
        "يحتاج التطبيق إلى موقعك لتحديد اتجاه القبلة وحساب مواقيت الصلاة الدقيقة لمنطقتك.",
      allowLabel: "اسمح بالموقع",
      onAllow: async () => {
        await requestDeviceLocation();
      },
    },
    {
      icon: "bell",
      iconBg: "#8B5CF6",
      title: "تنبيهات مواقيت الصلاة",
      description:
        "احصل على تذكير عند دخول وقت كل صلاة حتى لا تفوتك.",
      allowLabel: "اسمح بالإشعارات",
      onAllow: async () => {
        await ensureNotificationPermission();
      },
    },
  ];

  const animateOut = (cb: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -30, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      cb();
      slideAnim.setValue(40);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();
    });
  };

  const advance = () => {
    if (stepIndex < steps.length - 1) {
      animateOut(() => setStepIndex((i) => i + 1));
    } else {
      animateOut(onDone);
    }
  };

  const handleAllow = async () => {
    setLoading(true);
    try {
      await steps[stepIndex].onAllow();
    } catch {
      // ignore — we advance regardless
    } finally {
      setLoading(false);
      advance();
    }
  };

  const step = steps[stepIndex];

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[NAVY, "#2d4299"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTop]} />
      <View style={[styles.circle, styles.circleBottom]} />

      {/* Progress dots */}
      <View style={styles.dotsRow}>
        {steps.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === stepIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>

      {/* Card */}
      <Animated.View
        style={[
          styles.card,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Icon circle */}
        <View style={[styles.iconCircle, { backgroundColor: step.iconBg + "22", borderColor: step.iconBg + "44" }]}>
          <View style={[styles.iconInner, { backgroundColor: step.iconBg }]}>
            <Feather name={step.icon} size={32} color="#fff" />
          </View>
        </View>

        {/* Text */}
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>

        {/* Buttons */}
        <Pressable
          onPress={handleAllow}
          disabled={loading}
          style={({ pressed }) => [styles.primaryBtn, { opacity: pressed || loading ? 0.8 : 1 }]}
        >
          <LinearGradient
            colors={[GOLD, "#e6b800"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryBtnInner}
          >
            <Feather name={loading ? "loader" : "check-circle"} size={18} color={NAVY} />
            <Text style={styles.primaryBtnText}>
              {loading ? "جارٍ التحقق..." : step.allowLabel}
            </Text>
          </LinearGradient>
        </Pressable>

        <Pressable
          onPress={advance}
          disabled={loading}
          style={({ pressed }) => [styles.skipBtn, { opacity: pressed ? 0.6 : 1 }]}
        >
          <Text style={styles.skipText}>تخطي الآن</Text>
        </Pressable>
      </Animated.View>

      {/* Footer note */}
      <Text style={styles.footer}>
        يمكنك تغيير الأذونات لاحقاً من إعدادات الجهاز
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  circle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  circleTop: {
    width: 340,
    height: 340,
    top: -120,
    right: -80,
  },
  circleBottom: {
    width: 260,
    height: 260,
    bottom: -80,
    left: -60,
  },

  dotsRow: {
    position: "absolute",
    top: Platform.OS === "web" ? 48 : 60,
    flexDirection: "row",
    gap: 8,
    alignSelf: "center",
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: GOLD,
  },
  dotInactive: {
    width: 8,
    backgroundColor: "rgba(255,255,255,0.3)",
  },

  card: {
    width: "88%",
    maxWidth: 380,
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    gap: 0,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },

  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize: 20,
    color: NAVY,
    fontFamily: "IBMPlexSansArabic_700Bold",
    textAlign: "center",
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: "#555",
    fontFamily: "IBMPlexSansArabic_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },

  primaryBtn: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  primaryBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
  },
  primaryBtnText: {
    fontSize: 15,
    color: NAVY,
    fontFamily: "IBMPlexSansArabic_700Bold",
  },

  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  skipText: {
    fontSize: 13,
    color: "#999",
    fontFamily: "IBMPlexSansArabic_400Regular",
    textDecorationLine: "underline",
  },

  footer: {
    position: "absolute",
    bottom: Platform.OS === "web" ? 32 : 44,
    fontSize: 12,
    color: "rgba(255,255,255,0.45)",
    fontFamily: "IBMPlexSansArabic_400Regular",
    textAlign: "center",
    paddingHorizontal: 32,
  },
});

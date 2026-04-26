import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G, Path, Rect, Text as SvgText } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

const NAVY = "#1a2a6c";
const CYAN = "#4fc3f7";
const GOLD = "#f4c542";
const GREEN = "#4caf50";
const BG = "#eef2f8";

const statsData = {
  total: 12847,
  streak: 14,
  bestStreak: 21,
  todaySessions: 3,
  todayTotal: 450,
  topDhikr: { name: "سبحان الله", count: 4230 },
  weekly: [320, 450, 280, 600, 390, 500, 450],
  breakdown: [
    { name: "سبحان الله", count: 4230, color: CYAN },
    { name: "الحمد لله", count: 3180, color: GOLD },
    { name: "الله أكبر", count: 2890, color: NAVY },
    { name: "لا إله إلا الله", count: 1547, color: GREEN },
    { name: "أذكار أخرى", count: 1000, color: "#9E9E9E" },
  ],
  sessions: [
    { dhikr: "سبحان الله", count: 100, duration: "3 دقائق", date: "اليوم 10:30 ص", done: true },
    { dhikr: "الحمد لله", count: 100, duration: "4 دقائق", date: "اليوم 8:15 ص", done: true },
    { dhikr: "الله أكبر", count: 67, duration: "2 دقيقة", date: "أمس 9:00 م", done: false },
    { dhikr: "لا إله إلا الله", count: 100, duration: "6 دقائق", date: "أمس 7:30 م", done: true },
    { dhikr: "سبحان الله", count: 100, duration: "3 دقائق", date: "الثلاثاء", done: true },
  ],
  heatmap: [
    0, 120, 340, 80, 0, 210, 450, 600, 180, 300,
    520, 0, 90, 400, 270, 0, 350, 480, 130, 0,
    200, 310, 560, 0, 420, 180, 60, 300, 0, 450,
  ],
  goals: [
    { name: "سبحان الله", target: 100, done: 78, color: CYAN },
    { name: "الحمد لله", target: 100, done: 100, color: GOLD },
    { name: "الله أكبر", target: 33, done: 20, color: NAVY },
  ],
  records: {
    bestDay: { date: "الجمعة 15 رمضان", count: 1240 },
    longestSession: { duration: "47 دقيقة", since: "منذ 3 أيام" },
    bestMonth: { month: "رمضان 1446", count: 18300 },
  },
};

const QUOTES = [
  { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", ref: "سورة الرعد: 28" },
  { text: "وَاذْكُرُوا اللَّهَ كَثِيرًا لَعَلَّكُمْ تُفْلِحُونَ", ref: "سورة الجمعة: 10" },
  { text: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", ref: "سورة البقرة: 152" },
];

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start: number | null = null;
    let raf: number;
    const step = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(progress * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function SectionTitle({ title, colors }: { title: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={sStyles.sectionTitleRow}>
      <View style={[sStyles.sectionAccent, { backgroundColor: GOLD }]} />
      <Text style={[sStyles.sectionTitle, { color: NAVY, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
        {title}
      </Text>
    </View>
  );
}

function HeroCard({
  icon, label, value, subtext, accent,
}: { icon: string; label: string; value: string; subtext: string; accent: string }) {
  return (
    <View style={[sStyles.heroCard, { borderLeftColor: accent }]}>
      <Text style={sStyles.heroIcon}>{icon}</Text>
      <Text style={[sStyles.heroValue, { color: NAVY, fontFamily: "IBMPlexSansArabic_700Bold" }]} numberOfLines={1}>
        {value}
      </Text>
      <Text style={[sStyles.heroLabel, { color: NAVY, fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
        {label}
      </Text>
      <Text style={[sStyles.heroSub, { color: "#666", fontFamily: "IBMPlexSansArabic_400Regular" }]}>
        {subtext}
      </Text>
    </View>
  );
}

function WeeklyChart({ colors }: { colors: ReturnType<typeof useColors> }) {
  const data = statsData.weekly;
  const max = Math.max(...data);
  const W = 340;
  const H = 150;
  const barW = 32;
  const gap = (W - data.length * barW) / (data.length + 1);
  const todayIdx = new Date().getDay();

  return (
    <View style={sStyles.chartCard}>
      <View style={sStyles.navyCard}>
        <Svg width={W} height={H + 30}>
          {data.map((v, i) => {
            const barH = max > 0 ? (v / max) * H : 0;
            const x = gap + i * (barW + gap);
            const y = H - barH;
            const isToday = i === todayIdx;
            return (
              <G key={i}>
                <Rect
                  x={x}
                  y={y}
                  width={barW}
                  height={barH}
                  rx={6}
                  fill={isToday ? GOLD : CYAN}
                  opacity={0.9}
                />
                <SvgText
                  x={x + barW / 2}
                  y={H + 18}
                  fontSize={9}
                  fill="#CBD5E1"
                  textAnchor="middle"
                >
                  {DAYS_AR[i].slice(0, 3)}
                </SvgText>
              </G>
            );
          })}
        </Svg>
      </View>
    </View>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlice(cx: number, cy: number, outerR: number, innerR: number, start: number, end: number) {
  const s1 = polarToCartesian(cx, cy, outerR, start);
  const e1 = polarToCartesian(cx, cy, outerR, end);
  const s2 = polarToCartesian(cx, cy, innerR, end);
  const e2 = polarToCartesian(cx, cy, innerR, start);
  const large = end - start > 180 ? 1 : 0;
  return `M ${s1.x} ${s1.y} A ${outerR} ${outerR} 0 ${large} 1 ${e1.x} ${e1.y} L ${s2.x} ${s2.y} A ${innerR} ${innerR} 0 ${large} 0 ${e2.x} ${e2.y} Z`;
}

function DonutChart() {
  const data = statsData.breakdown;
  const total = data.reduce((s, d) => s + d.count, 0);
  const CX = 110;
  const CY = 110;
  const outerR = 90;
  const innerR = 58;
  let currentAngle = -90;

  return (
    <View style={sStyles.donutWrap}>
      <Svg width={220} height={220}>
        {data.map((item, i) => {
          const sweep = (item.count / total) * 360;
          const path = donutSlice(CX, CY, outerR, innerR, currentAngle, currentAngle + sweep - 1.5);
          currentAngle += sweep;
          return <Path key={i} d={path} fill={item.color} />;
        })}
        <SvgText x={CX} y={CY - 10} textAnchor="middle" fontSize={22} fontWeight="bold" fill={NAVY}>
          {(total / 1000).toFixed(1)}k
        </SvgText>
        <SvgText x={CX} y={CY + 14} textAnchor="middle" fontSize={11} fill="#666">
          ذكر إجمالي
        </SvgText>
      </Svg>
      <View style={sStyles.legend}>
        {data.map((item, i) => (
          <View key={i} style={sStyles.legendRow}>
            <Text style={[sStyles.legendCount, { fontFamily: "IBMPlexSansArabic_500Medium", color: "#555" }]}>
              {item.count.toLocaleString()}
            </Text>
            <Text style={[sStyles.legendName, { fontFamily: "IBMPlexSansArabic_400Regular", color: "#333" }]}>
              {item.name}
            </Text>
            <View style={[sStyles.legendDot, { backgroundColor: item.color }]} />
          </View>
        ))}
      </View>
    </View>
  );
}

function SessionTable() {
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all");
  const tabs = [
    { key: "all" as const, label: "الكل" },
    { key: "today" as const, label: "اليوم" },
    { key: "week" as const, label: "الأسبوع" },
    { key: "month" as const, label: "الشهر" },
  ];
  const filtered = statsData.sessions.filter((s) => {
    if (filter === "today") return s.date.startsWith("اليوم");
    if (filter === "week") return s.date.startsWith("اليوم") || s.date.startsWith("أمس") || s.date.startsWith("الثلاثاء");
    return true;
  });

  return (
    <View>
      <View style={sStyles.filterRow}>
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setFilter(t.key)}
            style={[sStyles.filterTab, filter === t.key && sStyles.filterTabActive]}
          >
            <Text
              style={[
                sStyles.filterLabel,
                { fontFamily: "IBMPlexSansArabic_600SemiBold" },
                filter === t.key ? { color: "#fff" } : { color: NAVY },
              ]}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={sStyles.table}>
          <View style={[sStyles.tableRow, sStyles.tableHeader]}>
            {["الذكر", "العدد", "المدة", "التاريخ", "الحالة"].map((h) => (
              <Text key={h} style={[sStyles.thCell, { fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
                {h}
              </Text>
            ))}
          </View>
          {filtered.map((s, i) => (
            <View key={i} style={[sStyles.tableRow, i % 2 === 0 ? sStyles.rowEven : sStyles.rowOdd]}>
              <Text style={[sStyles.tdCell, { fontFamily: "IBMPlexSansArabic_500Medium", color: NAVY }]}>
                {s.dhikr}
              </Text>
              <Text style={[sStyles.tdCell, { fontFamily: "IBMPlexSansArabic_400Regular", color: "#333" }]}>
                {s.count}
              </Text>
              <Text style={[sStyles.tdCell, { fontFamily: "IBMPlexSansArabic_400Regular", color: "#333" }]}>
                {s.duration}
              </Text>
              <Text style={[sStyles.tdCell, { fontFamily: "IBMPlexSansArabic_400Regular", color: "#666" }]}>
                {s.date}
              </Text>
              <View style={[sStyles.badge, { backgroundColor: s.done ? GREEN + "22" : "#9E9E9E22" }]}>
                <Text style={[sStyles.badgeText, { color: s.done ? GREEN : "#9E9E9E", fontFamily: "IBMPlexSansArabic_500Medium" }]}>
                  {s.done ? "✅ مكتمل" : "⏸ غير مكتمل"}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Heatmap() {
  const data = statsData.heatmap;
  function cellColor(v: number) {
    if (v === 0) return "#e0e0e0";
    if (v <= 100) return "#b3e5fc";
    if (v <= 300) return CYAN;
    if (v <= 500) return "#0288d1";
    return GOLD;
  }
  const cols = 6;
  return (
    <View>
      <View style={sStyles.heatGrid}>
        {data.map((v, i) => (
          <View key={i} style={[sStyles.heatCell, { backgroundColor: cellColor(v) }]}>
            <Text style={sStyles.heatDay}>{i + 1}</Text>
          </View>
        ))}
      </View>
      <View style={sStyles.heatLegend}>
        <Text style={[sStyles.heatLegendLabel, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>أقل</Text>
        {["#e0e0e0", "#b3e5fc", CYAN, "#0288d1", GOLD].map((c, i) => (
          <View key={i} style={[sStyles.heatLegendCell, { backgroundColor: c }]} />
        ))}
        <Text style={[sStyles.heatLegendLabel, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>أكثر</Text>
      </View>
    </View>
  );
}

function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct, duration: 1200, useNativeDriver: false }).start();
  }, [pct]);
  return (
    <View style={sStyles.barTrack}>
      <Animated.View
        style={[
          sStyles.barFill,
          { backgroundColor: color, width: anim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }) },
        ]}
      />
    </View>
  );
}

export function StatsView() {
  const colors = useColors();
  const totalVal = useCountUp(statsData.total);
  const todayTotal = useCountUp(statsData.todayTotal, 1200);
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[sStyles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[sStyles.pageTitle, { color: NAVY, fontFamily: "IBMPlexSansArabic_700Bold" }]}>إحصائياتي</Text>
      <Text style={[sStyles.pageSub, { color: "#666", fontFamily: "IBMPlexSansArabic_400Regular" }]}>
        تتبع رحلتك الروحية
      </Text>

      {/* SECTION 1: Hero Cards */}
      <View style={sStyles.heroGrid}>
        <HeroCard
          icon="📿"
          label="إجمالي الأذكار"
          value={totalVal.toLocaleString()}
          subtext="منذ بداية الاستخدام"
          accent={CYAN}
        />
        <HeroCard
          icon="🔥"
          label="أيام متواصلة"
          value={`${statsData.streak}`}
          subtext={`أعلى سلسلة: ${statsData.bestStreak} يوم`}
          accent={GOLD}
        />
        <HeroCard
          icon="☀️"
          label="جلسات اليوم"
          value={`${statsData.todaySessions}`}
          subtext={`إجمالي اليوم: ${todayTotal}`}
          accent={GREEN}
        />
        <HeroCard
          icon="⭐"
          label="أكثر ذكر"
          value={statsData.topDhikr.name}
          subtext={`${statsData.topDhikr.count.toLocaleString()} مرة`}
          accent={NAVY}
        />
      </View>

      {/* SECTION 2: Weekly Chart */}
      <SectionTitle title="نشاط الأسبوع" colors={colors} />
      <WeeklyChart colors={colors} />

      {/* SECTION 3: Donut Chart */}
      <SectionTitle title="توزيع الأذكار" colors={colors} />
      <View style={sStyles.whiteCard}>
        <DonutChart />
      </View>

      {/* SECTION 4: Session Table */}
      <SectionTitle title="سجل جلسات المسبحة" colors={colors} />
      <View style={sStyles.whiteCard}>
        <SessionTable />
      </View>

      {/* SECTION 5: Heatmap */}
      <SectionTitle title="خريطة النشاط الشهري" colors={colors} />
      <View style={sStyles.whiteCard}>
        <Heatmap />
      </View>

      {/* SECTION 6: Records */}
      <SectionTitle title="أرقامي القياسية" colors={colors} />
      <View style={sStyles.recordsRow}>
        <View style={[sStyles.recordCard, { backgroundColor: NAVY }]}>
          <Text style={sStyles.recordIcon}>🏆</Text>
          <Text style={[sStyles.recordLabel, { fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>أفضل يوم</Text>
          <Text style={[sStyles.recordVal, { fontFamily: "IBMPlexSansArabic_700Bold" }]}>
            {statsData.records.bestDay.count.toLocaleString()} ذكر
          </Text>
          <Text style={[sStyles.recordSub, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>
            {statsData.records.bestDay.date}
          </Text>
        </View>
        <View style={[sStyles.recordCard, { backgroundColor: NAVY }]}>
          <Text style={sStyles.recordIcon}>⚡</Text>
          <Text style={[sStyles.recordLabel, { fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>أطول جلسة</Text>
          <Text style={[sStyles.recordVal, { fontFamily: "IBMPlexSansArabic_700Bold" }]}>
            {statsData.records.longestSession.duration}
          </Text>
          <Text style={[sStyles.recordSub, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>
            {statsData.records.longestSession.since}
          </Text>
        </View>
        <View style={[sStyles.recordCard, { backgroundColor: NAVY }]}>
          <Text style={sStyles.recordIcon}>📅</Text>
          <Text style={[sStyles.recordLabel, { fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>أكثر شهر</Text>
          <Text style={[sStyles.recordVal, { fontFamily: "IBMPlexSansArabic_700Bold" }]}>
            {(statsData.records.bestMonth.count / 1000).toFixed(1)}k ذكر
          </Text>
          <Text style={[sStyles.recordSub, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>
            {statsData.records.bestMonth.month}
          </Text>
        </View>
      </View>

      {/* SECTION 7: Goals */}
      <SectionTitle title="أهدافي اليومية" colors={colors} />
      <View style={sStyles.whiteCard}>
        {statsData.goals.map((g, i) => {
          const pct = Math.round((g.done / g.target) * 100);
          return (
            <View key={i} style={sStyles.goalRow}>
              <View style={sStyles.goalHeader}>
                <View style={sStyles.goalMeta}>
                  <Text style={[sStyles.goalPct, { color: g.color, fontFamily: "IBMPlexSansArabic_700Bold" }]}>
                    {pct}%
                  </Text>
                  {pct >= 100 && (
                    <View style={[sStyles.doneBadge, { backgroundColor: GOLD + "33" }]}>
                      <Text style={[sStyles.doneBadgeText, { color: GOLD }]}>✅ مكتمل!</Text>
                    </View>
                  )}
                </View>
                <View style={sStyles.goalTitleRow}>
                  <Text style={[sStyles.goalCount, { color: "#888", fontFamily: "IBMPlexSansArabic_400Regular" }]}>
                    {g.done} / {g.target}
                  </Text>
                  <Text style={[sStyles.goalName, { color: NAVY, fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>
                    {g.name}
                  </Text>
                </View>
              </View>
              <AnimatedBar pct={Math.min(pct, 100)} color={g.color} />
            </View>
          );
        })}
      </View>

      {/* SECTION 8: Motivational Footer */}
      <View style={[sStyles.footerCard, { backgroundColor: NAVY }]}>
        <Text style={sStyles.footerStar}>⭐</Text>
        <Text style={[sStyles.footerText, { fontFamily: "IBMPlexSansArabic_700Bold" }]}>
          {`"${quote.text}"`}
        </Text>
        <Text style={[sStyles.footerRef, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>
          {quote.ref}
        </Text>
      </View>
    </ScrollView>
  );
}

const sStyles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingBottom: 100 },
  pageTitle: { fontSize: 22, textAlign: "right", marginTop: 12 },
  pageSub: { fontSize: 13, textAlign: "right", marginBottom: 20 },

  sectionTitleRow: { flexDirection: "row-reverse", alignItems: "center", gap: 8, marginTop: 28, marginBottom: 14 },
  sectionAccent: { width: 4, height: 22, borderRadius: 2 },
  sectionTitle: { fontSize: 17 },

  heroGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 12 },
  heroCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    alignItems: "flex-end",
  },
  heroIcon: { fontSize: 26, marginBottom: 6 },
  heroValue: { fontSize: 20 },
  heroLabel: { fontSize: 13, marginTop: 4 },
  heroSub: { fontSize: 11, marginTop: 4, textAlign: "right" },

  chartCard: { borderRadius: 18, overflow: "hidden" },
  navyCard: {
    backgroundColor: NAVY,
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
  },

  whiteCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  donutWrap: { alignItems: "center", gap: 16 },
  legend: { width: "100%", gap: 8 },
  legendRow: { flexDirection: "row-reverse", alignItems: "center", gap: 10 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendName: { flex: 1, textAlign: "right", fontSize: 13 },
  legendCount: { fontSize: 13, color: "#555" },

  filterRow: { flexDirection: "row-reverse", gap: 8, marginBottom: 14 },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#eef2f8",
  },
  filterTabActive: { backgroundColor: NAVY },
  filterLabel: { fontSize: 13 },

  table: { minWidth: 400 },
  tableRow: { flexDirection: "row-reverse", alignItems: "center", paddingVertical: 10, paddingHorizontal: 8 },
  tableHeader: { backgroundColor: NAVY, borderRadius: 10 },
  rowEven: { backgroundColor: "#f8faff" },
  rowOdd: { backgroundColor: "#fff" },
  thCell: { flex: 1, color: "#fff", fontSize: 12, textAlign: "center" },
  tdCell: { flex: 1, fontSize: 12, textAlign: "center" },
  badge: { flex: 1, borderRadius: 12, paddingVertical: 4, paddingHorizontal: 6, alignItems: "center" },
  badgeText: { fontSize: 11 },

  heatGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: 4 },
  heatCell: {
    width: "14.5%",
    aspectRatio: 1,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  heatDay: { fontSize: 9, color: "#fff", fontWeight: "bold" },
  heatLegend: { flexDirection: "row-reverse", alignItems: "center", gap: 6, marginTop: 10 },
  heatLegendCell: { width: 18, height: 18, borderRadius: 4 },
  heatLegendLabel: { fontSize: 11, color: "#666" },

  recordsRow: { flexDirection: "row-reverse", gap: 8 },
  recordCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    gap: 4,
  },
  recordIcon: { fontSize: 22 },
  recordLabel: { color: "#CBD5E1", fontSize: 11, textAlign: "center" },
  recordVal: { color: GOLD, fontSize: 13, textAlign: "center" },
  recordSub: { color: "#94A3B8", fontSize: 10, textAlign: "center" },

  goalRow: { marginBottom: 18 },
  goalHeader: { flexDirection: "row-reverse", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 },
  goalTitleRow: { alignItems: "flex-end", gap: 2 },
  goalMeta: { alignItems: "flex-start", gap: 4 },
  goalName: { fontSize: 14 },
  goalCount: { fontSize: 12 },
  goalPct: { fontSize: 16 },
  doneBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  doneBadgeText: { fontSize: 11, fontWeight: "600" },
  barTrack: { height: 12, borderRadius: 6, backgroundColor: "#e0e0e0", overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 6 },

  footerCard: {
    marginTop: 32,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 10,
  },
  footerStar: { fontSize: 28 },
  footerText: { color: "#fff", fontSize: 16, textAlign: "center", lineHeight: 28 },
  footerRef: { color: GOLD, fontSize: 13 },
});

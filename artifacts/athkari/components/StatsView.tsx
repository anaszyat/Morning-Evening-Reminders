import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Circle, G, Path, Rect, Text as SvgText } from "react-native-svg";

import { tasbihPhrases } from "@/constants/tasbih";
import { useApp } from "@/contexts/AppContext";
import { useColors } from "@/hooks/useColors";

const NAVY = "#1a2a6c";
const CYAN = "#4fc3f7";
const GOLD = "#f4c542";
const GREEN = "#4caf50";
const PHRASE_COLORS = [CYAN, GOLD, NAVY, GREEN, "#e57373", "#ab47bc"];

const QUOTES = [
  { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", ref: "سورة الرعد: 28" },
  { text: "وَاذْكُرُوا اللَّهَ كَثِيرًا لَعَلَّكُمْ تُفْلِحُونَ", ref: "سورة الجمعة: 10" },
  { text: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", ref: "سورة البقرة: 152" },
];

const DAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

const ARABIC_MONTHS: Record<number, string> = {
  1: "يناير", 2: "فبراير", 3: "مارس", 4: "أبريل",
  5: "مايو", 6: "يونيو", 7: "يوليو", 8: "أغسطس",
  9: "سبتمبر", 10: "أكتوبر", 11: "نوفمبر", 12: "ديسمبر",
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateKeyOffset(daysAgo: number) {
  const d = new Date(Date.now() - daysAgo * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatSessionDate(iso: string): string {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(Date.now() - 86_400_000);
    const dStr = (x: Date) => `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
    if (dStr(d) === dStr(today)) {
      return `اليوم ${d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (dStr(d) === dStr(yesterday)) return "أمس";
    return DAYS_AR[d.getDay()];
  } catch {
    return "";
  }
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec} ث`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m} دقيقة`;
  return `${Math.floor(m / 60)} س ${m % 60} د`;
}

function formatMonthKey(ym: string): string {
  try {
    const [y, m] = ym.split("-");
    return `${ARABIC_MONTHS[Number(m)] ?? m} ${y}`;
  } catch {
    return ym;
  }
}

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

function SectionTitle({ title }: { title: string }) {
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

function WeeklyChart({ data }: { data: { day: string; count: number; isToday: boolean }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const W = 340;
  const H = 150;
  const barW = 32;
  const gap = (W - data.length * barW) / (data.length + 1);

  return (
    <View style={sStyles.chartCard}>
      <View style={sStyles.navyCard}>
        <Svg width={W} height={H + 30}>
          {data.map((item, i) => {
            const barH = (item.count / max) * H;
            const x = gap + i * (barW + gap);
            const y = H - barH;
            return (
              <G key={i}>
                <Rect
                  x={x}
                  y={y < H ? y : H - 1}
                  width={barW}
                  height={barH > 0 ? barH : 1}
                  rx={6}
                  fill={item.isToday ? GOLD : CYAN}
                  opacity={0.9}
                />
                <SvgText
                  x={x + barW / 2}
                  y={H + 18}
                  fontSize={9}
                  fill="#CBD5E1"
                  textAnchor="middle"
                >
                  {item.day.slice(0, 3)}
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

function DonutChart({ breakdown }: { breakdown: { name: string; count: number; color: string }[] }) {
  const total = breakdown.reduce((s, d) => s + d.count, 0);
  const CX = 110;
  const CY = 110;
  const outerR = 90;
  const innerR = 58;

  if (total === 0) {
    return (
      <View style={[sStyles.donutWrap, { paddingVertical: 24 }]}>
        <Text style={{ color: "#999", fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center" }}>
          لا توجد بيانات بعد — ابدأ التسبيح!
        </Text>
      </View>
    );
  }

  let currentAngle = -90;
  return (
    <View style={sStyles.donutWrap}>
      <Svg width={220} height={220}>
        {breakdown.map((item, i) => {
          if (item.count === 0) return null;
          const sweep = (item.count / total) * 360;
          const path = donutSlice(CX, CY, outerR, innerR, currentAngle, currentAngle + sweep - 1.5);
          currentAngle += sweep;
          return <Path key={i} d={path} fill={item.color} />;
        })}
        <SvgText x={CX} y={CY - 10} textAnchor="middle" fontSize={total >= 1000 ? 19 : 22} fontWeight="bold" fill={NAVY}>
          {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : total}
        </SvgText>
        <SvgText x={CX} y={CY + 14} textAnchor="middle" fontSize={11} fill="#666">
          ذكر إجمالي
        </SvgText>
      </Svg>
      <View style={sStyles.legend}>
        {breakdown.filter((d) => d.count > 0).map((item, i) => (
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

type SessionRow = {
  id: string;
  dhikr: string;
  count: number;
  durationSec: number;
  date: string;
  completedAt: string;
  done: boolean;
};

function SessionTable({ sessions }: { sessions: SessionRow[] }) {
  const [filter, setFilter] = useState<"all" | "today" | "week" | "month">("all");
  const tabs = [
    { key: "all" as const, label: "الكل" },
    { key: "today" as const, label: "اليوم" },
    { key: "week" as const, label: "الأسبوع" },
    { key: "month" as const, label: "الشهر" },
  ];

  const today = todayKey();
  const weekAgo = dateKeyOffset(7);
  const monthAgo = dateKeyOffset(30);

  const filtered = sessions.filter((s) => {
    const d = s.completedAt.slice(0, 10);
    if (filter === "today") return d === today;
    if (filter === "week") return d >= weekAgo;
    if (filter === "month") return d >= monthAgo;
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
      {filtered.length === 0 ? (
        <Text style={{ color: "#999", textAlign: "center", fontFamily: "IBMPlexSansArabic_400Regular", paddingVertical: 16 }}>
          لا توجد جلسات في هذه الفترة
        </Text>
      ) : (
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
              <View key={s.id} style={[sStyles.tableRow, i % 2 === 0 ? sStyles.rowEven : sStyles.rowOdd]}>
                <Text style={[sStyles.tdCell, { fontFamily: "IBMPlexSansArabic_500Medium", color: NAVY }]}>
                  {s.dhikr}
                </Text>
                <Text style={[sStyles.tdCell, { fontFamily: "IBMPlexSansArabic_400Regular", color: "#333" }]}>
                  {s.count}
                </Text>
                <Text style={[sStyles.tdCell, { fontFamily: "IBMPlexSansArabic_400Regular", color: "#333" }]}>
                  {formatDuration(s.durationSec)}
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
      )}
    </View>
  );
}

function Heatmap({ data }: { data: number[] }) {
  function cellColor(v: number) {
    if (v === 0) return "#e0e0e0";
    if (v <= 50) return "#b3e5fc";
    if (v <= 200) return CYAN;
    if (v <= 500) return "#0288d1";
    return GOLD;
  }
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
  const { lifetimeStats, tasbih } = useApp();
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  const today = todayKey();

  const totalVal = useCountUp(lifetimeStats.totalDhikr);
  const todayCount = lifetimeStats.daily[today] ?? 0;
  const todayCountAnim = useCountUp(todayCount, 1200);

  const todaySessions = useMemo(
    () => lifetimeStats.sessions.filter((s) => s.completedAt.slice(0, 10) === today).length,
    [lifetimeStats.sessions, today],
  );

  const topDhikr = useMemo(() => {
    let bestId = "";
    let bestCount = 0;
    for (const [id, count] of Object.entries(lifetimeStats.tasbihLifetime)) {
      if (count > bestCount) { bestCount = count; bestId = id; }
    }
    const phrase = tasbihPhrases.find((p) => p.id === bestId);
    return phrase ? { name: phrase.short, count: bestCount } : null;
  }, [lifetimeStats.tasbihLifetime]);

  const weeklyData = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const daysAgo = 6 - i;
      const key = dateKeyOffset(daysAgo);
      const date = new Date(Date.now() - daysAgo * 86_400_000);
      return {
        day: DAYS_AR[date.getDay()],
        count: lifetimeStats.daily[key] ?? 0,
        isToday: daysAgo === 0,
      };
    });
  }, [lifetimeStats.daily]);

  const breakdown = useMemo(() => {
    const tasbihTotal = tasbihPhrases.reduce(
      (s, p) => s + (lifetimeStats.tasbihLifetime[p.id] ?? 0), 0,
    );
    const other = Math.max(0, lifetimeStats.totalDhikr - tasbihTotal);
    const items = tasbihPhrases.map((p, i) => ({
      name: p.short,
      count: lifetimeStats.tasbihLifetime[p.id] ?? 0,
      color: PHRASE_COLORS[i] ?? "#9E9E9E",
    }));
    if (other > 0) {
      items.push({ name: "أذكار أخرى", count: other, color: "#9E9E9E" });
    }
    return items;
  }, [lifetimeStats.tasbihLifetime, lifetimeStats.totalDhikr]);

  const sessionRows = useMemo<SessionRow[]>(
    () =>
      lifetimeStats.sessions.map((s) => ({
        id: s.id,
        dhikr: s.phraseName,
        count: s.count,
        durationSec: s.durationSec,
        date: formatSessionDate(s.completedAt),
        completedAt: s.completedAt,
        done: s.completed,
      })),
    [lifetimeStats.sessions],
  );

  const heatmapData = useMemo(
    () => Array.from({ length: 30 }, (_, i) => lifetimeStats.daily[dateKeyOffset(29 - i)] ?? 0),
    [lifetimeStats.daily],
  );

  const goals = useMemo(
    () =>
      tasbihPhrases.slice(0, 3).map((p, i) => ({
        name: p.short,
        target: p.target,
        done: tasbih[p.id] ?? 0,
        color: PHRASE_COLORS[i],
      })),
    [tasbih],
  );

  const { bestDay, longestSession, bestMonth } = lifetimeStats.records;

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
          value={`${lifetimeStats.streak}`}
          subtext={`أعلى سلسلة: ${lifetimeStats.bestStreak} يوم`}
          accent={GOLD}
        />
        <HeroCard
          icon="☀️"
          label="جلسات اليوم"
          value={`${todaySessions}`}
          subtext={`إجمالي اليوم: ${todayCountAnim.toLocaleString()}`}
          accent={GREEN}
        />
        <HeroCard
          icon="⭐"
          label="أكثر ذكر"
          value={topDhikr ? topDhikr.name : "—"}
          subtext={topDhikr ? `${topDhikr.count.toLocaleString()} مرة` : "ابدأ التسبيح!"}
          accent={NAVY}
        />
      </View>

      {/* SECTION 2: Weekly Chart */}
      <SectionTitle title="نشاط الأسبوع" />
      <WeeklyChart data={weeklyData} />

      {/* SECTION 3: Donut Chart */}
      <SectionTitle title="توزيع الأذكار" />
      <View style={sStyles.whiteCard}>
        <DonutChart breakdown={breakdown} />
      </View>

      {/* SECTION 4: Session Table */}
      <SectionTitle title="سجل جلسات المسبحة" />
      <View style={sStyles.whiteCard}>
        <SessionTable sessions={sessionRows} />
      </View>

      {/* SECTION 5: Heatmap */}
      <SectionTitle title="خريطة النشاط الشهري" />
      <View style={sStyles.whiteCard}>
        <Heatmap data={heatmapData} />
      </View>

      {/* SECTION 6: Records */}
      <SectionTitle title="أرقامي القياسية" />
      <View style={sStyles.recordsRow}>
        <View style={[sStyles.recordCard, { backgroundColor: NAVY }]}>
          <Text style={sStyles.recordIcon}>🏆</Text>
          <Text style={[sStyles.recordLabel, { fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>أفضل يوم</Text>
          <Text style={[sStyles.recordVal, { fontFamily: "IBMPlexSansArabic_700Bold" }]}>
            {bestDay ? `${bestDay.count.toLocaleString()} ذكر` : "—"}
          </Text>
          <Text style={[sStyles.recordSub, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>
            {bestDay ? bestDay.date : "لم يُسجَّل بعد"}
          </Text>
        </View>
        <View style={[sStyles.recordCard, { backgroundColor: NAVY }]}>
          <Text style={sStyles.recordIcon}>⚡</Text>
          <Text style={[sStyles.recordLabel, { fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>أطول جلسة</Text>
          <Text style={[sStyles.recordVal, { fontFamily: "IBMPlexSansArabic_700Bold" }]}>
            {longestSession ? formatDuration(longestSession.durationSec) : "—"}
          </Text>
          <Text style={[sStyles.recordSub, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>
            {longestSession ? formatSessionDate(longestSession.date) : "لم يُسجَّل بعد"}
          </Text>
        </View>
        <View style={[sStyles.recordCard, { backgroundColor: NAVY }]}>
          <Text style={sStyles.recordIcon}>📅</Text>
          <Text style={[sStyles.recordLabel, { fontFamily: "IBMPlexSansArabic_600SemiBold" }]}>أكثر شهر</Text>
          <Text style={[sStyles.recordVal, { fontFamily: "IBMPlexSansArabic_700Bold" }]}>
            {bestMonth ? (bestMonth.count >= 1000 ? `${(bestMonth.count / 1000).toFixed(1)}k ذكر` : `${bestMonth.count} ذكر`) : "—"}
          </Text>
          <Text style={[sStyles.recordSub, { fontFamily: "IBMPlexSansArabic_400Regular" }]}>
            {bestMonth ? formatMonthKey(bestMonth.month) : "لم يُسجَّل بعد"}
          </Text>
        </View>
      </View>

      {/* SECTION 7: Goals */}
      <SectionTitle title="أهدافي اليومية" />
      <View style={sStyles.whiteCard}>
        {goals.map((g, i) => {
          const pct = Math.round((Math.min(g.done, g.target) / g.target) * 100);
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

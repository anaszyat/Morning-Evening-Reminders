import React, { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AdhkarView } from "@/components/AdhkarView";
import { MawaqitView } from "@/components/MawaqitView";
import { SettingsView } from "@/components/SettingsView";
import { StatsView } from "@/components/StatsView";
import { TasbihView } from "@/components/TasbihView";
import { TopTabs, type TabKey } from "@/components/TopTabs";
import { useColors } from "@/hooks/useColors";

type Overlay = "settings" | "stats" | null;

export default function HomeScreen() {
  const colors = useColors();
  const [tab, setTab] = useState<TabKey>("athkar");
  const [overlay, setOverlay] = useState<Overlay>(null);
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? Math.max(insets.top, 24) : insets.top;
  const bottomPad = isWeb ? 34 : Math.max(insets.bottom, 0);

  const handleTabChange = (k: TabKey) => {
    setOverlay(null);
    setTab(k);
  };

  const handleSettingsPress = () => {
    setOverlay((prev) => (prev === "settings" || prev === "stats" ? null : "settings"));
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad }]}>
      <TopTabs
        active={tab}
        onChange={handleTabChange}
        onSettingsPress={handleSettingsPress}
        settingsActive={overlay === "settings" || overlay === "stats"}
      />
      <View style={styles.body}>
        {overlay === "stats" && (
          <StatsView onBack={() => setOverlay("settings")} />
        )}
        {overlay === "settings" && (
          <SettingsView onStatsPress={() => setOverlay("stats")} />
        )}
        {overlay === null && tab === "athkar"  && <AdhkarView />}
        {overlay === null && tab === "mawaqit" && <MawaqitView />}
        {overlay === null && tab === "tasbih"  && <TasbihView />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, marginTop: 8 },
});

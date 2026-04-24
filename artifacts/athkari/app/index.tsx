import React, { useState } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AdhkarView } from "@/components/AdhkarView";
import { Header } from "@/components/Header";
import { MawaqitView } from "@/components/MawaqitView";
import { QiblaView } from "@/components/QiblaView";
import { TasbihView } from "@/components/TasbihView";
import { TopTabs, type TabKey } from "@/components/TopTabs";
import { useColors } from "@/hooks/useColors";

export default function HomeScreen() {
  const colors = useColors();
  const [tab, setTab] = useState<TabKey>("athkar");
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const topPad = isWeb ? Math.max(insets.top, 67) : insets.top;
  const bottomPad = isWeb ? 34 : Math.max(insets.bottom, 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad, paddingBottom: bottomPad }]}>
      <Header />
      <TopTabs active={tab} onChange={setTab} />
      <View style={styles.body}>
        {tab === "athkar" && <AdhkarView />}
        {tab === "mawaqit" && <MawaqitView />}
        {tab === "qibla" && <QiblaView />}
        {tab === "tasbih" && <TasbihView />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, marginTop: 8 },
});

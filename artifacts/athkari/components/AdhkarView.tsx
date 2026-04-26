import React from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";

import { CategoryCard } from "@/components/CategoryCard";
import { HeroProgress } from "@/components/HeroProgress";
import { adhkarCategories } from "@/constants/adhkar";

export function AdhkarView() {
  const router = useRouter();
  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 100 }}
      showsVerticalScrollIndicator={false}
    >
      <HeroProgress />
      <View style={styles.spacer} />
      <View style={styles.grid}>
        {adhkarCategories.map((c) => (
          <View key={c.id} style={styles.cell}>
            <CategoryCard
              category={c}
              onPress={() => router.push(`/dhikr/${c.id}` as never)}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  spacer: { height: 18 },
  grid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  cell: {
    width: "50%",
    padding: 6,
  },
});

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
      {adhkarCategories.map((c) => (
        <CategoryCard
          key={c.id}
          category={c}
          onPress={() => router.push(`/dhikr/${c.id}` as never)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  spacer: { height: 18 },
});

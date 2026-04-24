import colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

export function useColors() {
  const { theme } = useApp();
  const palette = theme === "dark" ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius, mode: theme };
}

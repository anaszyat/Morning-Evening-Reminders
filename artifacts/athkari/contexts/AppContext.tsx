import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { adhkarCategories, totalDailyAdhkar } from "@/constants/adhkar";
import { cities, type City } from "@/constants/cities";
import { tasbihPhrases } from "@/constants/tasbih";

const STORAGE_KEYS = {
  progress: "athkari:progress:v1",
  tasbih: "athkari:tasbih:v1",
  city: "athkari:city:v1",
  notifications: "athkari:notifications:v1",
  theme: "athkari:theme:v1",
};

type ProgressMap = Record<string, number>;
type TasbihMap = Record<string, number>;
type ThemeMode = "light" | "dark";

type AppContextValue = {
  loaded: boolean;
  // Progress
  progress: ProgressMap;
  todayKey: string;
  incrementDhikr: (categoryId: string, dhikrId: string, target: number) => void;
  resetCategory: (categoryId: string) => void;
  getCategoryCompletedCount: (categoryId: string) => number;
  totalCompletedToday: number;
  totalAdhkar: number;
  overallPercent: number;
  // Tasbih
  tasbih: TasbihMap;
  totalTasbih: number;
  incrementTasbih: (id: string) => void;
  resetTasbih: (id?: string) => void;
  // Location
  city: City;
  setCity: (city: City) => void;
  // Notifications
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function todayKeyFor(date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [tasbih, setTasbih] = useState<TasbihMap>({});
  const [city, setCityState] = useState<City>(cities[5]); // Kuwait by default
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [todayKey, setTodayKey] = useState<string>(todayKeyFor());

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const [progRaw, tasRaw, cityRaw, notifRaw, themeRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.progress),
          AsyncStorage.getItem(STORAGE_KEYS.tasbih),
          AsyncStorage.getItem(STORAGE_KEYS.city),
          AsyncStorage.getItem(STORAGE_KEYS.notifications),
          AsyncStorage.getItem(STORAGE_KEYS.theme),
        ]);
        if (progRaw) {
          const parsed = JSON.parse(progRaw) as { date: string; data: ProgressMap };
          if (parsed.date === todayKeyFor()) {
            setProgress(parsed.data);
          }
        }
        if (tasRaw) setTasbih(JSON.parse(tasRaw));
        if (cityRaw) {
          const found = cities.find((c) => c.id === cityRaw);
          if (found) setCityState(found);
        }
        if (notifRaw) setNotificationsEnabled(notifRaw === "true");
        if (themeRaw === "dark" || themeRaw === "light") setTheme(themeRaw);
      } catch {
        // ignore storage errors
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  // Auto-roll daily progress at midnight
  useEffect(() => {
    const i = setInterval(() => {
      const k = todayKeyFor();
      if (k !== todayKey) {
        setTodayKey(k);
        setProgress({});
        AsyncStorage.removeItem(STORAGE_KEYS.progress).catch(() => {});
      }
    }, 30_000);
    return () => clearInterval(i);
  }, [todayKey]);

  const persistProgress = useCallback((next: ProgressMap) => {
    AsyncStorage.setItem(
      STORAGE_KEYS.progress,
      JSON.stringify({ date: todayKeyFor(), data: next }),
    ).catch(() => {});
  }, []);

  const incrementDhikr = useCallback(
    (categoryId: string, dhikrId: string, target: number) => {
      setProgress((prev) => {
        const key = `${categoryId}:${dhikrId}`;
        const current = prev[key] ?? 0;
        if (current >= target) return prev;
        const next = { ...prev, [key]: current + 1 };
        persistProgress(next);
        return next;
      });
    },
    [persistProgress],
  );

  const resetCategory = useCallback(
    (categoryId: string) => {
      setProgress((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (k.startsWith(`${categoryId}:`)) delete next[k];
        });
        persistProgress(next);
        return next;
      });
    },
    [persistProgress],
  );

  const getCategoryCompletedCount = useCallback(
    (categoryId: string): number => {
      const cat = adhkarCategories.find((c) => c.id === categoryId);
      if (!cat) return 0;
      let done = 0;
      for (const d of cat.items) {
        const v = progress[`${categoryId}:${d.id}`] ?? 0;
        if (v >= d.count) done++;
      }
      return done;
    },
    [progress],
  );

  const totalCompletedToday = useMemo(() => {
    let done = 0;
    for (const cat of adhkarCategories) {
      for (const d of cat.items) {
        const v = progress[`${cat.id}:${d.id}`] ?? 0;
        if (v >= d.count) done++;
      }
    }
    return done;
  }, [progress]);

  const overallPercent = useMemo(() => {
    if (totalDailyAdhkar === 0) return 0;
    return Math.round((totalCompletedToday / totalDailyAdhkar) * 100);
  }, [totalCompletedToday]);

  const incrementTasbih = useCallback((id: string) => {
    setTasbih((prev) => {
      const next = { ...prev, [id]: (prev[id] ?? 0) + 1 };
      AsyncStorage.setItem(STORAGE_KEYS.tasbih, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const resetTasbih = useCallback((id?: string) => {
    setTasbih((prev) => {
      const next = id ? { ...prev, [id]: 0 } : {};
      AsyncStorage.setItem(STORAGE_KEYS.tasbih, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const totalTasbih = useMemo(
    () => tasbihPhrases.reduce((sum, p) => sum + (tasbih[p.id] ?? 0), 0),
    [tasbih],
  );

  const setCity = useCallback((c: City) => {
    setCityState(c);
    AsyncStorage.setItem(STORAGE_KEYS.city, c.id).catch(() => {});
  }, []);

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEYS.notifications, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(STORAGE_KEYS.theme, next).catch(() => {});
      return next;
    });
  }, []);

  const value: AppContextValue = {
    loaded,
    progress,
    todayKey,
    incrementDhikr,
    resetCategory,
    getCategoryCompletedCount,
    totalCompletedToday,
    totalAdhkar: totalDailyAdhkar,
    overallPercent,
    tasbih,
    totalTasbih,
    incrementTasbih,
    resetTasbih,
    city,
    setCity,
    notificationsEnabled,
    toggleNotifications,
    theme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

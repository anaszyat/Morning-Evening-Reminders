import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

import { adhkarCategories, totalDailyAdhkar } from "@/constants/adhkar";
import { cities, type City } from "@/constants/cities";
import { tasbihPhrases } from "@/constants/tasbih";
import type { PrayerKey, PrayerMethod } from "@/lib/prayerTimes";
import { prayerMethods } from "@/lib/prayerTimes";

const STORAGE_KEYS = {
  progress: "athkari:progress:v1",
  tasbih: "athkari:tasbih:v1",
  city: "athkari:city:v1",
  notifications: "athkari:notifications:v1",
  prayerNotifications: "athkari:prayerNotifications:v1",
  calculationMethod: "athkari:calcMethod:v1",
  theme: "athkari:theme:v1",
  useDeviceLocation: "athkari:useDeviceLocation:v1",
  deviceLocation: "athkari:deviceLocation:v1",
  lifetimeStats: "athkari:lifetime:v1",
};

export type TasbihSession = {
  id: string;
  phraseId: string;
  phraseName: string;
  count: number;
  target: number;
  durationSec: number;
  completedAt: string;
  completed: boolean;
};

export type LifetimeStats = {
  totalDhikr: number;
  streak: number;
  bestStreak: number;
  lastActiveDate: string;
  daily: Record<string, number>;
  tasbihLifetime: Record<string, number>;
  sessions: TasbihSession[];
  records: {
    bestDay: { date: string; count: number } | null;
    longestSession: { durationSec: number; date: string } | null;
    bestMonth: { month: string; count: number } | null;
  };
};

const DEFAULT_LIFETIME_STATS: LifetimeStats = {
  totalDhikr: 0,
  streak: 0,
  bestStreak: 0,
  lastActiveDate: "",
  daily: {},
  tasbihLifetime: {},
  sessions: [],
  records: { bestDay: null, longestSession: null, bestMonth: null },
};

const DEFAULT_PRAYER_NOTIFICATIONS: Record<PrayerKey, boolean> = {
  fajr: true,
  sunrise: false,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
};

type ProgressMap = Record<string, number>;
type TasbihMap = Record<string, number>;
type ThemeMode = "light" | "dark";

export type DeviceLocation = {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
};

export type EffectiveLocation = {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  isDevice: boolean;
};

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
  useDeviceLocation: boolean;
  deviceLocation: DeviceLocation | null;
  effectiveLocation: EffectiveLocation;
  locationStatus: "idle" | "requesting" | "granted" | "denied" | "error";
  locationError: string | null;
  requestDeviceLocation: () => Promise<boolean>;
  disableDeviceLocation: () => void;
  // Notifications
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  prayerNotifications: Record<PrayerKey, boolean>;
  togglePrayerNotification: (key: PrayerKey) => void;
  // Calculation method
  calculationMethod: PrayerMethod;
  setCalculationMethod: (method: PrayerMethod) => void;
  // Theme
  theme: ThemeMode;
  toggleTheme: () => void;
  // Lifetime Stats
  lifetimeStats: LifetimeStats;
  logTasbihSession: (session: Omit<TasbihSession, "id">) => void;
};

const AppContext = createContext<AppContextValue | null>(null);

function todayKeyFor(date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
}

async function reverseGeocode(latitude: number, longitude: number): Promise<{ name: string; country: string }> {
  try {
    if (Platform.OS === "web") {
      // Web: try Nominatim public endpoint with Arabic language
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ar`,
          { headers: { Accept: "application/json" } },
        );
        if (res.ok) {
          const data = await res.json();
          const name =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            data.address?.state ||
            "موقعك الحالي";
          const country = data.address?.country || "";
          return { name, country };
        }
      } catch {
        // ignore
      }
      return { name: "موقعك الحالي", country: "" };
    }
    const places = await Location.reverseGeocodeAsync({ latitude, longitude });
    const p = places[0];
    if (p) {
      const name =
        p.city || p.subregion || p.region || p.district || "موقعك الحالي";
      const country = p.country || "";
      return { name, country };
    }
  } catch {
    // ignore
  }
  return { name: "موقعك الحالي", country: "" };
}

function getWebPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation غير مدعوم في المتصفح"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  });
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [tasbih, setTasbih] = useState<TasbihMap>({});
  const [city, setCityState] = useState<City>(cities[5]); // Kuwait by default
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [prayerNotifications, setPrayerNotifications] = useState<Record<PrayerKey, boolean>>(
    DEFAULT_PRAYER_NOTIFICATIONS,
  );
  const [calculationMethod, setCalculationMethodState] = useState<PrayerMethod>("UmmAlQura");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [todayKey, setTodayKey] = useState<string>(todayKeyFor());
  const [useDeviceLocation, setUseDeviceLocation] = useState(false);
  const [deviceLocation, setDeviceLocation] = useState<DeviceLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<
    "idle" | "requesting" | "granted" | "denied" | "error"
  >("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [lifetimeStats, setLifetimeStats] = useState<LifetimeStats>(DEFAULT_LIFETIME_STATS);

  // Load persisted state
  useEffect(() => {
    (async () => {
      try {
        const [
          progRaw,
          tasRaw,
          cityRaw,
          notifRaw,
          prayNotifRaw,
          calcMethodRaw,
          themeRaw,
          useLocRaw,
          devLocRaw,
          lifeRaw,
        ] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.progress),
          AsyncStorage.getItem(STORAGE_KEYS.tasbih),
          AsyncStorage.getItem(STORAGE_KEYS.city),
          AsyncStorage.getItem(STORAGE_KEYS.notifications),
          AsyncStorage.getItem(STORAGE_KEYS.prayerNotifications),
          AsyncStorage.getItem(STORAGE_KEYS.calculationMethod),
          AsyncStorage.getItem(STORAGE_KEYS.theme),
          AsyncStorage.getItem(STORAGE_KEYS.useDeviceLocation),
          AsyncStorage.getItem(STORAGE_KEYS.deviceLocation),
          AsyncStorage.getItem(STORAGE_KEYS.lifetimeStats),
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
        if (prayNotifRaw) {
          try {
            const parsed = JSON.parse(prayNotifRaw) as Record<PrayerKey, boolean>;
            setPrayerNotifications({ ...DEFAULT_PRAYER_NOTIFICATIONS, ...parsed });
          } catch {
            // ignore
          }
        }
        if (calcMethodRaw && (prayerMethods as string[]).includes(calcMethodRaw)) {
          setCalculationMethodState(calcMethodRaw as PrayerMethod);
        }
        if (themeRaw === "dark" || themeRaw === "light") setTheme(themeRaw);
        if (useLocRaw === "true") setUseDeviceLocation(true);
        if (devLocRaw) {
          try {
            const parsed = JSON.parse(devLocRaw) as DeviceLocation;
            if (
              parsed &&
              typeof parsed.latitude === "number" &&
              typeof parsed.longitude === "number"
            ) {
              setDeviceLocation(parsed);
              if (useLocRaw === "true") setLocationStatus("granted");
            }
          } catch {
            // ignore
          }
        }
        if (lifeRaw) {
          try {
            const parsed = JSON.parse(lifeRaw) as LifetimeStats;
            setLifetimeStats({ ...DEFAULT_LIFETIME_STATS, ...parsed });
          } catch {
            // ignore
          }
        }
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
        setLifetimeStats((ls) => {
          const today = todayKeyFor();
          const newDailyCount = (ls.daily[today] ?? 0) + 1;
          const updatedDaily = { ...ls.daily, [today]: newDailyCount };
          const totalDhikr = ls.totalDhikr + 1;
          let streak = ls.streak;
          let bestStreak = ls.bestStreak;
          let lastActiveDate = ls.lastActiveDate;
          if (lastActiveDate !== today) {
            const yesterday = todayKeyFor(new Date(Date.now() - 86_400_000));
            streak = lastActiveDate === yesterday ? streak + 1 : 1;
            lastActiveDate = today;
            if (streak > bestStreak) bestStreak = streak;
          }
          let bestDay = ls.records.bestDay;
          if (!bestDay || newDailyCount > bestDay.count) {
            bestDay = { date: today, count: newDailyCount };
          }
          const monthKey = today.slice(0, 7);
          const monthTotal = Object.entries(updatedDaily)
            .filter(([d]) => d.startsWith(monthKey))
            .reduce((s, [, c]) => s + c, 0);
          let bestMonth = ls.records.bestMonth;
          if (!bestMonth || monthTotal > bestMonth.count) {
            bestMonth = { month: monthKey, count: monthTotal };
          }
          const cutoff = todayKeyFor(new Date(Date.now() - 60 * 86_400_000));
          const prunedDaily: Record<string, number> = {};
          for (const [d, c] of Object.entries(updatedDaily)) {
            if (d >= cutoff) prunedDaily[d] = c;
          }
          const updated: LifetimeStats = {
            ...ls,
            totalDhikr,
            streak,
            bestStreak,
            lastActiveDate,
            daily: prunedDaily,
            records: { ...ls.records, bestDay, bestMonth },
          };
          AsyncStorage.setItem(STORAGE_KEYS.lifetimeStats, JSON.stringify(updated)).catch(() => {});
          return updated;
        });
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
      setLifetimeStats((ls) => {
        const updated: LifetimeStats = {
          ...ls,
          tasbihLifetime: {
            ...ls.tasbihLifetime,
            [id]: (ls.tasbihLifetime[id] ?? 0) + 1,
          },
        };
        AsyncStorage.setItem(STORAGE_KEYS.lifetimeStats, JSON.stringify(updated)).catch(() => {});
        return updated;
      });
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
    // Switching to a manual city disables device location
    setUseDeviceLocation(false);
    AsyncStorage.setItem(STORAGE_KEYS.useDeviceLocation, "false").catch(() => {});
  }, []);

  const requestDeviceLocation = useCallback(async (): Promise<boolean> => {
    setLocationStatus("requesting");
    setLocationError(null);
    try {
      let lat: number;
      let lng: number;
      if (Platform.OS === "web") {
        const pos = await getWebPosition();
        lat = pos.latitude;
        lng = pos.longitude;
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocationStatus("denied");
          setLocationError("لم يُسمح بالوصول إلى الموقع.");
          return false;
        }
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        lat = loc.coords.latitude;
        lng = loc.coords.longitude;
      }
      const place = await reverseGeocode(lat, lng);
      const next: DeviceLocation = {
        latitude: lat,
        longitude: lng,
        name: place.name,
        country: place.country,
      };
      setDeviceLocation(next);
      setUseDeviceLocation(true);
      setLocationStatus("granted");
      AsyncStorage.setItem(STORAGE_KEYS.deviceLocation, JSON.stringify(next)).catch(() => {});
      AsyncStorage.setItem(STORAGE_KEYS.useDeviceLocation, "true").catch(() => {});
      return true;
    } catch (e: unknown) {
      setLocationStatus("error");
      const msg =
        e instanceof Error
          ? e.message
          : "تعذّر الحصول على الموقع. تأكد من تفعيل خدمات الموقع.";
      setLocationError(msg);
      return false;
    }
  }, []);

  const disableDeviceLocation = useCallback(() => {
    setUseDeviceLocation(false);
    AsyncStorage.setItem(STORAGE_KEYS.useDeviceLocation, "false").catch(() => {});
  }, []);

  const effectiveLocation: EffectiveLocation = useMemo(() => {
    if (useDeviceLocation && deviceLocation) {
      return {
        latitude: deviceLocation.latitude,
        longitude: deviceLocation.longitude,
        name: deviceLocation.name,
        country: deviceLocation.country,
        isDevice: true,
      };
    }
    return {
      latitude: city.latitude,
      longitude: city.longitude,
      name: city.name,
      country: city.country,
      isDevice: false,
    };
  }, [useDeviceLocation, deviceLocation, city]);

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEYS.notifications, String(next)).catch(() => {});
      return next;
    });
  }, []);

  const togglePrayerNotification = useCallback((key: PrayerKey) => {
    setPrayerNotifications((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      AsyncStorage.setItem(
        STORAGE_KEYS.prayerNotifications,
        JSON.stringify(next),
      ).catch(() => {});
      return next;
    });
  }, []);

  const setCalculationMethod = useCallback((method: PrayerMethod) => {
    setCalculationMethodState(method);
    AsyncStorage.setItem(STORAGE_KEYS.calculationMethod, method).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(STORAGE_KEYS.theme, next).catch(() => {});
      return next;
    });
  }, []);

  const logTasbihSession = useCallback((session: Omit<TasbihSession, "id">) => {
    if (session.count === 0) return;
    setLifetimeStats((ls) => {
      const newSession: TasbihSession = { ...session, id: `${Date.now()}-${Math.random()}` };
      const sessions = [newSession, ...ls.sessions].slice(0, 200);
      let longestSession = ls.records.longestSession;
      if (!longestSession || session.durationSec > longestSession.durationSec) {
        longestSession = { durationSec: session.durationSec, date: session.completedAt };
      }
      const updated: LifetimeStats = {
        ...ls,
        sessions,
        records: { ...ls.records, longestSession },
      };
      AsyncStorage.setItem(STORAGE_KEYS.lifetimeStats, JSON.stringify(updated)).catch(() => {});
      return updated;
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
    useDeviceLocation,
    deviceLocation,
    effectiveLocation,
    locationStatus,
    locationError,
    requestDeviceLocation,
    disableDeviceLocation,
    notificationsEnabled,
    toggleNotifications,
    prayerNotifications,
    togglePrayerNotification,
    calculationMethod,
    setCalculationMethod,
    theme,
    toggleTheme,
    lifetimeStats,
    logTasbihSession,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

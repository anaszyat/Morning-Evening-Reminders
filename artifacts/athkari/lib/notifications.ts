import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { prayerLabels, type PrayerKey, type PrayerTimes } from "@/lib/prayerTimes";

let permissionRequested = false;

if (Platform.OS !== "web") {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    if (window.Notification.permission === "granted") return true;
    if (window.Notification.permission === "denied") return false;
    const result = await window.Notification.requestPermission();
    return result === "granted";
  }
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  if (!existing.canAskAgain && !permissionRequested) return false;
  permissionRequested = true;
  const req = await Notifications.requestPermissionsAsync();
  return !!req.granted;
}

const PRAYER_ORDER: PrayerKey[] = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

let webTimers: ReturnType<typeof setTimeout>[] = [];

function clearWebTimers() {
  for (const t of webTimers) clearTimeout(t);
  webTimers = [];
}

function showWebNotification(key: PrayerKey) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (window.Notification.permission !== "granted") return;
  try {
    new window.Notification(`حان الآن وقت صلاة ${prayerLabels[key]}`, {
      body: "حيّ على الصلاة، حيّ على الفلاح",
      tag: `athkari-${key}`,
    });
  } catch {
    // ignore
  }
}

/**
 * Schedule (or re-schedule) all enabled prayer notifications.
 * - Cancels any previously scheduled prayer notifications first.
 * - On native: uses expo-notifications' scheduled triggers.
 * - On web: uses setTimeout while the page is open.
 */
export async function schedulePrayerNotifications(
  times: PrayerTimes,
  enabledMap: Record<PrayerKey, boolean>,
  masterEnabled: boolean,
): Promise<void> {
  if (Platform.OS === "web") {
    clearWebTimers();
    if (!masterEnabled) return;
    const granted = await ensureNotificationPermission();
    if (!granted) return;
    const now = Date.now();
    for (const key of PRAYER_ORDER) {
      if (!enabledMap[key]) continue;
      const t = times[key].getTime();
      const delay = t - now;
      if (delay <= 0 || delay > 24 * 60 * 60 * 1000) continue;
      const handle = setTimeout(() => showWebNotification(key), delay);
      webTimers.push(handle);
    }
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
  if (!masterEnabled) return;
  const granted = await ensureNotificationPermission();
  if (!granted) return;

  const now = Date.now();
  for (const key of PRAYER_ORDER) {
    if (!enabledMap[key]) continue;
    const date = times[key];
    const delay = date.getTime() - now;
    if (delay <= 0) continue;
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `حان الآن وقت صلاة ${prayerLabels[key]}`,
          body: "حيّ على الصلاة، حيّ على الفلاح",
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date,
        },
      });
    } catch {
      // ignore individual failures
    }
  }
}

/**
 * Trigger an immediate test notification so the user can preview the alert.
 */
export async function triggerTestNotification(): Promise<boolean> {
  const granted = await ensureNotificationPermission();
  if (!granted) return false;
  if (Platform.OS === "web") {
    showWebNotification("fajr");
    return true;
  }
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "تجربة تنبيه الأذان",
        body: "هكذا سيظهر تنبيه الصلاة في وقتها بإذن الله",
        sound: true,
      },
      trigger: null,
    });
    return true;
  } catch {
    return false;
  }
}

export async function cancelAllPrayerNotifications(): Promise<void> {
  if (Platform.OS === "web") {
    clearWebTimers();
    return;
  }
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch {
    // ignore
  }
}

// Lightweight prayer time + qibla calculations.
// Uses standard astronomical formulas (Umm Al-Qura method by default).

const DEG = Math.PI / 180;

function toJulianDate(date: Date): number {
  const Y = date.getUTCFullYear();
  const M = date.getUTCMonth() + 1;
  const D = date.getUTCDate();
  let y = Y;
  let m = M;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD =
    Math.floor(365.25 * (y + 4716)) +
    Math.floor(30.6001 * (m + 1)) +
    D +
    B -
    1524.5;
  return JD;
}

function sunPosition(jd: number): { decl: number; eqt: number } {
  const D = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * D) % 360;
  const q = (280.459 + 0.98564736 * D) % 360;
  const L = (q + 1.915 * Math.sin(g * DEG) + 0.020 * Math.sin(2 * g * DEG)) % 360;
  const e = 23.439 - 0.00000036 * D;
  const RA =
    (Math.atan2(Math.cos(e * DEG) * Math.sin(L * DEG), Math.cos(L * DEG)) /
      DEG /
      15 +
      24) %
    24;
  const decl =
    Math.asin(Math.sin(e * DEG) * Math.sin(L * DEG)) / DEG;
  const eqt = q / 15 - RA;
  return { decl, eqt };
}

function fixHour(h: number): number {
  let v = h - 24 * Math.floor(h / 24);
  if (v < 0) v += 24;
  return v;
}

// Compute solar mid-day (Dhuhr) in UTC hours
function dhuhrUTC(jd: number, longitude: number): number {
  const { eqt } = sunPosition(jd);
  return 12 - longitude / 15 - eqt;
}

// Compute solar angle time (in hours) from Dhuhr
function angleTime(angle: number, latitude: number, decl: number): number {
  const lat = latitude * DEG;
  const d = decl * DEG;
  const a = -angle * DEG;
  const x = (Math.sin(a) - Math.sin(lat) * Math.sin(d)) / (Math.cos(lat) * Math.cos(d));
  if (x > 1 || x < -1) return NaN;
  return (Math.acos(x) / DEG) / 15;
}

// Asr time using standard (Shafi'i) shadow factor = 1
function asrTime(latitude: number, decl: number, factor = 1): number {
  const lat = latitude * DEG;
  const d = decl * DEG;
  const t = Math.atan(1 / (factor + Math.tan(Math.abs(lat - d * 0))));
  // proper formula:
  const asrAngle =
    -Math.atan(1 / (factor + Math.tan(Math.abs(lat - d)))) / DEG;
  return angleTime(asrAngle, latitude, decl);
}

export type PrayerMethod =
  | "UmmAlQura"
  | "MuslimWorldLeague"
  | "Egyptian"
  | "Karachi"
  | "ISNA"
  | "Dubai"
  | "Qatar"
  | "Kuwait"
  | "Singapore";

const methodAngles: Record<PrayerMethod, { fajr: number; isha: number | "90min" }> = {
  UmmAlQura: { fajr: 18.5, isha: "90min" },
  MuslimWorldLeague: { fajr: 18, isha: 17 },
  Egyptian: { fajr: 19.5, isha: 17.5 },
  Karachi: { fajr: 18, isha: 18 },
  ISNA: { fajr: 15, isha: 15 },
  Dubai: { fajr: 18.2, isha: 18.2 },
  Qatar: { fajr: 18, isha: "90min" },
  Kuwait: { fajr: 18, isha: 17.5 },
  Singapore: { fajr: 20, isha: 18 },
};

export const prayerMethodLabels: Record<PrayerMethod, string> = {
  UmmAlQura: "أم القرى - السعودية",
  MuslimWorldLeague: "رابطة العالم الإسلامي",
  Egyptian: "الهيئة المصرية العامة للمساحة",
  Karachi: "جامعة العلوم الإسلامية - كراتشي",
  ISNA: "الجمعية الإسلامية لأمريكا الشمالية",
  Dubai: "هيئة الإمارات للأوقاف",
  Qatar: "قطر",
  Kuwait: "الكويت",
  Singapore: "سنغافورة (مجلس العلماء)",
};

export const prayerMethods: PrayerMethod[] = [
  "UmmAlQura",
  "MuslimWorldLeague",
  "Egyptian",
  "Karachi",
  "ISNA",
  "Dubai",
  "Qatar",
  "Kuwait",
  "Singapore",
];

export type PrayerTimes = {
  fajr: Date;
  sunrise: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
};

function timeFromHours(date: Date, hours: number): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const s = Math.floor((((hours - h) * 60) - m) * 60);
  d.setUTCHours(h, m, s, 0);
  return d;
}

export function calculatePrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  method: PrayerMethod = "UmmAlQura",
): PrayerTimes {
  const jd = toJulianDate(date) - longitude / (15 * 24);
  const { decl } = sunPosition(jd);
  const dhuhrU = dhuhrUTC(jd, longitude);

  const angles = methodAngles[method];
  const fajrDelta = angleTime(angles.fajr, latitude, decl);
  const sunriseDelta = angleTime(0.833, latitude, decl);
  const asrDelta = asrTime(latitude, decl, 1);
  const maghribDelta = angleTime(0.833, latitude, decl);

  const fajrU = dhuhrU - fajrDelta;
  const sunriseU = dhuhrU - sunriseDelta;
  const asrU = dhuhrU + asrDelta;
  const maghribU = dhuhrU + maghribDelta;

  let ishaU: number;
  if (angles.isha === "90min") {
    ishaU = maghribU + 1.5;
  } else {
    const ishaDelta = angleTime(angles.isha, latitude, decl);
    ishaU = dhuhrU + ishaDelta;
  }

  return {
    fajr: timeFromHours(date, fixHour(fajrU)),
    sunrise: timeFromHours(date, fixHour(sunriseU)),
    dhuhr: timeFromHours(date, fixHour(dhuhrU)),
    asr: timeFromHours(date, fixHour(asrU)),
    maghrib: timeFromHours(date, fixHour(maghribU)),
    isha: timeFromHours(date, fixHour(ishaU)),
  };
}

export function calculateQiblaBearing(latitude: number, longitude: number): number {
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;
  const phi1 = latitude * DEG;
  const phi2 = KAABA_LAT * DEG;
  const dLng = (KAABA_LNG - longitude) * DEG;
  const y = Math.sin(dLng) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLng);
  let bearing = Math.atan2(y, x) / DEG;
  bearing = (bearing + 360) % 360;
  return bearing;
}

export function calculateDistanceToMecca(latitude: number, longitude: number): number {
  const R = 6371;
  const KAABA_LAT = 21.4225;
  const KAABA_LNG = 39.8262;
  const dLat = (KAABA_LAT - latitude) * DEG;
  const dLng = (KAABA_LNG - longitude) * DEG;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(latitude * DEG) *
      Math.cos(KAABA_LAT * DEG) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatTime12(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes();
  const period = h >= 12 ? "م" : "ص";
  h = h % 12;
  if (h === 0) h = 12;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${h}:${mm} ${period}`;
}

export function formatCountdown(ms: number): string {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export type PrayerKey = "fajr" | "sunrise" | "dhuhr" | "asr" | "maghrib" | "isha";

export const prayerLabels: Record<PrayerKey, string> = {
  fajr: "الفجر",
  sunrise: "الشروق",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};

/**
 * Returns the most recent prayer time at or before `now`.
 * Falls back to "yesterday's isha" if all of today's prayers are still upcoming.
 */
export function getPrevPrayerTime(times: PrayerTimes, now: Date): Date {
  const order: PrayerKey[] = ["isha", "maghrib", "asr", "dhuhr", "sunrise", "fajr"];
  for (const key of order) {
    if (times[key].getTime() <= now.getTime()) {
      return times[key];
    }
  }
  const prev = new Date(times.isha);
  prev.setDate(prev.getDate() - 1);
  return prev;
}

export function getNextPrayer(
  times: PrayerTimes,
  now: Date,
): { key: PrayerKey; time: Date; isTomorrow: boolean } {
  const order: PrayerKey[] = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
  for (const key of order) {
    if (times[key].getTime() > now.getTime()) {
      return { key, time: times[key], isTomorrow: false };
    }
  }
  // After Isha — return Fajr of next day
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { key: "fajr", time: tomorrow, isTomorrow: true };
}

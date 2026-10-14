// Precise astronomical calculations for Islamic prayer times & Qibla bearing
// Egyptian General Authority of Survey (standard for Egypt) & international conventions

export interface CalculatedPrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  arabicTimings?: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  raw: {
    fajrDate: Date;
    sunriseDate: Date;
    dhuhrDate: Date;
    asrDate: Date;
    maghribDate: Date;
    ishaDate: Date;
  }; 
}

export interface CityPreset {
  name: string;
  arabicName: string;
  country: string;
  arabicCountry: string;
  lat: number;
  lng: number;
  timezone: string;
  method?: "Egypt" | "Makkah" | "MWL";
}

// Popular cities with Egypt as default and prominent Egyptian governorates
export const POPULAR_CITIES: CityPreset[] = [
  { name: "Cairo", arabicName: "القاهرة", country: "Egypt", arabicCountry: "مصر", lat: 30.0444, lng: 31.2357, timezone: "Africa/Cairo", method: "Egypt" },
  { name: "Alexandria", arabicName: "الإسكندرية", country: "Egypt", arabicCountry: "مصر", lat: 31.2001, lng: 29.9187, timezone: "Africa/Cairo", method: "Egypt" },
  { name: "Giza", arabicName: "الجيزة", country: "Egypt", arabicCountry: "مصر", lat: 30.0131, lng: 31.2089, timezone: "Africa/Cairo", method: "Egypt" },
  { name: "Mansoura", arabicName: "المنصورة", country: "Egypt", arabicCountry: "مصر", lat: 31.0409, lng: 31.3785, timezone: "Africa/Cairo", method: "Egypt" },
  { name: "Tanta", arabicName: "طنطا", country: "Egypt", arabicCountry: "مصر", lat: 30.7865, lng: 31.0004, timezone: "Africa/Cairo", method: "Egypt" },
  { name: "Aswan", arabicName: "أسوان", country: "Egypt", arabicCountry: "مصر", lat: 24.0889, lng: 32.8998, timezone: "Africa/Cairo", method: "Egypt" },
  { name: "Makkah", arabicName: "مكة المكرمة", country: "Saudi Arabia", arabicCountry: "السعودية", lat: 21.4225, lng: 39.8262, timezone: "Asia/Riyadh", method: "Makkah" },
  { name: "Madinah", arabicName: "المدينة المنورة", country: "Saudi Arabia", arabicCountry: "السعودية", lat: 24.5247, lng: 39.5692, timezone: "Asia/Riyadh", method: "Makkah" },
  { name: "Jerusalem", arabicName: "القدس الشريف", country: "Palestine", arabicCountry: "فلسطين", lat: 31.7683, lng: 35.2137, timezone: "Asia/Jerusalem", method: "MWL" },
  { name: "Istanbul", arabicName: "إسطنبول", country: "Turkey", arabicCountry: "تركيا", lat: 41.0082, lng: 28.9784, timezone: "Europe/Istanbul", method: "MWL" },
  { name: "Dubai", arabicName: "دبي", country: "UAE", arabicCountry: "الإمارات", lat: 25.2048, lng: 55.2708, timezone: "Asia/Dubai", method: "MWL" },
  { name: "London", arabicName: "لندن", country: "United Kingdom", arabicCountry: "المملكة المتحدة", lat: 51.5074, lng: -0.1278, timezone: "Europe/London", method: "MWL" },
  { name: "New York", arabicName: "نيويورك", country: "United States", arabicCountry: "الولايات المتحدة", lat: 40.7128, lng: -74.006, timezone: "America/New_York", method: "MWL" },
  { name: "Kuala Lumpur", arabicName: "كوالالمبور", country: "Malaysia", arabicCountry: "ماليزيا", lat: 3.139, lng: 101.6869, timezone: "Asia/Kuala_Lumpur", method: "MWL" },
];

export const CITY_PRESETS = POPULAR_CITIES;

// Helper trigonometric functions
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

// Get timezone offset in hours relative to UTC
export function getTimezoneOffsetHours(tzName?: string, date: Date = new Date()): number {
  if (!tzName) return -date.getTimezoneOffset() / 60;
  try {
    const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
    const tzDate = new Date(date.toLocaleString("en-US", { timeZone: tzName }));
    return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
  } catch {
    return -date.getTimezoneOffset() / 60;
  }
}

// Calculate Qibla direction and distance from any coordinates
export function calculateQibla(lat: number, lng: number): { bearing: number; distanceKm: number } {
  const kaabaLat = 21.422487;
  const kaabaLng = 39.826206;

  const phi1 = rad(lat);
  const phi2 = rad(kaabaLat);
  const deltaLambda = rad(kaabaLng - lng);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qiblaDeg = (deg(Math.atan2(y, x)) + 360) % 360;

  // Great-circle distance
  const R = 6371;
  const dLat = phi2 - phi1;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  return { bearing: Math.round(qiblaDeg * 10) / 10, distanceKm };
}

export const calculateQiblaDirection = (lat: number, lng: number) => calculateQibla(lat, lng).bearing;
export const calculateDistanceToKaaba = (lat: number, lng: number) => calculateQibla(lat, lng).distanceKm;

// Compute prayer times mathematically
export function computePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  tzName?: string,
  method?: string
): CalculatedPrayerTimes {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Julian Day
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const d = jd - 2451545.0; // Days since J2000.0

  // Mean anomaly of the Sun
  const g = (357.529 + 0.98560028 * d) % 360;

  // Mean longitude of the Sun
  const q = (280.459 + 0.98564736 * d) % 360;

  // Geocentric apparent ecliptic longitude
  const L = (q + 1.915 * Math.sin(rad(g)) + 0.02 * Math.sin(rad(2 * g))) % 360;

  // Mean obliquity of the ecliptic
  const e = 23.439 - 0.00000036 * d;

  // Sun declination
  const delta = deg(Math.asin(Math.sin(rad(e)) * Math.sin(rad(L))));

  // Equation of time in minutes
  const RA = deg(Math.atan2(Math.cos(rad(e)) * Math.sin(rad(L)), Math.cos(rad(L)))) / 15;
  const EqT = (q / 15 - (RA < 0 ? RA + 24 : RA)) * 60;

  // Solar noon
  const tzOffset = getTimezoneOffsetHours(tzName, date);
  const noonMinutes = 12 * 60 - EqT - (lng / 15 - tzOffset) * 60;

  // Hour angle helper
  const hourAngle = (angle: number): number => {
    const cosHA = (Math.sin(rad(angle)) - Math.sin(rad(lat)) * Math.sin(rad(delta))) / (Math.cos(rad(lat)) * Math.cos(rad(delta)));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return 180;
    return deg(Math.acos(cosHA));
  };

  // Convention determination (Egypt Authority: Fajr 19.5, Isha 17.5)
  const isEgypt = method === "Egypt" || tzName === "Africa/Cairo" || (lat >= 21 && lat <= 32 && lng >= 24 && lng <= 37);
  const fajrAngle = isEgypt ? -19.5 : (method === "Makkah" ? -18.5 : -18.0);
  const ishaAngle = isEgypt ? -17.5 : (method === "Makkah" ? -19.0 : -17.0);
  const sunAngle = -0.833;

  const haSunrise = hourAngle(sunAngle);
  const haFajr = hourAngle(fajrAngle);
  const haIsha = hourAngle(ishaAngle);

  // Asr sun altitude (ratio = 1 for Shafi'i/Hanbali/Maliki & Egyptian Survey)
  const asrAlt = deg(Math.atan(1 / (1 + Math.tan(rad(Math.abs(lat - delta))))));
  const haAsr = hourAngle(asrAlt);

  const fajrMinutes = noonMinutes - (haFajr / 15) * 60;
  const sunriseMinutes = noonMinutes - (haSunrise / 15) * 60;
  const dhuhrMinutes = noonMinutes + 1;
  const asrMinutes = noonMinutes + (haAsr / 15) * 60;
  const maghribMinutes = noonMinutes + (haSunrise / 15) * 60 + 1.5;
  const ishaMinutes = method === "Makkah"
    ? maghribMinutes + 90
    : noonMinutes + (haIsha / 15) * 60;

  const formatMinutes = (totalMinutes: number): { formatted: string; formattedArabic: string; date: Date } => {
    const validMinutes = (totalMinutes + 1440) % 1440;
    const hours = Math.floor(validMinutes / 60);
    const mins = Math.floor(validMinutes % 60);

    const d = new Date(date);
    d.setHours(hours, mins, 0, 0);

    const isPM = hours >= 12;
    const h12 = hours % 12 || 12;
    const hStr = String(h12).padStart(2, "0");
    const mStr = String(mins).padStart(2, "0");

    const formatted = `${hStr}:${mStr} ${isPM ? "PM" : "AM"}`;
    const formattedArabic = `${hStr}:${mStr} ${isPM ? "م" : "ص"}`;

    return { formatted, formattedArabic, date: d };
  };

  const f = formatMinutes(fajrMinutes);
  const s = formatMinutes(sunriseMinutes);
  const dh = formatMinutes(dhuhrMinutes);
  const aM = formatMinutes(asrMinutes);
  const mG = formatMinutes(maghribMinutes);
  const ish = formatMinutes(ishaMinutes);

  return {
    Fajr: f.formatted,
    Sunrise: s.formatted,
    Dhuhr: dh.formatted,
    Asr: aM.formatted,
    Maghrib: mG.formatted,
    Isha: ish.formatted,
    arabicTimings: {
      Fajr: f.formattedArabic,
      Sunrise: s.formattedArabic,
      Dhuhr: dh.formattedArabic,
      Asr: aM.formattedArabic,
      Maghrib: mG.formattedArabic,
      Isha: ish.formattedArabic,
    },
    raw: {
      fajrDate: f.date,
      sunriseDate: s.date,
      dhuhrDate: dh.date,
      asrDate: aM.date,
      maghribDate: mG.date,
      ishaDate: ish.date,
    },
  };
}

export interface PrayerSchedule {
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  arabicTimings?: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
  };
  raw: CalculatedPrayerTimes["raw"];
}

export function calculatePrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  timezone?: string,
  method?: string
): PrayerSchedule {
  const res = computePrayerTimes(date, lat, lng, timezone, method);
  return {
    timings: {
      Fajr: res.Fajr,
      Sunrise: res.Sunrise,
      Dhuhr: res.Dhuhr,
      Asr: res.Asr,
      Maghrib: res.Maghrib,
      Isha: res.Isha,
    },
    arabicTimings: res.arabicTimings,
    raw: res.raw,
  };
}

// Next upcoming prayer finder based on actual scheduled dates
export function getNextPrayer(
  schedule: PrayerSchedule,
  now: Date = new Date()
): {
  name: string;
  arabicName: string;
  timeString: string;
  remainingMs: number;
} {
  const items = [
    { name: "Fajr", arabic: "الفجر", date: schedule.raw.fajrDate, timeStr: schedule.timings.Fajr },
    { name: "Sunrise", arabic: "الشروق", date: schedule.raw.sunriseDate, timeStr: schedule.timings.Sunrise },
    { name: "Dhuhr", arabic: "الظهر", date: schedule.raw.dhuhrDate, timeStr: schedule.timings.Dhuhr },
    { name: "Asr", arabic: "العصر", date: schedule.raw.asrDate, timeStr: schedule.timings.Asr },
    { name: "Maghrib", arabic: "المغرب", date: schedule.raw.maghribDate, timeStr: schedule.timings.Maghrib },
    { name: "Isha", arabic: "العشاء", date: schedule.raw.ishaDate, timeStr: schedule.timings.Isha },
  ];

  for (const item of items) {
    const diff = item.date.getTime() - now.getTime();
    if (diff > 0) {
      return {
        name: item.name,
        arabicName: item.arabic,
        timeString: item.timeStr,
        remainingMs: diff,
      };
    }
  }

  // Past Isha -> tomorrow's Fajr
  const tomorrowFajr = new Date(schedule.raw.fajrDate);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return {
    name: "Fajr",
    arabicName: "الفجر",
    timeString: schedule.timings.Fajr,
    remainingMs: Math.max(0, tomorrowFajr.getTime() - now.getTime()),
  };
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

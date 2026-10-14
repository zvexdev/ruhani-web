// Precise astronomical calculation for Islamic prayer times & Qibla bearing
// Implements standard solar equations with high accuracy.

export interface CalculatedPrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
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
  country: string;
  lat: number;
  lng: number;
  timezone?: string;
}

export const POPULAR_CITIES: CityPreset[] = [
  { name: "Makkah", country: "Saudi Arabia", lat: 21.4225, lng: 39.8262, timezone: "Asia/Riyadh" },
  { name: "Madinah", country: "Saudi Arabia", lat: 24.5247, lng: 39.5692, timezone: "Asia/Riyadh" },
  { name: "Cairo", country: "Egypt", lat: 30.0444, lng: 31.2357, timezone: "Africa/Cairo" },
  { name: "Jerusalem", country: "Palestine", lat: 31.7683, lng: 35.2137, timezone: "Asia/Jerusalem" },
  { name: "Istanbul", country: "Turkey", lat: 41.0082, lng: 28.9784, timezone: "Europe/Istanbul" },
  { name: "Dubai", country: "UAE", lat: 25.2048, lng: 55.2708, timezone: "Asia/Dubai" },
  { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, timezone: "Europe/London" },
  { name: "New York", country: "United States", lat: 40.7128, lng: -74.006, timezone: "America/New_York" },
  { name: "Kuala Lumpur", country: "Malaysia", lat: 3.139, lng: 101.6869, timezone: "Asia/Kuala_Lumpur" },
  { name: "Jakarta", country: "Indonesia", lat: -6.2088, lng: 106.8456, timezone: "Asia/Jakarta" },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, timezone: "Europe/Paris" },
  { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832, timezone: "America/Toronto" },
];

export const CITY_PRESETS = POPULAR_CITIES;

// Helper trigonometric functions in degrees
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

// Calculate Qibla direction from any latitude and longitude
export function calculateQibla(lat: number, lng: number): { bearing: number; distanceKm: number } {
  const kaabaLat = 21.422487;
  const kaabaLng = 39.826206;

  const phi1 = rad(lat);
  const phi2 = rad(kaabaLat);
  const deltaLambda = rad(kaabaLng - lng);

  const y = Math.sin(deltaLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(deltaLambda);

  let qiblaDeg = deg(Math.atan2(y, x));
  qiblaDeg = (qiblaDeg + 360) % 360;

  // Great-circle distance using Haversine formula
  const R = 6371; // Earth radius in km
  const dLat = phi2 - phi1;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c);

  return { bearing: Math.round(qiblaDeg * 10) / 10, distanceKm };
}

export const calculateQiblaDirection = (lat: number, lng: number) => calculateQibla(lat, lng).bearing;
export const calculateDistanceToKaaba = (lat: number, lng: number) => calculateQibla(lat, lng).distanceKm;

// Calculate prayer times mathematically
export function computePrayerTimes(date: Date, lat: number, lng: number): CalculatedPrayerTimes {
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
  const timezoneOffsetHours = -date.getTimezoneOffset() / 60;
  const noonMinutes = 12 * 60 - EqT - (lng / 15 - timezoneOffsetHours) * 60;

  // Hour angle helper
  const hourAngle = (angle: number): number => {
    const cosHA = (Math.sin(rad(angle)) - Math.sin(rad(lat)) * Math.sin(rad(delta))) / (Math.cos(rad(lat)) * Math.cos(delta));
    if (cosHA > 1) return 0;
    if (cosHA < -1) return 180;
    return deg(Math.acos(cosHA));
  };

  // Angle parameters (MWL / standard: Fajr 18°, Isha 17°, Sunrise/Sunset -0.833°)
  const fajrAngle = -18;
  const ishaAngle = -17;
  const sunAngle = -0.833;

  const haSunrise = hourAngle(sunAngle);
  const haFajr = hourAngle(fajrAngle);
  const haIsha = hourAngle(ishaAngle);

  // Asr shadow ratio (Standard Shafi/Maliki/Hanbali: ratio = 1)
  const asrAngle = -deg(Math.atan(1 + Math.tan(rad(Math.abs(lat - delta)))));
  const haAsr = hourAngle(asrAngle);

  const fajrMinutes = noonMinutes - (haFajr / 15) * 60;
  const sunriseMinutes = noonMinutes - (haSunrise / 15) * 60;
  const dhuhrMinutes = noonMinutes + 2; // small precaution margin
  const asrMinutes = noonMinutes + (haAsr / 15) * 60;
  const maghribMinutes = noonMinutes + (haSunrise / 15) * 60 + 2;
  const ishaMinutes = noonMinutes + (haIsha / 15) * 60;

  const formatMinutes = (totalMinutes: number): { formatted: string; date: Date } => {
    const validMinutes = (totalMinutes + 1440) % 1440;
    const hours = Math.floor(validMinutes / 60);
    const mins = Math.floor(validMinutes % 60);

    const d = new Date(date);
    d.setHours(hours, mins, 0, 0);

    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    const formatted = `${String(h12).padStart(2, "0")}:${String(mins).padStart(2, "0")} ${period}`;

    return { formatted, date: d };
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
  raw: CalculatedPrayerTimes["raw"];
}

export function calculatePrayerTimes(date: Date, lat: number, lng: number): PrayerSchedule {
  const res = computePrayerTimes(date, lat, lng);
  return {
    timings: {
      Fajr: res.Fajr,
      Sunrise: res.Sunrise,
      Dhuhr: res.Dhuhr,
      Asr: res.Asr,
      Maghrib: res.Maghrib,
      Isha: res.Isha,
    },
    raw: res.raw,
  };
}

// Next upcoming prayer finder with time difference
export function getNextPrayer(timings: PrayerSchedule["timings"], now: Date = new Date()): {
  name: string;
  arabicName: string;
  timeString: string;
  remainingMs: number;
} {
  const currentCalc = computePrayerTimes(now, 21.4225, 39.8262);
  const schedule = [
    { name: "Fajr", arabic: "الفجر", date: currentCalc.raw.fajrDate, timeStr: timings.Fajr },
    { name: "Sunrise", arabic: "الشروق", date: currentCalc.raw.sunriseDate, timeStr: timings.Sunrise },
    { name: "Dhuhr", arabic: "الظهر", date: currentCalc.raw.dhuhrDate, timeStr: timings.Dhuhr },
    { name: "Asr", arabic: "العصر", date: currentCalc.raw.asrDate, timeStr: timings.Asr },
    { name: "Maghrib", arabic: "المغرب", date: currentCalc.raw.maghribDate, timeStr: timings.Maghrib },
    { name: "Isha", arabic: "العشاء", date: currentCalc.raw.ishaDate, timeStr: timings.Isha },
  ];

  for (const item of schedule) {
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

  // If past Isha, next prayer is tomorrow's Fajr
  const tomorrowFajr = new Date(currentCalc.raw.fajrDate);
  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
  return {
    name: "Fajr",
    arabicName: "الفجر",
    timeString: timings.Fajr,
    remainingMs: tomorrowFajr.getTime() - now.getTime(),
  };
}

export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

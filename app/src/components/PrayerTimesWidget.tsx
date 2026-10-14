import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Compass,
  MapPin,
  Clock,
  Bell,
  Sun,
  Sunset,
  Sunrise,
  Moon,
  ChevronDown
} from "lucide-react";
import {
  CITY_PRESETS,
  calculatePrayerTimes,
  getNextPrayer,
  formatCountdown,
  type PrayerSchedule,
  type CityPreset
} from "../lib/prayerTimes";
import { soundEffects } from "../lib/sound";
import { useLanguage } from "../context/LanguageContext";

export default function PrayerTimesWidget() {
  const { isArabic, t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState(CITY_PRESETS[0]);
  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null);
  const [now, setNow] = useState(new Date());
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [locating, setLocating] = useState(false);

  // Update schedule when city changes
  useEffect(() => {
    const calc = calculatePrayerTimes(now, selectedCity.lat, selectedCity.lng);
    setSchedule(calc);
  }, [selectedCity]);

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      const current = new Date();
      setNow(current);
      // Recalculate schedule if midnight passes
      if (current.getSeconds() === 0 && current.getMinutes() === 0) {
        setSchedule(calculatePrayerTimes(current, selectedCity.lat, selectedCity.lng));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedCity]);

  // Request browser geolocation
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSelectedCity({
          name: "Current Location",
          country: "Auto-detected",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocating(false);
        setShowCityPicker(false);
      },
      () => {
        setLocating(false);
        alert("Could not retrieve your location. Showing default city.");
      }
    );
  };

  const nextPrayer = schedule ? getNextPrayer(schedule.timings, now) : null;

  const prayers = [
    { key: "Fajr", label: "Fajr", arabic: "الفجر", icon: Sunrise, time: schedule?.timings.Fajr },
    { key: "Sunrise", label: "Sunrise", arabic: "الشروق", icon: Sun, time: schedule?.timings.Sunrise },
    { key: "Dhuhr", label: "Dhuhr", arabic: "الظهر", icon: Sun, time: schedule?.timings.Dhuhr },
    { key: "Asr", label: "Asr", arabic: "العصر", icon: Sunset, time: schedule?.timings.Asr },
    { key: "Maghrib", label: "Maghrib", arabic: "المغرب", icon: Sunset, time: schedule?.timings.Maghrib },
    { key: "Isha", label: "Isha", arabic: "العشاء", icon: Moon, time: schedule?.timings.Isha },
  ];

  const playPreviewChime = () => {
    soundEffects.playAthanChime();
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden border border-emerald-800/40">
      {/* Decorative Arabesque background glow */}
      <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Header with City & Next Prayer badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-emerald-300/80 text-xs font-semibold tracking-wider uppercase mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{isArabic ? "مواقيت الصلاة الإسلامية" : "Islamic Prayer Times"}</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowCityPicker(!showCityPicker)}
              className="flex items-center gap-2 text-xl md:text-2xl font-bold text-white hover:text-emerald-200 transition-colors"
            >
              <MapPin className="w-5 h-5 text-amber-400" />
              <span>{selectedCity.name}</span>
              <span className="text-xs text-white/50 font-normal">({selectedCity.country})</span>
              <ChevronDown className={`w-4 h-4 text-emerald-300 transition-transform ${showCityPicker ? "rotate-180" : ""}`} />
            </button>

            {/* City Selection Dropdown */}
            {showCityPicker && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-emerald-700/40 p-2 shadow-2xl z-50">
                <button
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-emerald-800/50 text-emerald-300 text-xs font-medium transition-colors border-b border-emerald-800/40 mb-1"
                >
                  <Compass className="w-4 h-4" />
                  {locating ? (isArabic ? "جارٍ تحديد الموقع..." : "Locating...") : (isArabic ? "استخدام موقعي الحالي (GPS)" : "Use My Exact Location (GPS)")}
                </button>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {CITY_PRESETS.map((city: CityPreset) => (
                    <button
                      key={city.name}
                      onClick={() => {
                        setSelectedCity(city);
                        setShowCityPicker(false);
                      }}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left transition-colors ${
                        city.name === selectedCity.name
                          ? "bg-emerald-700/60 text-white font-semibold"
                          : "text-white/80 hover:bg-white/10"
                      }`}
                    >
                      <span>{city.name}</span>
                      <span className="text-white/40">{city.country}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Prayer Countdown Callout */}
        {nextPrayer && (
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-300 font-medium">
                {isArabic ? "الصلاة القادمة:" : "Next:"} <span className="font-bold text-white">{isArabic ? (prayers.find(p => p.key === nextPrayer.name)?.arabic || nextPrayer.name) : nextPrayer.name}</span>
              </p>
              <p className="text-xl md:text-2xl font-mono font-bold text-amber-300">
                {formatCountdown(nextPrayer.remainingMs)}
              </p>
            </div>
            <button
              onClick={playPreviewChime}
              title={isArabic ? "سماع نغمة الأذان" : "Preview prayer chime"}
              className="p-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 6 Prayer Times Horizontal/Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 relative z-10">
        {prayers.map((prayer) => {
          const isNext = nextPrayer?.name === prayer.key;
          const Icon = prayer.icon;

          return (
            <motion.div
              key={prayer.key}
              whileHover={{ y: -3 }}
              className={`rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 ${
                isNext
                  ? "bg-gradient-to-b from-amber-500/25 to-amber-600/10 border-2 border-amber-400/80 shadow-lg shadow-amber-500/20"
                  : "bg-white/5 border border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className={`w-4 h-4 ${isNext ? "text-amber-300" : "text-emerald-400"}`} />
                <span className="font-['Amiri'] text-xs text-white/60">{prayer.arabic}</span>
              </div>
              <div>
                <p className={`text-xs font-semibold ${isNext ? "text-amber-200" : "text-white/70"}`}>
                  {isArabic ? prayer.arabic : prayer.label}
                </p>
                <p className="text-xl font-bold tracking-tight text-white mt-0.5">
                  {prayer.time || "--:--"}
                </p>
              </div>
              {isNext && (
                <div className="mt-2 text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  {t.upcoming}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

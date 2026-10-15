import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  type CityPreset
} from "../lib/prayerTimes";
import { soundEffects } from "../lib/sound";
import { useLanguage } from "../context/LanguageContext";

function getInitialCity(): CityPreset {
  const saved = localStorage.getItem("ruhani-selected-city");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.lat && parsed?.lng) return parsed;
    } catch (e) {
      console.debug("Failed parsing saved city:", e);
    }
  }
  // Default to Cairo, Egypt
  return CITY_PRESETS[0];
}

export default function PrayerTimesWidget() {
  const { isArabic, t } = useLanguage();
  const [selectedCity, setSelectedCity] = useState<CityPreset>(getInitialCity);
  const [now, setNow] = useState(() => new Date());
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [locating, setLocating] = useState(false);

  // Derive schedule whenever city or date changes
  const schedule = useMemo(() => {
    return calculatePrayerTimes(
      now,
      selectedCity.lat,
      selectedCity.lng,
      selectedCity.timezone,
      selectedCity.method
    );
  }, [now, selectedCity]);

  // Live timer tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Request browser geolocation with fallback to Cairo
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert(isArabic ? "خدمة تحديد الموقع الجغرافي غير مدعومة في متصفحك" : "Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detectedCity: CityPreset = {
          name: "Current Location",
          arabicName: "موقعي الحالي",
          country: "GPS Detected",
          arabicCountry: "تحديد الموقع (GPS)",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Cairo",
          method: "Egypt",
        };
        setSelectedCity(detectedCity);
        localStorage.setItem("ruhani-selected-city", JSON.stringify(detectedCity));
        setLocating(false);
        setShowCityPicker(false);
      },
      () => {
        setLocating(false);
        alert(isArabic ? "تعذر تحديد موقعك الحالي. تم التبديل إلى القاهرة." : "Could not retrieve your location. Showing Cairo by default.");
      }
    );
  };

  const handleSelectCity = (city: CityPreset) => {
    setSelectedCity(city);
    localStorage.setItem("ruhani-selected-city", JSON.stringify(city));
    setShowCityPicker(false);
  };

  const nextPrayer = schedule ? getNextPrayer(schedule, now) : null;

  const prayers = [
    { key: "Fajr", label: "Fajr", arabic: "الفجر", icon: Sunrise, time: schedule?.timings.Fajr, arabicTime: schedule?.arabicTimings?.Fajr },
    { key: "Sunrise", label: "Sunrise", arabic: "الشروق", icon: Sun, time: schedule?.timings.Sunrise, arabicTime: schedule?.arabicTimings?.Sunrise },
    { key: "Dhuhr", label: "Dhuhr", arabic: "الظهر", icon: Sun, time: schedule?.timings.Dhuhr, arabicTime: schedule?.arabicTimings?.Dhuhr },
    { key: "Asr", label: "Asr", arabic: "العصر", icon: Sunset, time: schedule?.timings.Asr, arabicTime: schedule?.arabicTimings?.Asr },
    { key: "Maghrib", label: "Maghrib", arabic: "المغرب", icon: Sunset, time: schedule?.timings.Maghrib, arabicTime: schedule?.arabicTimings?.Maghrib },
    { key: "Isha", label: "Isha", arabic: "العشاء", icon: Moon, time: schedule?.timings.Isha, arabicTime: schedule?.arabicTimings?.Isha },
  ];

  const playPreviewChime = () => {
    soundEffects.playAthanChime();
  };

  const displayName = isArabic && selectedCity.arabicName ? selectedCity.arabicName : selectedCity.name;
  const displayCountry = isArabic && selectedCity.arabicCountry ? selectedCity.arabicCountry : selectedCity.country;

  return (
    <div className="bg-gradient-to-br from-emerald-950 via-neutral-950 to-black text-white rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl relative border border-emerald-800/40">
      {/* Decorative Arabesque background glow (contained safely) */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      {/* Header with City & Next Prayer badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 relative z-20">
        <div>
          <div className="flex items-center gap-2 text-emerald-300/80 text-xs font-semibold tracking-wider uppercase mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{isArabic ? "مواقيت الصلاة الإسلامية" : "Islamic Prayer Times"}</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowCityPicker((prev) => !prev)}
              className="flex items-center gap-2 text-xl md:text-2xl font-bold text-white hover:text-emerald-200 transition-colors py-1 rounded-xl"
            >
              <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
              <span>{displayName}</span>
              <span className="text-xs text-white/60 font-normal">({displayCountry})</span>
              <ChevronDown className={`w-4 h-4 text-emerald-300 transition-transform duration-200 ${showCityPicker ? "rotate-180" : ""}`} />
            </button>

            {/* Backdrop Dismiss Overlay */}
            {showCityPicker && (
              <div
                className="fixed inset-0 z-[55]"
                onClick={() => setShowCityPicker(false)}
              />
            )}

            {/* City Selection Dropdown with elevated z-index */}
            <AnimatePresence>
              {showCityPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full mt-2 ltr:left-0 rtl:right-0 w-80 max-w-[90vw] bg-neutral-900 border border-emerald-500/40 rounded-2xl p-2.5 shadow-2xl z-[60] text-start"
                >
                  <button
                    onClick={handleDetectLocation}
                    disabled={locating}
                    className="w-full flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-800/60 text-emerald-300 text-xs font-semibold transition-colors border border-emerald-800/50 mb-2"
                  >
                    <Compass className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
                    <span>
                      {locating
                        ? (isArabic ? "جارٍ تحديد موقعك الجغرافي..." : "Detecting GPS location...")
                        : (isArabic ? "استخدام موقعي الحالي (GPS)" : "Use My Exact Location (GPS)")}
                    </span>
                  </button>

                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/40 px-2 py-1">
                    {isArabic ? "المدن والمحافظات الشائعة" : "Popular Cities & Governorates"}
                  </p>

                  <div className="max-h-64 overflow-y-auto space-y-1 pr-1 pb-3 custom-scrollbar">
                    {CITY_PRESETS.map((city: CityPreset) => {
                      const isCurrent = city.name === selectedCity.name;
                      const cityName = isArabic && city.arabicName ? city.arabicName : city.name;
                      const citySub = isArabic ? city.name : city.arabicName;
                      const countryName = isArabic && city.arabicCountry ? city.arabicCountry : city.country;

                      return (
                        <button
                          key={city.name}
                          onClick={() => handleSelectCity(city)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                            isCurrent
                              ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-900/30"
                              : "text-white/85 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="truncate">{cityName}</span>
                            {citySub && (
                              <span className="text-[10px] text-white/50 truncate font-normal">
                                ({citySub})
                              </span>
                            )}
                          </div>
                          <span className={`text-[11px] shrink-0 font-normal ${isCurrent ? "text-emerald-100" : "text-white/50"}`}>
                            {countryName}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Next Prayer Countdown Callout */}
        {nextPrayer && (
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 shadow-inner">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-emerald-300 font-medium">
                {isArabic ? "الصلاة القادمة:" : "Next:"}{" "}
                <span className="font-bold text-white">
                  {isArabic ? (prayers.find((p) => p.key === nextPrayer.name)?.arabic || nextPrayer.name) : nextPrayer.name}
                </span>
              </p>
              <p className="text-xl md:text-2xl font-mono font-bold text-amber-300" dir="ltr">
                {formatCountdown(nextPrayer.remainingMs)}
              </p>
            </div>
            <button
              onClick={playPreviewChime}
              title={isArabic ? "سماع نغمة التنبيه" : "Preview prayer chime"}
              className="p-2.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 transition-colors"
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 6 Prayer Times Horizontal/Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 relative z-10">
        {prayers.map((prayer) => {
          const isNext = nextPrayer?.name === prayer.key;
          const Icon = prayer.icon;

          return (
            <motion.div
              key={prayer.key}
              whileHover={{ y: -3 }}
              className={`rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all duration-300 ${
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
                {/* Render with dir='ltr' to prevent BiDi text reversal */}
                <p className="mt-1">
                  <span dir="ltr" className="inline-block font-sans text-xl font-bold tracking-tight text-white">
                    {isArabic && prayer.arabicTime ? prayer.arabicTime : (prayer.time || "--:--")}
                  </span>
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

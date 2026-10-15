import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, MapPin, Navigation, Info, ChevronDown } from "lucide-react";
import { CITY_PRESETS, calculateQiblaDirection, calculateDistanceToKaaba, type CityPreset } from "../lib/prayerTimes";
import { useLanguage } from "../context/LanguageContext";
import { triggerCompassLockPulse } from "../lib/animations";

function getInitialCity(): CityPreset {
  const saved = localStorage.getItem("ruhani-selected-city");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.lat && parsed?.lng) return parsed;
    } catch (e) {
      console.debug("Error parsing initial city:", e);
    }
  }
  // Default to Cairo, Egypt
  return CITY_PRESETS[0];
}

interface ExtendedDeviceOrientationEvent extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

export default function QiblaCompass() {
  const { t, isArabic } = useLanguage();
  const dialRef = useRef<HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState<CityPreset>(getInitialCity);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [hasCompassSupport, setHasCompassSupport] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);

  const qiblaAngle = calculateQiblaDirection(selectedCity.lat, selectedCity.lng);
  const distanceKm = calculateDistanceToKaaba(selectedCity.lat, selectedCity.lng);

  // Check device orientation / compass sensor
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading for iOS, alpha for Android
      const extended = e as ExtendedDeviceOrientationEvent;
      const heading = extended.webkitCompassHeading !== undefined ? extended.webkitCompassHeading : (e.alpha !== null ? 360 - e.alpha : null);
      if (heading !== null) {
        setDeviceHeading(heading);
        setHasCompassSupport(true);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert(isArabic ? "خدمة تحديد الموقع الجغرافي غير مدعومة في متصفحك" : "Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const detected: CityPreset = {
          name: "Current Location",
          arabicName: "موقعي الحالي",
          country: "GPS Detected",
          arabicCountry: "تحديد الموقع (GPS)",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Cairo",
          method: "Egypt",
        };
        setSelectedCity(detected);
        try {
          localStorage.setItem("ruhani-selected-city", JSON.stringify(detected));
        } catch (e) {
          console.debug("Failed saving city in QiblaCompass:", e);
        }
        setLocating(false);
        setShowCityPicker(false);
        triggerCompassLockPulse(dialRef.current);
      },
      () => {
        setLocating(false);
        alert(isArabic ? "تعذر تحديد الموقع. تم التبديل إلى القاهرة." : "Unable to retrieve location coordinates. Showing Cairo by default.");
      }
    );
  };

  const handleSelectCity = (city: CityPreset) => {
    setSelectedCity(city);
    try {
      localStorage.setItem("ruhani-selected-city", JSON.stringify(city));
    } catch (e) {
      console.debug("Failed saving city in QiblaCompass:", e);
    }
    setShowCityPicker(false);
    triggerCompassLockPulse(dialRef.current);
  };

  // Compass needle rotation: if device compass is supported, rotate relative to phone heading
  const needleRotation = deviceHeading !== null ? qiblaAngle - deviceHeading : qiblaAngle;

  const cityName = isArabic && selectedCity.arabicName ? selectedCity.arabicName : selectedCity.name;
  const countryName = isArabic && selectedCity.arabicCountry ? selectedCity.arabicCountry : selectedCity.country;

  return (
    <div className="spiritual-card rounded-3xl p-5 sm:p-7 md:p-10 border border-emerald-900/30 shadow-2xl max-w-xl mx-auto relative overflow-visible">
      <div className="absolute inset-0 bg-arabesque-stars opacity-10 pointer-events-none rounded-3xl overflow-hidden" />

      {/* Title & Location selector */}
      <div className="text-center mb-4 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Compass className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} />
          <span>{t.qiblaFinderBadge}</span>
        </div>

        {/* Location Dropdown / GPS Button */}
        <div className="mt-2 inline-block relative">
          <button
            onClick={() => setShowCityPicker(!showCityPicker)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-full border border-neutral-200 dark:border-neutral-800 text-sm font-medium text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors min-h-[44px]"
          >
            <MapPin className="w-4 h-4 text-[#1A5D3A] dark:text-emerald-400" />
            <span>{cityName}، {countryName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${showCityPicker ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showCityPicker && (
              <>
                {/* Backdrop dismiss overlay */}
                <div
                  className="fixed inset-0 z-[55]"
                  onClick={() => setShowCityPicker(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 max-w-[90vw] spiritual-card rounded-2xl border border-neutral-200 dark:border-neutral-800 p-2.5 shadow-2xl z-[60] text-start bg-white dark:bg-black"
                >
                  <button
                    onClick={handleDetectLocation}
                    disabled={locating}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#1A5D3A] dark:text-emerald-300 text-xs font-semibold transition-colors border-b border-neutral-100 dark:border-neutral-800 mb-2 min-h-[44px]"
                  >
                    <Navigation className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
                    <span>{locating ? t.qiblaDetecting : t.qiblaDetectGPS}</span>
                  </button>
                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1 pb-3 custom-scrollbar">
                    {CITY_PRESETS.map((city: CityPreset) => {
                      const isCurrent = city.name === selectedCity.name;
                      const cName = isArabic && city.arabicName ? city.arabicName : city.name;
                      const cSub = isArabic ? city.name : city.arabicName;
                      const cCountry = isArabic && city.arabicCountry ? city.arabicCountry : city.country;

                      return (
                        <button
                          key={city.name}
                          onClick={() => handleSelectCity(city)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors min-h-[40px] ${
                            isCurrent
                              ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-300/40 dark:border-emerald-800/40"
                              : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="truncate">{cName}</span>
                            {cSub && (
                              <span className="text-[10px] text-neutral-400 truncate font-normal">
                                ({cSub})
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-400 shrink-0 font-normal">{cCountry}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Compass Dial Graphic (Responsive 224px to 320px) */}
      <div ref={dialRef} className="relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 mx-auto my-6 flex items-center justify-center">
        {/* Outer Circular Ring with Degree ticks */}
        <div className="absolute inset-0 rounded-full border-4 border-emerald-900/20 dark:border-emerald-500/30 shadow-inner flex items-center justify-center bg-radial from-transparent to-emerald-950/10 dark:to-emerald-950/30">
          {/* Cardinal Directions */}
          <span className="absolute top-3 font-bold text-sm text-red-500 drop-shadow-sm">N</span>
          <span className="absolute bottom-3 font-bold text-sm text-neutral-400">S</span>
          <span className="absolute right-4 font-bold text-sm text-neutral-400">E</span>
          <span className="absolute left-4 font-bold text-sm text-neutral-400">W</span>

          {/* Compass Rose Dial ticks */}
          <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 rounded-full border border-dashed border-emerald-600/30 dark:border-emerald-400/20" />
        </div>

        {/* Animated Qibla Needle */}
        <motion.div
          className="absolute w-full h-full flex flex-col items-center justify-center pointer-events-none"
          animate={{ rotate: needleRotation }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          {/* Needle Top (pointing to Kaaba) */}
          <div className="flex flex-col items-center">
            {/* Kaaba Vector Emblem (Clean SVG instead of emoji) */}
            <div className="w-10 h-10 rounded-xl bg-neutral-950 text-amber-400 flex items-center justify-center shadow-xl border-2 border-amber-400/90 mb-1 relative overflow-hidden">
              <svg viewBox="0 0 32 32" className="w-6 h-6 text-amber-400" fill="currentColor">
                <rect x="4" y="6" width="24" height="22" rx="2" fill="#080808" stroke="#f59e0b" strokeWidth="1.5" />
                <rect x="4" y="11" width="24" height="3" fill="#f59e0b" />
                <rect x="19" y="16" width="5" height="10" rx="1" fill="#fbbf24" />
              </svg>
            </div>
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[40px] border-b-emerald-600 dark:border-b-emerald-400 filter drop-shadow" />
          </div>

          {/* Needle Center Pin */}
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-4 border-white dark:border-black shadow-md my-0" />

          {/* Needle Bottom (Tail) */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[30px] border-t-neutral-400 dark:border-t-neutral-700" />
        </motion.div>
      </div>

      {/* Degrees & Distance Info Card */}
      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800/80 text-center relative z-10">
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/40">
          <p className="text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-semibold">
            {t.qiblaDirectionToKaaba}
          </p>
          <p className="text-2xl font-bold text-[#1A5D3A] dark:text-emerald-300 mt-1 font-mono">
            {qiblaAngle.toFixed(1)}°
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {isArabic ? "من الشمال الحقيقي" : "from True North"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40">
          <p className="text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400 font-semibold">
            {t.qiblaDistanceKm}
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-300 mt-1 font-mono">
            {distanceKm.toLocaleString()} <span className="text-sm">{isArabic ? "كم" : "km"}</span>
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {isArabic ? "مسافة الدائرة العظمى" : "Great Circle Distance"}
          </p>
        </div>
      </div>

      {/* Device Sensor Tip */}
      <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400 dark:text-neutral-500 justify-center relative z-10">
        <Info className="w-3.5 h-3.5" />
        <span>
          {hasCompassSupport
            ? (isArabic ? "بوصلة الهاتف الحية تعمل. حرّك هاتفك حتى تتطابق الإبرة مع الكعبة." : "Live mobile compass active. Rotate your device until needle aligns.")
            : t.qiblaCompassTip}
        </span>
      </div>
    </div>
  );
}

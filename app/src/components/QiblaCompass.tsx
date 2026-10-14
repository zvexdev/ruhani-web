import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Compass, MapPin, Navigation, Info, ChevronDown } from "lucide-react";
import { CITY_PRESETS, calculateQiblaDirection, calculateDistanceToKaaba, type CityPreset } from "../lib/prayerTimes";
import { useLanguage } from "../context/LanguageContext";

function getInitialCity(): CityPreset {
  const saved = localStorage.getItem("ruhani-selected-city");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed?.lat && parsed?.lng) return parsed;
    } catch {}
  }
  // Default to Cairo, Egypt
  return CITY_PRESETS[0];
}

export default function QiblaCompass() {
  const { t, isArabic } = useLanguage();
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
      const heading = (e as any).webkitCompassHeading || (e.alpha !== null ? 360 - e.alpha : null);
      if (heading !== null) {
        setDeviceHeading(heading);
        setHasCompassSupport(true);
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
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
        localStorage.setItem("ruhani-selected-city", JSON.stringify(detected));
        setLocating(false);
        setShowCityPicker(false);
      },
      () => {
        setLocating(false);
        alert(isArabic ? "تعذر تحديد الموقع. تم التبديل إلى القاهرة." : "Unable to retrieve location coordinates. Showing Cairo by default.");
      }
    );
  };

  const handleSelectCity = (city: CityPreset) => {
    setSelectedCity(city);
    localStorage.setItem("ruhani-selected-city", JSON.stringify(city));
    setShowCityPicker(false);
  };

  // Compass needle rotation: if device compass is supported, rotate relative to phone heading
  const needleRotation = deviceHeading !== null ? qiblaAngle - deviceHeading : qiblaAngle;

  const cityName = isArabic && selectedCity.arabicName ? selectedCity.arabicName : selectedCity.name;
  const countryName = isArabic && selectedCity.arabicCountry ? selectedCity.arabicCountry : selectedCity.country;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-emerald-100 dark:border-emerald-950 shadow-xl max-w-xl mx-auto relative">
      {/* Title & Location selector */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#1A5D3A] dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Compass className="w-3.5 h-3.5" />
          <span>{t.qiblaFinderBadge}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
          {t.qiblaTitle}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {t.qiblaSubtitle}
        </p>

        {/* Location Dropdown / GPS Button */}
        <div className="mt-4 inline-block relative">
          <button
            onClick={() => setShowCityPicker(!showCityPicker)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-slate-800 rounded-full border border-gray-200 dark:border-slate-700 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MapPin className="w-4 h-4 text-[#1A5D3A] dark:text-emerald-400" />
            <span>{cityName}، {countryName}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${showCityPicker ? "rotate-180" : ""}`} />
          </button>

          {showCityPicker && (
            <>
              {/* Backdrop dismiss overlay */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowCityPicker(false)}
              />

              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 max-w-[90vw] bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-2.5 shadow-2xl z-50 text-start">
                <button
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-[#1A5D3A] dark:text-emerald-400 text-xs font-semibold transition-colors border-b border-gray-100 dark:border-slate-700 mb-2"
                >
                  <Navigation className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
                  <span>{locating ? t.qiblaDetecting : t.qiblaDetectGPS}</span>
                </button>
                <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {CITY_PRESETS.map((city: CityPreset) => {
                    const isCurrent = city.name === selectedCity.name;
                    const cName = isArabic && city.arabicName ? city.arabicName : city.name;
                    const cSub = isArabic ? city.name : city.arabicName;
                    const cCountry = isArabic && city.arabicCountry ? city.arabicCountry : city.country;

                    return (
                      <button
                        key={city.name}
                        onClick={() => handleSelectCity(city)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                          isCurrent
                            ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 font-bold"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="truncate">{cName}</span>
                          {cSub && (
                            <span className="text-[10px] text-gray-400 truncate font-normal">
                              ({cSub})
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-gray-400 shrink-0 font-normal">{cCountry}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Compass Dial Graphic */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto my-6 flex items-center justify-center">
        {/* Outer Circular Ring with Degree ticks */}
        <div className="absolute inset-0 rounded-full border-4 border-emerald-900/10 dark:border-emerald-500/20 shadow-inner flex items-center justify-center">
          {/* Cardinal Directions */}
          <span className="absolute top-3 font-bold text-sm text-red-500">N</span>
          <span className="absolute bottom-3 font-bold text-sm text-gray-400">S</span>
          <span className="absolute right-4 font-bold text-sm text-gray-400">E</span>
          <span className="absolute left-4 font-bold text-sm text-gray-400">W</span>

          {/* Compass Rose Dial ticks */}
          <div className="w-48 h-48 md:w-60 md:h-60 rounded-full border border-dashed border-emerald-600/30 dark:border-emerald-400/20" />
        </div>

        {/* Animated Qibla Needle */}
        <motion.div
          className="absolute w-full h-full flex flex-col items-center justify-center pointer-events-none"
          animate={{ rotate: needleRotation }}
          transition={{ type: "spring", stiffness: 60, damping: 15 }}
        >
          {/* Needle Top (pointing to Kaaba) */}
          <div className="flex flex-col items-center">
            {/* Kaaba Icon / Marker */}
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shadow-lg border-2 border-amber-400 font-bold text-xs mb-1">
              🕋
            </div>
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[40px] border-b-emerald-600 dark:border-b-emerald-400" />
          </div>

          {/* Needle Center Pin */}
          <div className="w-6 h-6 rounded-full bg-amber-400 border-4 border-white dark:border-slate-900 shadow-md my-0" />

          {/* Needle Bottom (Tail) */}
          <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[30px] border-t-gray-300 dark:border-t-slate-700" />
        </motion.div>
      </div>

      {/* Degrees & Distance Info Card */}
      <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <p className="text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-semibold">
            {t.qiblaDirectionToKaaba}
          </p>
          <p className="text-2xl font-bold text-[#1A5D3A] dark:text-emerald-300 mt-1 font-mono">
            {qiblaAngle.toFixed(1)}°
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {isArabic ? "من الشمال الحقيقي" : "from True North"}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
          <p className="text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400 font-semibold">
            {t.qiblaDistanceKm}
          </p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-300 mt-1 font-mono">
            {distanceKm.toLocaleString()} <span className="text-sm">{isArabic ? "كم" : "km"}</span>
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
            {isArabic ? "مسافة الدائرة العظمى" : "Great Circle Distance"}
          </p>
        </div>
      </div>

      {/* Device Sensor Tip */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 justify-center">
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

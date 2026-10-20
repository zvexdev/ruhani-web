import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  MapPin,
  Navigation,
  Info,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Smartphone,
  ShieldCheck
} from "lucide-react";
import {
  CITY_PRESETS,
  calculateQiblaDirection,
  calculateDistanceToKaaba,
  getCompassDirection,
  type CityPreset
} from "../lib/prayerTimes";
import { useLanguage } from "../context/LanguageContext";
import { triggerCompassLockPulse } from "../lib/animations";
import { soundEffects } from "../lib/sound";

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
  webkitCompassAccuracy?: number;
}

// Helper to calculate shortest continuous rotation angle to avoid 360° flip-spinning
function getShortestAngle(target: number, current: number): number {
  let delta = (target - current) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return current + delta;
}

export default function QiblaCompass() {
  const { t, isArabic } = useLanguage();
  const dialRef = useRef<HTMLDivElement>(null);

  // Location & Geolocation state
  const [selectedCity, setSelectedCity] = useState<CityPreset>(getInitialCity);
  const [locating, setLocating] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<"idle" | "acquiring" | "granted" | "denied" | "error">("idle");
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(selectedCity.accuracy || null);
  const [isGpsActive, setIsGpsActive] = useState<boolean>(Boolean(selectedCity.isGps));
  const [showCityPicker, setShowCityPicker] = useState<boolean>(false);

  // Compass Sensor & Orientation state
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [hasCompassSupport, setHasCompassSupport] = useState<boolean>(false);
  const [iosNeedsPermission, setIosNeedsPermission] = useState<boolean>(false);

  // Continuous smoothed angles for buttery-smooth Framer Motion rotation
  const [needleRotation, setNeedleRotation] = useState<number>(0);
  const [dialRotation, setDialRotation] = useState<number>(0);
  const prevNeedleRef = useRef<number>(0);
  const prevDialRef = useRef<number>(0);

  // Kaaba lock celebration state
  const [isFacingKaaba, setIsFacingKaaba] = useState<boolean>(false);
  const wasFacingRef = useRef<boolean>(false);

  // Precise mathematical bearing and distance
  const qiblaAngle = calculateQiblaDirection(selectedCity.lat, selectedCity.lng);
  const distanceKm = calculateDistanceToKaaba(selectedCity.lat, selectedCity.lng);
  const compassCardinal = getCompassDirection(qiblaAngle, isArabic);

  // Reverse geocoding helper to extract authentic Arabic and English city names
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const lang = isArabic ? "ar" : "en";
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${lang}`
      );
      if (!res.ok) return null;
      const data = await res.json();
      return {
        city: data.city || data.locality || data.principalSubdivision,
        country: data.countryName
      };
    } catch {
      return null;
    }
  };

  // High-precision GPS Detection
  const handleDetectLocation = useCallback((isAutomatic = false) => {
    if (!navigator.geolocation) {
      setLocationStatus("error");
      if (!isAutomatic) {
        alert(isArabic ? "خدمة تحديد الموقع غير مدعومة في متصفحك" : "Geolocation is not supported by your browser");
      }
      return;
    }

    setLocating(true);
    setLocationStatus("acquiring");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const accuracy = Math.round(pos.coords.accuracy || 0);

        // Fetch exact city name
        const geoInfo = await reverseGeocode(lat, lng);

        const detected: CityPreset = {
          name: geoInfo?.city || "My Location",
          arabicName: geoInfo?.city || "موقعي الحالي",
          country: geoInfo?.country || "GPS Detected",
          arabicCountry: geoInfo?.country || "تحديد دقيق (GPS)",
          lat,
          lng,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Cairo",
          method: "Egypt",
          accuracy,
          isGps: true
        };

        setSelectedCity(detected);
        setLocationAccuracy(accuracy);
        setIsGpsActive(true);
        setLocationStatus("granted");
        setLocating(false);
        setShowCityPicker(false);

        try {
          localStorage.setItem("ruhani-selected-city", JSON.stringify(detected));
        } catch (e) {
          console.debug("Failed saving city in QiblaCompass:", e);
        }

        triggerCompassLockPulse(dialRef.current);
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setLocationStatus("denied");
        } else {
          setLocationStatus("error");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0 // Do not use stale cache: ensure 100% live coordinates
      }
    );
  }, [isArabic]);

  // AUTO-REQUEST ON MOUNT: If user hasn't explicitly locked in GPS, prompt immediately
  useEffect(() => {
    if (!selectedCity.isGps) {
      handleDetectLocation(true);
    } else {
      setLocationStatus("granted");
    }
  }, [handleDetectLocation, selectedCity.isGps]);

  // Request iOS DeviceOrientation Permission (iOS 13+ requirement)
  const requestIosCompassPermission = async () => {
    const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof DeviceOrientation?.requestPermission === "function") {
      try {
        const response = await DeviceOrientation.requestPermission();
        if (response === "granted") {
          setIosNeedsPermission(false);
          setHasCompassSupport(true);
        } else {
          alert(isArabic ? "تم رفض إذن مستشعر البوصلة في هاتفك." : "Compass sensor permission was denied.");
        }
      } catch (err) {
        console.warn("Error requesting iOS device orientation permission:", err);
      }
    }
  };

  // Device orientation / compass sensor event listener
  useEffect(() => {
    const DeviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<string>;
    };

    if (typeof DeviceOrientation?.requestPermission === "function") {
      setIosNeedsPermission(true);
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const ext = e as ExtendedDeviceOrientationEvent;
      let heading: number | null = null;

      // 1. iOS Safari provides direct compass heading relative to True North
      if (typeof ext.webkitCompassHeading === "number" && !isNaN(ext.webkitCompassHeading)) {
        heading = ext.webkitCompassHeading;
      }
      // 2. Android Chrome absolute compass (or standard alpha)
      else if (typeof e.alpha === "number" && !isNaN(e.alpha)) {
        heading = (360 - e.alpha) % 360;
      }

      if (heading !== null && !isNaN(heading)) {
        const normalized = (heading % 360 + 360) % 360;
        setDeviceHeading(normalized);
        setHasCompassSupport(true);
        setIosNeedsPermission(false);
      }
    };

    // Prefer deviceorientationabsolute on Android Chrome for True North accuracy
    const hasAbsolute = "ondeviceorientationabsolute" in window;
    if (hasAbsolute) {
      window.addEventListener("deviceorientationabsolute", handleOrientation as EventListener, true);
    } else if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", handleOrientation, true);
    }

    return () => {
      if (hasAbsolute) {
        window.removeEventListener("deviceorientationabsolute", handleOrientation as EventListener, true);
      }
      window.removeEventListener("deviceorientation", handleOrientation, true);
    };
  }, []);

  // Compute smooth needle and dial rotation updates
  useEffect(() => {
    // When live mobile compass heading is active:
    // Dial rotates by -deviceHeading (so N always points to physical Earth North in the room)
    // Needle points toward Qibla (qiblaAngle - deviceHeading relative to screen)
    if (deviceHeading !== null) {
      const rawDial = ((-deviceHeading % 360) + 360) % 360;
      const smoothDial = getShortestAngle(rawDial, prevDialRef.current);
      prevDialRef.current = smoothDial;
      setDialRotation(smoothDial);

      const rawNeedle = (((qiblaAngle - deviceHeading) % 360) + 360) % 360;
      const smoothNeedle = getShortestAngle(rawNeedle, prevNeedleRef.current);
      prevNeedleRef.current = smoothNeedle;
      setNeedleRotation(smoothNeedle);

      // Check Kaaba alignment (within ±5 degrees of the 12 o'clock marker)
      const diff = Math.abs(((deviceHeading - qiblaAngle + 540) % 360) - 180);
      const isAligned = diff <= 5;
      setIsFacingKaaba(isAligned);

      // Trigger celebratory chime & haptic feedback on entering alignment
      if (isAligned && !wasFacingRef.current) {
        if ("vibrate" in navigator) {
          navigator.vibrate?.([30, 40, 30]);
        }
        soundEffects.playCompletionChime();
        triggerCompassLockPulse(dialRef.current);
      }
      wasFacingRef.current = isAligned;
    } else {
      // Desktop / No-sensor mode: Dial is static (North at top), needle points to qiblaAngle
      prevDialRef.current = 0;
      setDialRotation(0);
      const smoothNeedle = getShortestAngle(qiblaAngle, prevNeedleRef.current);
      prevNeedleRef.current = smoothNeedle;
      setNeedleRotation(smoothNeedle);
      setIsFacingKaaba(false);
    }
  }, [deviceHeading, qiblaAngle]);

  const handleSelectCity = (city: CityPreset) => {
    setSelectedCity({ ...city, isGps: false });
    setIsGpsActive(false);
    setLocationStatus("idle");
    setLocationAccuracy(null);
    try {
      localStorage.setItem("ruhani-selected-city", JSON.stringify({ ...city, isGps: false }));
    } catch (e) {
      console.debug("Failed saving city in QiblaCompass:", e);
    }
    setShowCityPicker(false);
    triggerCompassLockPulse(dialRef.current);
  };

  const cityName = isArabic && selectedCity.arabicName ? selectedCity.arabicName : selectedCity.name;
  const countryName = isArabic && selectedCity.arabicCountry ? selectedCity.arabicCountry : selectedCity.country;

  return (
    <div className="spiritual-card rounded-3xl p-5 sm:p-7 md:p-10 border border-emerald-900/30 shadow-2xl max-w-xl mx-auto relative overflow-visible">
      <div className="absolute inset-0 bg-arabesque-stars opacity-10 pointer-events-none rounded-3xl overflow-hidden" />

      {/* Title & Badge */}
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
            <MapPin className={`w-4 h-4 ${isGpsActive ? "text-emerald-500" : "text-amber-500"}`} />
            <span className="font-semibold">{cityName}، {countryName}</span>
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
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 max-w-[90vw] spiritual-card rounded-2xl border border-neutral-200 dark:border-neutral-800 p-2.5 shadow-2xl z-[60] text-start bg-white dark:bg-neutral-950"
                >
                  <button
                    onClick={() => handleDetectLocation(false)}
                    disabled={locating}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500 text-white text-xs font-bold transition-all shadow hover:bg-emerald-600 mb-2 min-h-[44px]"
                  >
                    <div className="flex items-center gap-2">
                      <Navigation className={`w-4 h-4 ${locating ? "animate-spin" : ""}`} />
                      <span>{locating ? t.qiblaDetecting : t.qiblaDetectGPS}</span>
                    </div>
                    {locating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  </button>

                  <p className="text-[10px] text-neutral-400 px-2 py-1 font-semibold uppercase">
                    {isArabic ? "أو اختر مدينتك يدوياً:" : "Or select city manually:"}
                  </p>

                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1 pb-3 custom-scrollbar">
                    {CITY_PRESETS.map((city: CityPreset) => {
                      const isCurrent = city.name === selectedCity.name && !isGpsActive;
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

        {/* GPS Coordinates & Precision Badge */}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {isGpsActive ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{t.qiblaGpsAccurate} {locationAccuracy ? `(±${locationAccuracy}م)` : ""}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200/60 dark:border-amber-800/40">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>{t.qiblaUsingDefaultCity}</span>
            </span>
          )}

          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            {selectedCity.lat.toFixed(4)}° N, {selectedCity.lng.toFixed(4)}° E
          </span>
        </div>
      </div>

      {/* Prominent Permission Required / Denied Banner if GPS is not granted */}
      {locationStatus === "denied" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-start flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                {t.qiblaLocationPermissionRequired}
              </p>
              <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed mt-0.5">
                {t.qiblaLocationDenied}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDetectLocation(false)}
            className="shrink-0 px-4 py-2 bg-amber-500 text-neutral-950 text-xs font-bold rounded-xl hover:bg-amber-400 transition-colors shadow-sm min-h-[40px]"
          >
            {t.qiblaEnableLocationBtn}
          </button>
        </motion.div>
      )}

      {/* Locating Active Progress */}
      {locating && (
        <div className="mb-4 text-center p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-semibold relative z-10">
          <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
          <span>{t.qiblaDetecting}</span>
        </div>
      )}

      {/* iOS Safari Motion Permission Activation Button */}
      {iosNeedsPermission && (
        <div className="mb-5 text-center p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 relative z-10">
          <Smartphone className="w-5 h-5 text-emerald-400 mx-auto mb-1.5" />
          <p className="text-xs text-neutral-200 font-semibold mb-2">
            {t.qiblaCompassPermissionNeeded}
          </p>
          <button
            onClick={requestIosCompassPermission}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            {t.qiblaEnableCompassBtn}
          </button>
        </div>
      )}

      {/* Compass Dial Graphic */}
      <div className="relative mx-auto my-6 flex flex-col items-center justify-center">
        {/* Top Lubber Line Indicator (Device Direction / 12 o'clock) */}
        <div className="relative z-20 mb-2 flex flex-col items-center">
          <div className={`w-3 h-3 rotate-45 border-t-2 border-l-2 transition-colors duration-200 ${isFacingKaaba ? "border-amber-400 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" : "border-emerald-500 bg-emerald-500"}`} />
          <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase mt-0.5">
            {isArabic ? "مقدمة الهاتف" : "DEVICE HEAD"}
          </span>
        </div>

        {/* Outer Circular Dial Container */}
        <div
          ref={dialRef}
          className={`relative w-64 h-64 sm:w-72 sm:h-72 md:w-84 md:h-84 mx-auto flex items-center justify-center transition-all duration-300 rounded-full ${
            isFacingKaaba
              ? "shadow-[0_0_50px_rgba(16,185,129,0.35)] ring-4 ring-amber-400/80"
              : "shadow-2xl"
          }`}
        >
          {/* ROTATING COMPASS DIAL (Rotates by -deviceHeading so N always points to Earth's True North) */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-emerald-900/30 dark:border-emerald-500/30 flex items-center justify-center bg-gradient-to-b from-neutral-900 via-neutral-950 to-black select-none pointer-events-none"
            animate={{ rotate: dialRotation }}
            transition={{ type: "spring", stiffness: 45, damping: 14 }}
          >
            {/* Degree Ticks around the perimeter */}
            <div className="absolute inset-2 rounded-full border border-neutral-800" />
            <div className="absolute inset-5 rounded-full border border-dashed border-emerald-500/20" />

            {/* Cardinal Direction Markers */}
            <span className="absolute top-2.5 font-extrabold text-base text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">
              N
            </span>
            <span className="absolute bottom-2.5 font-bold text-sm text-neutral-400">
              S
            </span>
            <span className="absolute right-3.5 font-bold text-sm text-neutral-400">
              E
            </span>
            <span className="absolute left-3.5 font-bold text-sm text-neutral-400">
              W
            </span>

            {/* 30-degree Major Numbers */}
            <span className="absolute top-8 right-12 text-[10px] font-mono text-neutral-500">30°</span>
            <span className="absolute top-14 right-7 text-[10px] font-mono text-neutral-500">60°</span>
            <span className="absolute bottom-14 right-7 text-[10px] font-mono text-neutral-500">120°</span>
            <span className="absolute bottom-8 right-12 text-[10px] font-mono text-neutral-500">150°</span>
            <span className="absolute bottom-8 left-12 text-[10px] font-mono text-neutral-500">210°</span>
            <span className="absolute bottom-14 left-7 text-[10px] font-mono text-neutral-500">240°</span>
            <span className="absolute top-14 left-7 text-[10px] font-mono text-neutral-500">300°</span>
            <span className="absolute top-8 left-12 text-[10px] font-mono text-neutral-500">330°</span>

            {/* Small radial angle ticks */}
            {Array.from({ length: 36 }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-0.5 origin-bottom ${i % 3 === 0 ? "h-3 bg-neutral-600" : "h-1.5 bg-neutral-800"}`}
                style={{
                  top: "4px",
                  left: "calc(50% - 1px)",
                  transform: `rotate(${i * 10}deg)`,
                  transformOrigin: "50% 120px"
                }}
              />
            ))}
          </motion.div>

          {/* ROTATING QIBLA NEEDLE (Points directly toward the Kaaba in 360-space) */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
            animate={{ rotate: needleRotation }}
            transition={{ type: "spring", stiffness: 45, damping: 14 }}
          >
            {/* Kaaba Arrow Head pointing to Makkah */}
            <div className="flex flex-col items-center -translate-y-8">
              {/* Kaaba Vector Icon */}
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-2xl border-2 transition-all duration-300 mb-1 relative overflow-hidden ${
                  isFacingKaaba
                    ? "bg-amber-400 text-neutral-950 border-white scale-110 shadow-[0_0_25px_rgba(251,191,36,0.9)] animate-pulse"
                    : "bg-neutral-950 text-amber-400 border-amber-400/90"
                }`}
              >
                <svg viewBox="0 0 32 32" className="w-6 h-6" fill="currentColor">
                  <rect x="4" y="6" width="24" height="22" rx="2" fill="#080808" stroke="#f59e0b" strokeWidth="1.5" />
                  <rect x="4" y="11" width="24" height="3" fill="#f59e0b" />
                  <rect x="19" y="16" width="5" height="10" rx="1" fill="#fbbf24" />
                </svg>
              </div>

              {/* Needle Arrowhead Tip */}
              <div
                className={`w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[45px] filter drop-shadow transition-colors duration-200 ${
                  isFacingKaaba ? "border-b-amber-400" : "border-b-emerald-500"
                }`}
              />
            </div>

            {/* Needle Pivot Center Jewel */}
            <div
              className={`w-7 h-7 rounded-full border-4 shadow-lg z-20 my-0 transition-colors duration-200 ${
                isFacingKaaba
                  ? "bg-amber-400 border-white shadow-[0_0_15px_rgba(251,191,36,1)]"
                  : "bg-gradient-to-tr from-amber-500 to-amber-300 border-neutral-900"
              }`}
            />

            {/* Needle Counterbalance Tail */}
            <div className="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[36px] border-t-neutral-600 translate-y-7" />
          </motion.div>
        </div>

        {/* Real-time Kaaba Facing Status Banner */}
        <AnimatePresence>
          {isFacingKaaba ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="mt-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 border border-emerald-400/50"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>{t.qiblaFacingKaaba}</span>
            </motion.div>
          ) : (
            <div className="mt-4 text-xs text-neutral-400 dark:text-neutral-500 text-center font-medium">
              {hasCompassSupport ? t.qiblaAlignNeedle : t.qiblaCompassTip}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Degrees & Distance Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800/80 text-center relative z-10">
        {/* Qibla Angle */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/40">
          <p className="text-[11px] uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-semibold">
            {t.qiblaDirectionToKaaba}
          </p>
          <p className="text-xl font-bold text-[#1A5D3A] dark:text-emerald-300 mt-0.5 font-mono">
            {qiblaAngle.toFixed(1)}°
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {compassCardinal}
          </p>
        </div>

        {/* Distance to Makkah */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/40">
          <p className="text-[11px] uppercase tracking-wider text-amber-800 dark:text-amber-400 font-semibold">
            {t.qiblaDistanceKm}
          </p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-300 mt-0.5 font-mono">
            {distanceKm.toLocaleString()} <span className="text-xs">{isArabic ? "كم" : "km"}</span>
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {isArabic ? "المسافة الجوية" : "Great Circle"}
          </p>
        </div>

        {/* Current Phone Heading (if sensor active) */}
        <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
          <p className="text-[11px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold">
            {isArabic ? "اتجاه الهاتف" : "Phone Heading"}
          </p>
          <p className="text-xl font-bold text-neutral-900 dark:text-white mt-0.5 font-mono">
            {deviceHeading !== null ? `${Math.round(deviceHeading)}°` : "--"}
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {deviceHeading !== null ? getCompassDirection(deviceHeading, isArabic) : (isArabic ? "مستشعر ثابت" : "Static")}
          </p>
        </div>

        {/* Offset from Kaaba */}
        <div className="p-3.5 rounded-2xl bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/60 dark:border-neutral-800">
          <p className="text-[11px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-semibold">
            {isArabic ? "فارق الزاوية" : "Angle Offset"}
          </p>
          <p className={`text-xl font-bold mt-0.5 font-mono ${isFacingKaaba ? "text-emerald-500" : "text-neutral-900 dark:text-white"}`}>
            {deviceHeading !== null
              ? `${Math.round(Math.abs(((deviceHeading - qiblaAngle + 540) % 360) - 180))}°`
              : "--"}
          </p>
          <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
            {isFacingKaaba ? (isArabic ? "متطابق تماماً ✓" : "Aligned ✓") : (isArabic ? "أدر الهاتف" : "Rotate device")}
          </p>
        </div>
      </div>

      {/* Manual Geolocation Refresh / Recalibrate Footer Action */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/80 pt-4 relative z-10">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>
            {hasCompassSupport
              ? (isArabic ? "البوصلة الحية نشطة. ضع الهاتف أفقياً بعيداً عن المعادن والمغناطيس." : "Live compass active. Hold device flat away from magnetic cases.")
              : (isArabic ? "وضع العرض الثابت. الشمال الحقيقي موجه للأعلى (0°)." : "Static orientation mode. True North is positioned at top (0°).")}
          </span>
        </div>

        <button
          onClick={() => handleDetectLocation(false)}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold transition-colors"
        >
          <RefreshCw className={`w-3 h-3 ${locating ? "animate-spin" : ""}`} />
          <span>{isArabic ? "تحديث إحداثيات GPS" : "Refresh GPS"}</span>
        </button>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Gauge,
  Music,
  SkipBack,
  SkipForward,
  Repeat,
  Loader2,
  AlertCircle,
  Moon
} from "lucide-react";
import { useAudio, type SleepTimerOption } from "../context/AudioContext";
import { useLanguage } from "../context/LanguageContext";

function formatSeconds(secs: number) {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatSleepRemaining(seconds: number | null, option: SleepTimerOption) {
  if (option === "endOfSurah") return "End";
  if (seconds === null) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

export default function AudioPlayerBar() {
  const { t, language } = useLanguage();
  const {
    currentTrack,
    activeVerseKey,
    isPlaying,
    isLoadingTrack,
    hasPlaybackError,
    currentTime,
    duration,
    volume,
    playbackRate,
    autoPlayNextSurah,
    loopMode,
    sleepTimer,
    sleepTimerSecondsRemaining,
    togglePlay,
    seek,
    skipSeconds,
    setVolume,
    setPlaybackRate,
    setAutoPlayNextSurah,
    setLoopMode,
    setSleepTimer,
    playNextSurah,
    playPrevSurah,
    stop,
  } = useAudio();

  const [showSleepMenu, setShowSleepMenu] = useState(false);
  const sleepMenuRef = useRef<HTMLDivElement>(null);

  // Close sleep menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sleepMenuRef.current && !sleepMenuRef.current.contains(e.target as Node)) {
        setShowSleepMenu(false);
      }
    };
    if (showSleepMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSleepMenu]);

  if (!currentTrack) return null;

  const cycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    setPlaybackRate(SPEED_OPTIONS[nextIndex]);
  };

  const cycleLoopMode = () => {
    if (loopMode === "off") setLoopMode("all");
    else if (loopMode === "all") setLoopMode("one");
    else setLoopMode("off");
  };

  const defaultReciterName = language === "ar" ? "الشيخ ياسر الدوسري" : "Sheikh Yasser Al-Dosari";
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const isSurahTrack = Boolean(currentTrack.surahNumber);
  const isFadingOut = Boolean(
    sleepTimerSecondsRemaining !== null &&
    sleepTimerSecondsRemaining <= 60 &&
    sleepTimerSecondsRemaining > 0
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed bottom-3 left-3 right-3 sm:bottom-6 sm:left-8 sm:right-8 max-w-4xl mx-auto z-50 select-none"
      >
        <div className="bg-black/95 dark:bg-black/95 backdrop-blur-2xl text-white rounded-3xl p-3.5 sm:p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-emerald-500/30 flex flex-col gap-2.5 relative overflow-visible">
          {/* Subtle top amber glowing hairline */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent pointer-events-none rounded-t-3xl" />

          {/* Main Controls Row */}
          <div className="flex items-center justify-between gap-3">
            {/* Track Info with Animated Soundwave Thumbnail */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner relative overflow-hidden">
                {isLoadingTrack ? (
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                ) : isPlaying ? (
                  <div className="flex items-end gap-0.5 h-4 px-1 text-emerald-400">
                    <span className="w-0.5 bg-emerald-400 rounded-full eq-bar-1" />
                    <span className="w-0.5 bg-amber-400 rounded-full eq-bar-2" />
                    <span className="w-0.5 bg-emerald-300 rounded-full eq-bar-3" />
                    <span className="w-0.5 bg-amber-300 rounded-full eq-bar-4" />
                  </div>
                ) : (
                  <Music className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-xs sm:text-sm truncate text-white">
                    {currentTrack.title}
                  </p>
                  {activeVerseKey && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold shrink-0 border border-emerald-500/30">
                      {language === "ar" ? `الآية ${activeVerseKey.split(":")[1]}` : `Ayah ${activeVerseKey.split(":")[1]}`}
                    </span>
                  )}
                  {currentTrack.arabicTitle && (
                    <span className="font-['Amiri'] text-amber-300 text-xs sm:text-sm hidden sm:inline">
                      {currentTrack.arabicTitle}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[11px] text-emerald-300/80 truncate">
                    {currentTrack.subtitle || defaultReciterName}
                  </p>
                  {isFadingOut && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold animate-pulse">
                      <Moon className="w-3 h-3 text-amber-400" />
                      <span>{t.sleepTimerFading}</span>
                    </span>
                  )}
                  {hasPlaybackError && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-medium">
                      <AlertCircle className="w-3 h-3" />
                      <span>{language === "ar" ? "تعذر البث، جارٍ التجهيز" : "Stream notice"}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Playback Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Surah Prev Button */}
              {isSurahTrack && (
                <button
                  onClick={playPrevSurah}
                  title={t.playerPrevSurah}
                  className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
              )}

              {/* Skip -10s */}
              <button
                onClick={() => skipSeconds(-10)}
                title={t.playerSkipBack}
                className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Center Play / Pause */}
              <button
                onClick={togglePlay}
                title={isPlaying ? t.playerPause : t.playerPlay}
                className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 hover:from-amber-300 hover:to-amber-200 text-neutral-950 flex items-center justify-center shadow-lg shadow-amber-400/30 active:scale-95 hover:scale-105 transition-all"
              >
                {isLoadingTrack ? (
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-950" />
                ) : isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              {/* Skip +10s */}
              <button
                onClick={() => skipSeconds(10)}
                title={t.playerSkipForward}
                className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Surah Next Button */}
              {isSurahTrack && (
                <button
                  onClick={playNextSurah}
                  title={t.playerNextSurah}
                  className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center justify-center"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Right Sleep Timer, Continuous Toggle, Speed, Volume & Close */}
            <div className="flex items-center gap-1 sm:gap-2 relative">
              {/* Quiet Sleep Timer Button & Menu */}
              <div className="relative" ref={sleepMenuRef}>
                <button
                  onClick={() => setShowSleepMenu(!showSleepMenu)}
                  title={`${t.playerSleepTimer}${sleepTimer ? `: ${formatSleepRemaining(sleepTimerSecondsRemaining, sleepTimer)}` : ""}`}
                  className={`min-w-[40px] min-h-[40px] px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center gap-1.5 ${
                    sleepTimer
                      ? "bg-amber-400/25 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.25)]"
                      : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  {sleepTimer && (
                    <span className="text-[10px] font-mono font-bold">
                      {formatSleepRemaining(sleepTimerSecondsRemaining, sleepTimer)}
                    </span>
                  )}
                </button>

                {/* Sleep Timer Popover Menu */}
                <AnimatePresence>
                  {showSleepMenu && (
                    <>
                      {/* Fullscreen backdrop to catch clicks outside on mobile/desktop */}
                      <div
                        className="fixed inset-0 z-[55]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSleepMenu(false);
                        }}
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full mb-3 ltr:right-0 sm:ltr:right-auto sm:ltr:left-1/2 sm:ltr:-translate-x-1/2 rtl:left-0 sm:rtl:left-1/2 sm:rtl:-translate-x-1/2 w-56 rounded-2xl bg-[#0a0a0a] border border-emerald-500/40 shadow-[0_15px_50px_rgba(0,0,0,0.95)] p-2.5 z-[60] text-xs flex flex-col gap-1 backdrop-blur-xl"
                      >
                        <div className="px-3 py-1.5 border-b border-neutral-800 text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                          <Moon className="w-3.5 h-3.5 text-amber-400" />
                          <span>{t.playerSleepTimer}</span>
                        </div>

                      {[
                        { val: 15 as SleepTimerOption, label: t.sleepTimer15m },
                        { val: 30 as SleepTimerOption, label: t.sleepTimer30m },
                        { val: 45 as SleepTimerOption, label: t.sleepTimer45m },
                        { val: 60 as SleepTimerOption, label: t.sleepTimer60m },
                        { val: "endOfSurah" as SleepTimerOption, label: t.sleepTimerEndSurah },
                        { val: null as SleepTimerOption, label: t.sleepTimerOff },
                      ].map((item) => (
                        <button
                          key={String(item.val)}
                          onClick={() => {
                            setSleepTimer(item.val);
                            setShowSleepMenu(false);
                          }}
                          className={`w-full min-h-[36px] flex items-center justify-between px-3 py-1.5 rounded-xl text-start transition-colors ${
                            sleepTimer === item.val
                              ? "bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-500/30"
                              : "text-neutral-300 hover:bg-neutral-900 hover:text-white"
                          }`}
                        >
                          <span>{item.label}</span>
                          {sleepTimer === item.val && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          )}
                        </button>
                      ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Continuous Surah Auto-Play Toggle */}
              {isSurahTrack && (
                <button
                  onClick={() => setAutoPlayNextSurah(!autoPlayNextSurah)}
                  title={`${t.playerContinuousPlay}: ${autoPlayNextSurah ? (language === "ar" ? "مفعل" : "Active") : (language === "ar" ? "معطل" : "Off")}`}
                  className={`min-w-[40px] min-h-[40px] p-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center relative ${
                    autoPlayNextSurah
                      ? "bg-emerald-500/25 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                      : "bg-white/5 text-neutral-500 hover:text-white hover:bg-white/10 border border-white/5"
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  {autoPlayNextSurah && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              )}

              {/* Loop mode toggle for non-surah */}
              {!isSurahTrack && (
                <button
                  onClick={cycleLoopMode}
                  title={`Loop: ${loopMode}`}
                  className={`min-w-[40px] min-h-[40px] p-2 rounded-xl text-xs font-semibold transition-all active:scale-95 flex items-center justify-center ${
                    loopMode !== "off"
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                      : "bg-white/5 text-neutral-500 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  {loopMode === "one" && <span className="text-[9px] font-mono ml-0.5">1</span>}
                </button>
              )}

              {/* Speed rate toggle */}
              <button
                onClick={cycleSpeed}
                title={language === "ar" ? "سرعة التلاوة" : "Playback Speed"}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-mono font-bold text-amber-300 transition-all active:scale-95 min-h-[40px]"
              >
                <Gauge className="w-3 h-3 hidden sm:inline" />
                <span>{playbackRate}x</span>
              </button>

              {/* Volume Slider (desktop/tablet) */}
              <div className="hidden md:flex items-center gap-1.5 pl-2">
                <button
                  onClick={() => setVolume(volume === 0 ? 0.85 : 0)}
                  className="text-neutral-400 hover:text-white transition-colors p-1 min-w-[32px] min-h-[32px] flex items-center justify-center"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-16 h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              {/* Close Button */}
              <button
                onClick={stop}
                className="min-w-[40px] min-h-[40px] p-2 rounded-xl hover:bg-white/10 text-neutral-400 hover:text-white transition-colors flex items-center justify-center"
                title={t.close}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrubber Line with live gradient progress track */}
          <div className="flex items-center gap-2.5 text-[10px] sm:text-[11px] font-mono text-neutral-400 px-1" dir="ltr">
            <span className="w-9 text-right">{formatSeconds(currentTime)}</span>
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                style={{
                  background: `linear-gradient(to right, #fbbf24 0%, #10b981 ${progressPercent}%, #262626 ${progressPercent}%, #262626 100%)`
                }}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(245,158,11,0.8)]"
              />
            </div>
            <span className="w-9">{formatSeconds(duration)}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

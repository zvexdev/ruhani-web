import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Headphones,
  ChevronDown,
  Music,
  Loader2,
  BookOpen,
  Sparkles,
  Search,
  Check
} from "lucide-react";
import * as api from "../services/api";
import { RECITERS_LIST, type ReciterInfo, getSurahAudioUrl } from "../data/reciters";
import type { SurahMeta } from "../types";
import { useAudio } from "../context/AudioContext";
import { useLanguage } from "../context/LanguageContext";
import { searchMatch } from "../lib/arabic";

export default function Audio() {
  const { t, isArabic } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialSurah = (() => {
    const param = Number(searchParams.get("surah"));
    if (!isNaN(param) && param >= 1 && param <= 114) {
      return param;
    }
    try {
      const saved = localStorage.getItem("ruhani-last-surah");
      const num = Number(saved);
      if (!isNaN(num) && num >= 1 && num <= 114) {
        return num;
      }
    } catch {
      // fallback
    }
    return 1;
  })();

  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [reciters, setReciters] = useState<ReciterInfo[]>(RECITERS_LIST);
  const [selectedSurah, setSelectedSurah] = useState(initialSurah);
  const [selectedReciter, setSelectedReciter] = useState(() => {
    try {
      const saved = localStorage.getItem("ruhani-favorite-reciter");
      const num = Number(saved);
      if (!isNaN(num) && RECITERS_LIST.some((r) => r.id === num)) {
        return num;
      }
    } catch {
      // fallback
    }
    return 1;
  }); // Default: Sheikh Yasser Al-Dosari
  const [showReciters, setShowReciters] = useState(false);
  const [showSurahs, setShowSurahs] = useState(false);
  const [reciterFilter, setReciterFilter] = useState("");
  const [surahFilter, setSurahFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const {
    playTrack,
    currentTrack,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seek,
    volume,
    setVolume,
    setPlaybackMode,
    syncActiveSurah,
  } = useAudio();

  // Lock playback mode to continuous SURAH listening when on the Recitations (التلاوات) page
  useEffect(() => {
    setPlaybackMode("SURAH");
  }, [setPlaybackMode]);

  // Keep AudioContext aware of active selected surah on Audio page with equality guard
  const lastSyncedSurahRef = useRef<{ surah: number; reciter: number } | null>(null);
  useEffect(() => {
    if (
      !lastSyncedSurahRef.current ||
      lastSyncedSurahRef.current.surah !== selectedSurah ||
      lastSyncedSurahRef.current.reciter !== selectedReciter
    ) {
      lastSyncedSurahRef.current = { surah: selectedSurah, reciter: selectedReciter };
      syncActiveSurah(selectedSurah, selectedReciter);
    }
  }, [selectedSurah, selectedReciter, syncActiveSurah]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [surahsData, recitersData] = await Promise.all([
        api.getAllSurahs(),
        api.getReciters(),
      ]);
      setSurahs(surahsData);
      setReciters(recitersData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const surahParam = searchParams.get("surah");
    if (surahParam) {
      const num = Number(surahParam);
      if (num >= 1 && num <= 114) {
        setSelectedSurah(num);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (isPlaying && !searchParams.get("surah")) {
      if (currentTrack?.surahNumber && currentTrack.surahNumber !== selectedSurah) {
        setSelectedSurah(currentTrack.surahNumber);
      }
      if (currentTrack?.reciterId && currentTrack.reciterId !== selectedReciter) {
        setSelectedReciter(currentTrack.reciterId);
      }
    }
  }, [isPlaying, currentTrack?.surahNumber, currentTrack?.reciterId, selectedSurah, selectedReciter, searchParams]);

  const handlePlaySurah = async (surahNum: number, reciterId: number) => {
    try {
      setPlaybackMode("SURAH");
      const data = await api.getSurahAudio(surahNum);
      const reciterData = data.reciters?.find((r) => r.id === reciterId) || data.reciters?.[0];
      const sMeta = surahs.find((s) => s.number === surahNum);
      const rMeta = reciters.find((r) => r.id === reciterId);

      const audioUrl = reciterData?.full_surah_audio || getSurahAudioUrl(reciterId, surahNum);
      if (audioUrl) {
        playTrack({
          title: `Surah ${sMeta?.name_english || surahNum}`,
          subtitle: `Sheikh ${rMeta?.name || "Yasser Al-Dosari"}`,
          arabicTitle: sMeta?.name_arabic,
          src: audioUrl,
          type: "surah",
          mode: "SURAH",
          surahNumber: surahNum,
          reciterId: reciterId,
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSurahChange = (num: number) => {
    setSelectedSurah(num);
    setShowSurahs(false);
    handlePlaySurah(num, selectedReciter);
  };

  const handleReciterChange = (id: number) => {
    setSelectedReciter(id);
    setShowReciters(false);
    handlePlaySurah(selectedSurah, id);
  };

  const currentSurahMeta = surahs.find((s) => s.number === selectedSurah);
  const currentReciter = reciters.find((r) => r.id === selectedReciter);

  const filteredReciters = reciters.filter(
    (r) =>
      r.name.toLowerCase().includes(reciterFilter.toLowerCase()) ||
      searchMatch(r.name_arabic, reciterFilter)
  );

  const filteredSurahs = surahs.filter(
    (s) =>
      s.name_english.toLowerCase().includes(surahFilter.toLowerCase()) ||
      s.name_complex?.toLowerCase().includes(surahFilter.toLowerCase()) ||
      s.name_translation?.toLowerCase().includes(surahFilter.toLowerCase()) ||
      searchMatch(s.name_arabic, surahFilter) ||
      String(s.number).includes(surahFilter)
  );

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return "0:00";
    const mins = Math.floor(t / 60);
    const secs = Math.floor(t % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A5D3A] dark:text-emerald-400" />
          <p className="text-xs text-neutral-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-40 sm:pb-36">
      {/* Header */}
      <div className="py-6 md:py-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/70 text-[#1A5D3A] dark:text-emerald-300 text-xs font-semibold mb-3 border border-emerald-200 dark:border-emerald-800/40">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{t.audioDefaultReciterBadge}</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {t.audioTitle}
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          {t.audioSubtitle}
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Player Card */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-950 via-black to-neutral-950 text-white rounded-3xl p-5 sm:p-8 md:p-10 shadow-2xl border border-emerald-700/40 relative overflow-hidden"
          >
            {/* Ambient Aura */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Now Playing Info */}
            <div className="flex items-center gap-3.5 sm:gap-5 mb-8 relative z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
                <Music className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] uppercase font-bold tracking-widest text-emerald-300">
                    {t.audioNowStreaming}
                  </span>
                  {isPlaying && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      {t.live}
                    </span>
                  )}
                </div>
                <h3 className="text-xl sm:text-3xl font-extrabold text-white truncate mt-1">
                  {isArabic ? `سورة ${currentSurahMeta?.name_arabic || "الفاتحة"}` : `Surah ${currentSurahMeta?.name_english || "Al-Fatihah"}`}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-200/80 truncate">
                  {isArabic ? currentReciter?.name_arabic : currentReciter?.name} &middot;{" "}
                  <span className="font-['Amiri'] text-amber-300">{currentSurahMeta?.name_arabic}</span>
                </p>
              </div>
            </div>

            {/* Dynamic Waveform Visualizer (32 responsive bars) */}
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 h-16 sm:h-20 mb-6 bg-black/25 rounded-2xl px-2 sm:px-4 py-3 border border-white/5 overflow-hidden">
              {Array.from({ length: 32 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 sm:w-1.5 bg-gradient-to-t from-emerald-500 to-amber-300 rounded-full shrink-0"
                  animate={
                    isPlaying
                      ? {
                          height: [8, 20 + ((i * 7) % 36), 8],
                        }
                      : { height: 8 }
                  }
                  transition={
                    isPlaying
                      ? {
                          duration: 0.9 + (i % 5) * 0.15,
                          repeat: Infinity,
                          delay: i * 0.02,
                        }
                      : {}
                  }
                  style={{ height: 8 }}
                />
              ))}
            </div>

            {/* Progress Slider */}
            <div className="mb-6">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:rounded-full"
              />
              <div className="flex justify-between mt-2 text-xs font-mono text-white/60" dir="ltr">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-6 relative z-10">
              <button
                onClick={() => selectedSurah > 1 && handleSurahChange(selectedSurah - 1)}
                className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                title="Previous Surah"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  setPlaybackMode("SURAH");
                  if (
                    currentTrack?.src &&
                    currentTrack.mode === "SURAH" &&
                    currentTrack.surahNumber === selectedSurah &&
                    currentTrack.reciterId === selectedReciter
                  ) {
                    togglePlay();
                  } else {
                    handlePlaySurah(selectedSurah, selectedReciter);
                  }
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-950 flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-amber-400/30"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>

              <button
                onClick={() => selectedSurah < 114 && handleSurahChange(selectedSurah + 1)}
                className="p-3 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
                title="Next Surah"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/10 max-w-xs mx-auto">
              <Volume2 className="w-4 h-4 text-emerald-300" />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="flex-1 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>
          </motion.div>
        </div>

        {/* Right Selection Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Reciter Selector */}
          <div className="spiritual-card rounded-3xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowReciters(!showReciters)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-neutral-900/60 transition-colors text-neutral-900 dark:text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-neutral-900 text-[#1A5D3A] dark:text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <span className="text-[11px] text-neutral-400 block font-semibold uppercase tracking-wider">
                    {t.audioSelectReciter}
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    {isArabic ? currentReciter?.name_arabic : currentReciter?.name}
                    {currentReciter?.id === 1 && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-neutral-900 text-amber-800 dark:text-amber-300 font-bold border border-amber-400/30">
                        {t.defaultBadge}
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 transition-transform ${showReciters ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showReciters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-100 dark:border-neutral-800 p-2">
                    {/* Search Bar for Reciters */}
                    <div className="relative mb-2 px-1">
                      <Search className="w-3.5 h-3.5 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        placeholder={t.audioSearchReciters}
                        value={reciterFilter}
                        onChange={(e) => setReciterFilter(e.target.value)}
                        className="w-full ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-neutral-900 pr-1 custom-scrollbar">
                      {filteredReciters.map((reciter) => (
                        <button
                          key={reciter.id}
                          onClick={() => handleReciterChange(reciter.id)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-start transition-colors ${
                            reciter.id === selectedReciter
                              ? "bg-emerald-50 dark:bg-neutral-900 text-emerald-800 dark:text-emerald-300 font-semibold"
                              : "hover:bg-gray-50 dark:hover:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          <div className="flex-1 min-w-0 pr-2">
                            <p className="text-xs font-bold truncate flex items-center gap-1.5">
                              {reciter.name}
                              {reciter.id === 1 && (
                                <span className="text-[9px] px-1 rounded bg-amber-100 dark:bg-neutral-900 text-amber-800 dark:text-amber-300 border border-amber-400/30">
                                  Default
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-neutral-400">{reciter.riwayah}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="font-['Amiri'] text-xs text-neutral-500">
                              {reciter.name_arabic}
                            </span>
                            {reciter.id === selectedReciter && (
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Surah Selector */}
          <div className="spiritual-card rounded-3xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowSurahs(!showSurahs)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-neutral-900/60 transition-colors text-neutral-900 dark:text-white"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-neutral-900 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-400/20">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-start">
                  <span className="text-[11px] text-neutral-400 block font-semibold uppercase tracking-wider">
                    {t.audioSelectSurah}
                  </span>
                  <span className="text-sm font-bold text-neutral-900 dark:text-white">
                    {selectedSurah}. {isArabic ? currentSurahMeta?.name_arabic : currentSurahMeta?.name_english}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-neutral-400 transition-transform ${showSurahs ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence>
              {showSurahs && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-gray-100 dark:border-neutral-800 p-2">
                    <div className="relative mb-2 px-1">
                      <Search className="w-3.5 h-3.5 absolute ltr:left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                      <input
                        type="text"
                        placeholder={t.audioSearchSurahs}
                        value={surahFilter}
                        onChange={(e) => setSurahFilter(e.target.value)}
                        className="w-full ltr:pl-9 ltr:pr-3 rtl:pr-9 rtl:pl-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-xs text-neutral-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-neutral-900 pr-1 custom-scrollbar">
                      {filteredSurahs.map((surah) => (
                        <button
                          key={surah.number}
                          onClick={() => handleSurahChange(surah.number)}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-start transition-colors ${
                            surah.number === selectedSurah
                              ? "bg-amber-50 dark:bg-neutral-900 text-amber-900 dark:text-amber-200 font-semibold"
                              : "hover:bg-gray-50 dark:hover:bg-neutral-900/60 text-neutral-700 dark:text-neutral-300"
                          }`}
                        >
                          <span className="text-xs font-mono font-bold w-6 text-neutral-400">
                            {surah.number}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{isArabic ? surah.name_arabic : surah.name_english}</p>
                            <p className="text-[10px] text-neutral-400">{surah.verses_count} {t.quranVersesCount}</p>
                          </div>
                          <span className="font-['Amiri'] text-sm text-neutral-700 dark:text-neutral-300 shrink-0">
                            {surah.name_arabic}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Access Top Surahs */}
          <div className="spiritual-card rounded-3xl shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                {isArabic ? "سور شائعة التلاوة" : "Frequently Recited"}
              </p>
            </div>
            <div className="space-y-1.5">
              {[
                { num: 36, name: "Ya-Sin", arabic: "يس" },
                { num: 55, name: "Ar-Rahman", arabic: "الرحمن" },
                { num: 67, name: "Al-Mulk", arabic: "الملك" },
                { num: 18, name: "Al-Kahf", arabic: "الكهف" },
                { num: 56, name: "Al-Waqi'ah", arabic: "الواقعة" },
              ].map((item) => (
                <button
                  key={item.num}
                  onClick={() => handleSurahChange(item.num)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-neutral-900/60 transition-colors text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-neutral-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    </div>
                    <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                      {item.num}. {item.name}
                    </span>
                  </div>
                  <span className="font-['Amiri'] text-base text-neutral-700 dark:text-neutral-300">
                    {item.arabic}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

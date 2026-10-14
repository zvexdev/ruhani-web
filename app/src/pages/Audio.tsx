import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  Sparkles
} from "lucide-react";
import * as api from "../services/api";
import type { SurahMeta, Reciter } from "../types";
import { useAudio } from "../context/AudioContext";

export default function Audio() {
  const [searchParams] = useSearchParams();
  const initialSurah = Number(searchParams.get("surah")) || 1;

  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const [selectedSurah, setSelectedSurah] = useState(initialSurah);
  const [selectedReciter, setSelectedReciter] = useState(1);
  const [showReciters, setShowReciters] = useState(false);
  const [showSurahs, setShowSurahs] = useState(false);
  const [loading, setLoading] = useState(true);

  const { playTrack, currentTrack, isPlaying, togglePlay, currentTime, duration, seek, volume, setVolume } = useAudio();

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

  const handlePlaySurah = async (surahNum: number, reciterId: number) => {
    try {
      const data = await api.getSurahAudio(surahNum);
      const reciterData = data.reciters?.find((r: any) => r.id === reciterId) || data.reciters?.[0];
      const sMeta = surahs.find(s => s.number === surahNum);
      const rMeta = reciters.find(r => r.id === reciterId);

      if (reciterData?.full_surah_audio) {
        playTrack({
          title: `Surah ${sMeta?.name_english || surahNum}`,
          subtitle: rMeta?.name || "Qari Recitation",
          arabicTitle: sMeta?.name_arabic,
          src: reciterData.full_surah_audio
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
          <p className="text-xs text-slate-400">Loading audio library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-28">
      {/* Header */}
      <div className="py-6 md:py-8">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Listen to the Quran
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Stream heart-touching, high-definition recitations from world-renowned Qaris
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Player Card */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-900 text-white rounded-3xl p-6 md:p-10 shadow-2xl border border-emerald-700/40 relative overflow-hidden"
          >
            {/* Ambient Aura */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Now Playing Info */}
            <div className="flex items-center gap-5 mb-8 relative z-10">
              <div className="w-18 h-18 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-amber-300 shadow-inner">
                <Music className="w-8 h-8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] uppercase font-bold tracking-widest text-emerald-300">
                    Now Streaming
                  </span>
                  {isPlaying && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-300 font-bold bg-amber-400/20 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      Live
                    </span>
                  )}
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-white truncate mt-1">
                  Surah {currentSurahMeta?.name_english || "Al-Fatihah"}
                </h3>
                <p className="text-sm text-emerald-200/80 truncate">
                  {currentReciter?.name || "Mishary Rashid Alafasy"} &middot;{" "}
                  <span className="font-['Amiri'] text-amber-300">{currentSurahMeta?.name_arabic}</span>
                </p>
              </div>
            </div>

            {/* Dynamic Waveform Visualizer */}
            <div className="flex items-center justify-center gap-1.5 h-20 mb-6 bg-black/20 rounded-2xl p-4 border border-white/5">
              {Array.from({ length: 45 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-emerald-500 to-amber-300 rounded-full"
                  animate={
                    isPlaying
                      ? {
                          height: [10, 24 + ((i * 7) % 36), 10],
                        }
                      : { height: 10 }
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
                  style={{ height: 10 }}
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
                className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs font-mono text-white/60">
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
                  if (currentTrack?.src) {
                    togglePlay();
                  } else {
                    handlePlaySurah(selectedSurah, selectedReciter);
                  }
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 flex items-center justify-center hover:scale-105 transition-transform shadow-xl shadow-amber-400/30"
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

        {/* Selection Column */}
        <div className="lg:col-span-4 space-y-4">
          {/* Reciter Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowReciters(!showReciters)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors text-slate-900 dark:text-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#1A5D3A] dark:text-emerald-400 flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs text-slate-400 block">Reciter</span>
                  <span className="text-sm font-semibold">{currentReciter?.name}</span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${showReciters ? "rotate-180" : ""}`}
              />
            </button>
            {showReciters && (
              <div className="border-t border-gray-100 dark:border-slate-800 max-h-64 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/50">
                {reciters.map((reciter) => (
                  <button
                    key={reciter.id}
                    onClick={() => handleReciterChange(reciter.id)}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                      reciter.id === selectedReciter
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        reciter.id === selectedReciter ? "bg-emerald-600 dark:bg-emerald-400" : "bg-slate-300"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-semibold">{reciter.name}</p>
                      <p className="text-[11px] text-slate-400 font-['Amiri']">{reciter.name_arabic}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Surah Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowSurahs(!showSurahs)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors text-slate-900 dark:text-white"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs text-slate-400 block">Surah</span>
                  <span className="text-sm font-semibold">
                    {selectedSurah}. {currentSurahMeta?.name_english}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform ${showSurahs ? "rotate-180" : ""}`}
              />
            </button>
            {showSurahs && (
              <div className="border-t border-gray-100 dark:border-slate-800 max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/50">
                {surahs.map((surah) => (
                  <button
                    key={surah.number}
                    onClick={() => handleSurahChange(surah.number)}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-amber-50/50 dark:hover:bg-slate-800/50 transition-colors ${
                      surah.number === selectedSurah
                        ? "bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <span className="text-xs font-mono font-bold w-6 text-slate-400">
                      {surah.number}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{surah.name_english}</p>
                      <p className="text-[10px] text-slate-400">{surah.verses_count} verses</p>
                    </div>
                    <span className="font-['Amiri'] text-sm text-slate-800 dark:text-slate-200">
                      {surah.name_arabic}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Access Top Surahs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Frequently Recited
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
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-slate-800/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {item.num}. {item.name}
                    </span>
                  </div>
                  <span className="font-['Amiri'] text-sm text-slate-600 dark:text-slate-400">
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

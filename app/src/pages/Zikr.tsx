import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  Sparkles,
  Sun,
  Moon,
  Bed,
  Volume2,
  VolumeX,
  CheckCircle2,
  Check,
  Copy,
  Award
} from "lucide-react";
import { AUTHENTIC_ADHKAR, type DhikrItem } from "../data/adhkar";
import { soundEffects } from "../lib/sound";
import { useLanguage } from "../context/LanguageContext";

interface DhikrCounter {
  phrase: string;
  arabic: string;
  target: number;
  current: number;
  round: number;
  totalRounds: number;
}

const defaultDhikrs: DhikrCounter[] = [
  { phrase: "SubhanAllah", arabic: "سُبْحَانَ ٱللَّٰه", target: 33, current: 0, round: 1, totalRounds: 3 },
  { phrase: "Alhamdulillah", arabic: "ٱلْحَمْدُ لِلَّٰه", target: 33, current: 0, round: 1, totalRounds: 3 },
  { phrase: "Allahu Akbar", arabic: "ٱللَّٰهُ أَكْبَر", target: 33, current: 0, round: 1, totalRounds: 3 },
  { phrase: "La ilaha illallah", arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰه", target: 100, current: 0, round: 1, totalRounds: 1 },
  { phrase: "Astaghfirullah", arabic: "أَسْتَغْفِرُ ٱللَّٰه", target: 100, current: 0, round: 1, totalRounds: 1 },
];

export default function Zikr() {
  const { t, isArabic } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("morning");
  const [dhikrIndex, setDhikrIndex] = useState(0);
  const [counters, setCounters] = useState<DhikrCounter[]>(defaultDhikrs);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedItems, setCompletedItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("ruhani-completed-adhkar");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.debug("Failed parsing saved completed adhkar:", e);
      return [];
    }
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentDhikr = counters[dhikrIndex];
  const progress = currentDhikr ? (currentDhikr.current / currentDhikr.target) * 100 : 0;
  const isComplete = currentDhikr?.current === currentDhikr?.target;

  const toggleCompleted = (id: string) => {
    const updated = completedItems.includes(id)
      ? completedItems.filter(i => i !== id)
      : [...completedItems, id];
    setCompletedItems(updated);
    localStorage.setItem("ruhani-completed-adhkar", JSON.stringify(updated));
    if (!completedItems.includes(id)) {
      if (soundEnabled) soundEffects.playCompletionChime();
    }
  };

  const increment = useCallback(() => {
    if (soundEnabled) {
      soundEffects.playBeadClick();
    }
    // Haptic vibration on supported devices
    if ("vibrate" in navigator) {
      navigator.vibrate?.(15);
    }

    setCounters((prev) => {
      const updated = [...prev];
      const curr = { ...updated[dhikrIndex] };
      if (curr.current < curr.target) {
        curr.current += 1;
        if (curr.current === curr.target) {
          if (soundEnabled) soundEffects.playCompletionChime();
          if ("vibrate" in navigator) navigator.vibrate?.([30, 50, 30]);

          if (curr.round < curr.totalRounds) {
            curr.current = 0;
            curr.round += 1;
          }
        }
      }
      updated[dhikrIndex] = curr;
      return updated;
    });
  }, [dhikrIndex, soundEnabled]);

  const resetDhikr = () => {
    setCounters((prev) => {
      const updated = [...prev];
      updated[dhikrIndex] = {
        ...defaultDhikrs[dhikrIndex],
        current: 0,
        round: 1,
      };
      return updated;
    });
  };

  const setPresetTarget = (targetNum: number) => {
    setCounters((prev) => {
      const updated = [...prev];
      updated[dhikrIndex] = {
        ...updated[dhikrIndex],
        target: targetNum,
        current: 0,
        round: 1
      };
      return updated;
    });
  };

  const copyAdhkar = (item: DhikrItem) => {
    const text = `${item.title}\n\n${item.arabic}\n\n${item.transliteration}\n\n"${item.translation}"\n\n— [${item.source}]`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categoryAdhkar = AUTHENTIC_ADHKAR.filter((a) => a.category === selectedCategory);
  const totalCountInCategory = categoryAdhkar.length;
  const completedCountInCategory = categoryAdhkar.filter(a => completedItems.includes(a.id)).length;
  const categoryPercent = totalCountInCategory > 0 ? Math.round((completedCountInCategory / totalCountInCategory) * 100) : 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-32">
      {/* Header */}
      <div className="py-6 md:py-8">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.zikrTitle}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.zikrSubtitle}
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital Tasbeeh Counter (sticky only on desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-5 sm:p-8 shadow-2xl border border-emerald-700/40 relative overflow-hidden"
          >
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold">
                  {t.zikrDigitalTasbeeh}
                </span>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? t.zikrSoundOn : t.zikrSoundOff}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Dhikr Selector Tabs */}
            <div className="flex gap-1.5 mb-6 overflow-x-auto pb-2 scrollbar-none relative z-10">
              {counters.map((d, i) => (
                <button
                  key={d.phrase}
                  onClick={() => setDhikrIndex(i)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0 ${
                    i === dhikrIndex
                      ? "bg-amber-400 text-slate-950 shadow-md font-bold"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {isArabic ? d.arabic : d.phrase}
                </button>
              ))}
            </div>

            {/* Arabic Phrase */}
            <p className="font-['Amiri'] text-2xl sm:text-3xl text-center leading-[2.2] mb-1 text-amber-100">
              {currentDhikr.arabic}
            </p>
            <p className="text-center text-xs text-white/60 mb-6 font-medium">
              {currentDhikr.phrase}
            </p>

            {/* Big Interactive Tactile Tasbeeh Ring Button */}
            <div className="flex justify-center mb-6">
              <button
                onClick={increment}
                className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-full flex items-center justify-center transition-all duration-150 active:scale-90 select-none shadow-2xl"
                style={{
                  background: `conic-gradient(#D4AF37 ${progress * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
                }}
              >
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full bg-gradient-to-b from-emerald-800 to-emerald-950 flex flex-col items-center justify-center border-2 border-emerald-600/50 shadow-inner group">
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white group-hover:scale-105 transition-transform">
                    {currentDhikr.current}
                  </span>
                  <span className="text-xs text-emerald-300 font-mono mt-0.5">
                    / {currentDhikr.target}
                  </span>
                  <span className="text-[10px] text-amber-300 uppercase tracking-widest mt-1 font-bold">
                    {t.zikrTapToCount}
                  </span>
                </div>

                {isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 text-slate-950 rounded-full flex items-center justify-center shadow-lg font-bold"
                  >
                    ✓
                  </motion.div>
                )}
              </button>
            </div>

            {/* Round info */}
            <div className="text-center mb-5">
              <span className="text-xs font-semibold text-emerald-300 tracking-wider">
                {t.zikrRound} {currentDhikr.round} / {currentDhikr.totalRounds}
              </span>
            </div>

            {/* Target Presets & Reset Control */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-white/50">{t.zikrTarget}</span>
                {[33, 99, 100].map((tVal) => (
                  <button
                    key={tVal}
                    onClick={() => setPresetTarget(tVal)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-mono ${
                      currentDhikr.target === tVal
                        ? "bg-amber-400 text-slate-950 font-bold"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    {tVal}
                  </button>
                ))}
              </div>

              <button
                onClick={resetDhikr}
                title={t.zikrReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white/80 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.zikrReset}</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Authentic Adhkar Checklist & Categories */}
        <div className="lg:col-span-7 space-y-6">
          {/* Categories Tab Bar with smooth horizontal scroll */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "morning", label: t.zikrMorningAdhkar, icon: Sun },
              { id: "evening", label: t.zikrEveningAdhkar, icon: Moon },
              { id: "prayer", label: t.zikrAfterSalah, icon: Award },
              { id: "before_sleep", label: t.zikrBeforeSleep, icon: Bed },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? "bg-[#1A5D3A] dark:bg-emerald-600 text-white shadow-md shadow-emerald-900/20"
                      : "bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>


          {/* Category Progress Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-700 dark:text-slate-300">
                  {completedCountInCategory} of {totalCountInCategory} Completed
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                  {categoryPercent}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${categoryPercent}%` }}
                />
              </div>
            </div>
            {categoryPercent === 100 && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>All Finished!</span>
              </div>
            )}
          </div>

          {/* Adhkar Cards List */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {categoryAdhkar.map((item, i) => {
                const isDone = completedItems.includes(item.id);
                const isCopied = copiedId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className={`bg-white dark:bg-slate-900 rounded-3xl p-6 border transition-all ${
                      isDone
                        ? "border-emerald-300/80 dark:border-emerald-700/60 bg-emerald-50/20 dark:bg-emerald-950/20"
                        : "border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 dark:text-white text-base">
                            {item.title}
                          </h3>
                          {item.repeat > 1 && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              Repeat {item.repeat}x
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{item.source}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyAdhkar(item)}
                          title="Copy supplication"
                          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => toggleCompleted(item.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                            isDone
                              ? "bg-emerald-600 text-white"
                              : "bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-gray-200"
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isDone ? "Done" : "Mark Done"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <p className="font-['Amiri'] text-2xl text-right leading-[2.2] text-slate-900 dark:text-white my-3 select-text">
                      {item.arabic}
                    </p>

                    {/* Transliteration */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mb-2 leading-relaxed">
                      {item.transliteration}
                    </p>

                    {/* Translation */}
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                      {item.translation}
                    </p>

                    {/* Prophetic Benefit */}
                    {item.benefit && (
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs text-emerald-800 dark:text-emerald-400 flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/30 p-2.5 rounded-xl">
                        <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{item.benefit}</span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

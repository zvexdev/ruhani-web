import { useState, useCallback, useRef } from "react";
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
  Award,
  CircleDot
} from "lucide-react";
import { AUTHENTIC_ADHKAR, type DhikrItem } from "../data/adhkar";
import { soundEffects } from "../lib/sound";
import { useLanguage } from "../context/LanguageContext";
import { triggerSpiritualMilestone, triggerCounterRipple } from "../lib/animations";
import FloatingSacredParticles from "../components/FloatingSacredParticles";

interface DhikrCounter {
  phrase: string;
  arabic: string;
  target: number;
  current: number;
  round: number;
  totalRounds: number;
}

const defaultDhikrs: DhikrCounter[] = [
  { phrase: "SubhanAllah", arabic: "سُبْحَانَ ٱللَّٰهِ", target: 33, current: 0, round: 1, totalRounds: 3 },
  { phrase: "Alhamdulillah", arabic: "ٱلْحَمْدُ لِلَّٰهِ", target: 33, current: 0, round: 1, totalRounds: 3 },
  { phrase: "Allahu Akbar", arabic: "ٱللَّٰهُ أَكْبَرُ", target: 33, current: 0, round: 1, totalRounds: 3 },
  { phrase: "La ilaha illallah", arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ", target: 100, current: 0, round: 1, totalRounds: 1 },
  { phrase: "Astaghfirullah", arabic: "أَسْتَغْفِرُ ٱللَّٰهَ", target: 100, current: 0, round: 1, totalRounds: 1 },
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
  const ringRef = useRef<HTMLButtonElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const currentDhikr = counters[dhikrIndex];
  const progress = currentDhikr ? (currentDhikr.current / currentDhikr.target) * 100 : 0;
  const isComplete = currentDhikr?.current === currentDhikr?.target;

  const toggleCompleted = (id: string) => {
    const isAdding = !completedItems.includes(id);
    const updated = isAdding
      ? [...completedItems, id]
      : completedItems.filter(i => i !== id);
    setCompletedItems(updated);
    localStorage.setItem("ruhani-completed-adhkar", JSON.stringify(updated));
    if (isAdding) {
      if (soundEnabled) soundEffects.playCompletionChime();
      triggerSpiritualMilestone();
    }
  };

  const increment = useCallback(() => {
    triggerCounterRipple(ringRef.current);
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
          triggerSpiritualMilestone(ringRef.current);

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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-40 sm:pb-36">
      {/* Header */}
      <div className="py-6 sm:py-8 max-w-3xl relative">
        <FloatingSacredParticles />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
          <span>{isArabic ? "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ" : "Verily in the remembrance of Allah do hearts find rest"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {t.zikrTitle}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2">
          {t.zikrSubtitle}
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Digital Tasbeeh Counter */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="spiritual-card rounded-3xl p-6 sm:p-8 relative overflow-hidden bg-gradient-to-br from-[#071c12] via-neutral-950 to-black text-white border border-emerald-800/50 shadow-2xl"
          >
            {/* Background arabesque watermark */}
            <div className="absolute inset-0 bg-arabesque-stars opacity-15 pointer-events-none" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-emerald-300 font-bold block">
                    {t.zikrDigitalTasbeeh}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {isArabic ? "مسبحة إلكترونية تفاعلية" : "Interactive Tactile Tasbeeh"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? t.zikrSoundOn : t.zikrSoundOff}
                aria-label={soundEnabled ? t.zikrSoundOn : t.zikrSoundOff}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 border border-white/10 transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-neutral-400" />}
              </button>
            </div>

            {/* Dhikr Selector Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none relative z-10" tabIndex={0} aria-label="Dhikr Selection">
              {counters.map((d, i) => (
                <button
                  key={d.phrase}
                  onClick={() => setDhikrIndex(i)}
                  className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 min-h-[40px] flex items-center ${
                    i === dhikrIndex
                      ? "bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold shadow-lg shadow-amber-400/20 scale-105"
                      : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10"
                  }`}
                >
                  {isArabic ? d.arabic : d.phrase}
                </button>
              ))}
            </div>

            {/* Arabic Phrase Presentation */}
            <div className="text-center my-4 relative z-10">
              <p className="font-['Amiri'] text-3xl sm:text-4xl leading-[2.2] text-amber-100 select-text drop-shadow-sm">
                {currentDhikr.arabic}
              </p>
              <p className="text-xs text-neutral-300 mt-1 font-medium tracking-wide">
                {currentDhikr.phrase}
              </p>
            </div>

            {/* Big Interactive Tactile Tasbeeh Ring Button */}
            <div className="flex justify-center my-6 relative z-10">
              <button
                ref={ringRef}
                onClick={increment}
                aria-label={t.zikrTapToCount}
                className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-full flex items-center justify-center transition-all duration-150 active:scale-95 select-none shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-500/40"
                style={{
                  background: `conic-gradient(#f59e0b ${progress * 3.6}deg, rgba(255,255,255,0.12) 0deg)`,
                }}
              >
                <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-b from-emerald-800 via-emerald-900 to-neutral-950 flex flex-col items-center justify-center border-2 border-emerald-500/50 shadow-inner group transition-transform group-hover:scale-102">
                  <motion.span
                    key={currentDhikr.current}
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    className="text-4xl sm:text-5xl font-extrabold font-mono tracking-tight text-white drop-shadow-md"
                  >
                    {currentDhikr.current}
                  </motion.span>
                  <span className="text-xs text-emerald-300 font-mono mt-0.5 font-semibold">
                    / {currentDhikr.target}
                  </span>
                  <span className="text-[10px] text-amber-300 uppercase tracking-widest mt-1.5 font-bold flex items-center gap-1">
                    <CircleDot className="w-2.5 h-2.5 animate-ping text-amber-300" />
                    {t.zikrTapToCount}
                  </span>
                </div>

                {isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-9 h-9 bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 rounded-full flex items-center justify-center shadow-lg font-bold border-2 border-black"
                  >
                    ✓
                  </motion.div>
                )}
              </button>
            </div>

            {/* Round info & indicators */}
            <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
              <span className="text-xs font-semibold text-emerald-300 tracking-wider">
                {t.zikrRound} {currentDhikr.round} / {currentDhikr.totalRounds}
              </span>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: currentDhikr.totalRounds }).map((_, idx) => (
                  <span
                    key={idx}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx < currentDhikr.round
                        ? "bg-amber-400 ring-2 ring-amber-400/40"
                        : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Target Presets & Reset Control */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 relative z-10">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-neutral-400 font-medium">{t.zikrTarget}</span>
                {[33, 99, 100].map((tVal) => (
                  <button
                    key={tVal}
                    onClick={() => setPresetTarget(tVal)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all min-h-[32px] ${
                      currentDhikr.target === tVal
                        ? "bg-amber-400 text-neutral-950 font-bold shadow-sm"
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white/90 transition-all border border-white/10 active:scale-95 min-h-[36px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.zikrReset}</span>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Authentic Adhkar Checklist & Categories */}
        <div className="lg:col-span-7 space-y-6">
          {/* Categories Tab Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none" tabIndex={0} aria-label="Adhkar Categories">
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
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all min-h-[44px] ${
                    isActive
                      ? "bg-[#1A5D3A] text-white shadow-md shadow-emerald-900/30 ring-2 ring-emerald-500/40"
                      : "spiritual-card text-neutral-700 dark:text-neutral-300 hover:text-emerald-700 dark:hover:text-emerald-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Category Progress Bar */}
          <div className="spiritual-card rounded-2xl p-5 border border-emerald-900/20 shadow-sm flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="text-neutral-700 dark:text-neutral-300">
                  {completedCountInCategory} of {totalCountInCategory} {isArabic ? "مكتمل" : "Completed"}
                </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                  {categoryPercent}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-neutral-100 dark:bg-neutral-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${categoryPercent}%` }}
                />
              </div>
            </div>
            {categoryPercent === 100 && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4 animate-spin text-amber-500" />
                <span>{isArabic ? "تم إكمال جميع الأذكار!" : "All Finished!"}</span>
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
                    transition={{ delay: i * 0.03 }}
                    className={`spiritual-card rounded-3xl p-6 sm:p-7 border transition-all ${
                      isDone
                        ? "border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-inner"
                        : "hover:border-emerald-500/30 hover:shadow-lg"
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-neutral-900 dark:text-white text-base">
                            {item.title}
                          </h3>
                          {item.repeat > 1 && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/40">
                              {isArabic ? `تكرار ${item.repeat} مرات` : `Repeat ${item.repeat}x`}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 flex items-center gap-1.5">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{item.source}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => copyAdhkar(item)}
                          title={t.copy}
                          aria-label={t.copy}
                          className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
                        >
                          {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => toggleCompleted(item.id)}
                          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all min-h-[44px] ${
                            isDone
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isDone ? (isArabic ? "تم الإنجاز" : "Done") : (isArabic ? "تحديد كمكتمل" : "Mark Done")}</span>
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text in Manuscript frame */}
                    <div className="bg-emerald-50/30 dark:bg-neutral-950/60 border border-emerald-900/10 dark:border-neutral-800/80 rounded-2xl p-5 my-4">
                      <p className="font-['Amiri'] text-2xl sm:text-3xl text-right leading-[2.3] text-neutral-900 dark:text-neutral-100 select-text break-words break-anywhere">
                        {item.arabic}
                      </p>
                    </div>

                    {/* Transliteration */}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 italic mb-2 leading-relaxed break-words break-anywhere">
                      {item.transliteration}
                    </p>

                    {/* Translation */}
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 font-serif leading-relaxed break-words break-anywhere">
                      &ldquo;{item.translation}&rdquo;
                    </p>

                    {/* Prophetic Benefit */}
                    {item.benefit && (
                      <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200/40 dark:border-emerald-800/30">
                        <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                        <span className="leading-relaxed">{item.benefit}</span>
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


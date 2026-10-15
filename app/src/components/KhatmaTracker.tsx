import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Award, RotateCcw, Sparkles, X } from "lucide-react";
import { triggerSpiritualMilestone } from "../lib/animations";
import { useLanguage } from "../context/LanguageContext";

interface KhatmaData {
  completedJuz: number[];
  completedSurahs: number[];
  lastUpdated: string;
}

export default function KhatmaTracker({ onClose }: { onClose?: () => void }) {
  const { isArabic } = useLanguage();
  const [data, setData] = useState<KhatmaData>(() => {
    try {
      const saved = localStorage.getItem("ruhani-khatma-progress");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.debug("Failed loading khatma data:", e);
    }
    return {
      completedJuz: [],
      completedSurahs: [],
      lastUpdated: new Date().toISOString(),
    };
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const ringRef = useRef<SVGSVGElement>(null);

  const totalJuz = 30;
  const completedCount = data.completedJuz.length;
  const percent = Math.round((completedCount / totalJuz) * 100);

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  const saveProgress = (newData: KhatmaData) => {
    setData(newData);
    try {
      localStorage.setItem("ruhani-khatma-progress", JSON.stringify(newData));
    } catch (e) {
      console.debug("Failed saving khatma progress:", e);
    }
  };

  const toggleJuz = (juzNum: number) => {
    const isCompleted = data.completedJuz.includes(juzNum);
    const updated = isCompleted
      ? data.completedJuz.filter((j) => j !== juzNum)
      : [...data.completedJuz, juzNum];

    const newData: KhatmaData = {
      ...data,
      completedJuz: updated,
      lastUpdated: new Date().toISOString(),
    };

    saveProgress(newData);

    // Trigger celebration milestone on 100% or every 5th juz completed
    if (!isCompleted && (updated.length === 30 || updated.length % 5 === 0)) {
      if (ringRef.current) {
        triggerSpiritualMilestone(ringRef.current as unknown as HTMLElement);
      }
      if (updated.length === 30) {
        setShowCelebration(true);
      }
    }
  };

  const handleReset = () => {
    if (window.confirm(isArabic ? "هل أنت متأكد من إعادة ضبط تقدم الختمة؟" : "Are you sure you want to reset your Khatma progress?")) {
      const resetData: KhatmaData = {
        completedJuz: [],
        completedSurahs: [],
        lastUpdated: new Date().toISOString(),
      };
      saveProgress(resetData);
      setShowCelebration(false);
    }
  };

  return (
    <div className="bg-[#0a0a0a] text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden max-w-2xl mx-auto">
      {/* Background ambient aura */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
            <Award className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>{isArabic ? "متابعة الختمة القرآنية" : "Sacred Khatma Tracker"}</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {percent}%
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {isArabic
                ? "تابع وردك وقراءتك اليومية حتى ختم كتاب الله الكريم"
                : "Track daily progress towards completing the Holy Quran"}
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Circular Progress Display */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-6 mb-8 bg-black/40 rounded-2xl border border-white/5 relative z-10">
        {/* SVG Circular Ring */}
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg
            ref={ringRef}
            className="w-full h-full -rotate-90 transform"
            viewBox="0 0 160 160"
          >
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-neutral-900"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="url(#khatmaGradient)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="khatmaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-black text-white">{percent}%</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-semibold">
              {completedCount} / 30 {isArabic ? "جزء" : "Juz"}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-center sm:text-start">
          <div className="bg-neutral-900/60 p-3.5 rounded-2xl border border-white/5">
            <span className="text-[11px] text-neutral-400 block font-medium">
              {isArabic ? "الأجزاء المكتملة" : "Completed Juz"}
            </span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {completedCount}
            </span>
          </div>
          <div className="bg-neutral-900/60 p-3.5 rounded-2xl border border-white/5">
            <span className="text-[11px] text-neutral-400 block font-medium">
              {isArabic ? "المتبقي للختم" : "Remaining Juz"}
            </span>
            <span className="text-2xl font-extrabold text-amber-300">
              {totalJuz - completedCount}
            </span>
          </div>
        </div>
      </div>

      {/* 30 Juz Interactive Selection Grid */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
            {isArabic ? "اختر الجزء لتأكيد قراءته (١ - ٣٠):" : "Mark Juz as read (1 - 30):"}
          </h3>
          <button
            onClick={handleReset}
            title={isArabic ? "إعادة الضبط" : "Reset progress"}
            className="text-[11px] text-neutral-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{isArabic ? "إعادة تعيين" : "Reset"}</span>
          </button>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2 max-h-60 overflow-y-auto custom-scrollbar p-1 pb-3">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
            const isDone = data.completedJuz.includes(juzNum);
            return (
              <button
                key={juzNum}
                onClick={() => toggleJuz(juzNum)}
                className={`min-h-[44px] flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                  isDone
                    ? "bg-gradient-to-br from-emerald-600 to-emerald-800 text-white border-emerald-400/50 shadow-md shadow-emerald-900/30"
                    : "bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 border-neutral-800"
                }`}
              >
                <span>{juzNum}</span>
                {isDone ? (
                  <Check className="w-3 h-3 text-amber-300 mt-0.5" />
                ) : (
                  <span className="text-[9px] text-neutral-600 font-normal">
                    {isArabic ? "جزء" : "Juz"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Khatma Mubarak Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-black to-neutral-950 border border-amber-400/60 shadow-2xl text-center relative z-20"
          >
            <div className="w-12 h-12 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center mx-auto mb-3 border border-amber-400/40">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-['Amiri'] text-amber-300 mb-2">
              {isArabic ? "هنيئاً لك ختم كتاب الله الكريم!" : "Mubarak! You have completed the Holy Quran!"}
            </h3>
            <p className="font-['Amiri'] text-base text-emerald-200 leading-relaxed mb-4">
              "اللَّهُمَّ ارْحَمْنِي بِالقُرْآنِ وَاجْعَلْهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً"
            </p>
            <button
              onClick={() => setShowCelebration(false)}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 text-neutral-950 text-xs font-bold hover:scale-105 transition-transform shadow-lg shadow-amber-400/20"
            >
              {isArabic ? "تقبل الله منا ومنكم" : "Alhamdulillah"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

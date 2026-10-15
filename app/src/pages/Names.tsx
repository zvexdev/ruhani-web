import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Search,
  X,
  Volume2,
  Star,
  Award
} from "lucide-react";
import { NAMES_OF_ALLAH } from "../data/namesOfAllah";
import type { NameOfAllah } from "../types";
import { soundEffects } from "../lib/sound";
import { searchMatch } from "../lib/arabic";
import { useLanguage } from "../context/LanguageContext";
import { triggerSpiritualMilestone } from "../lib/animations";
import FloatingSacredParticles from "../components/FloatingSacredParticles";

export default function Names() {
  const { t, language } = useLanguage();
  const [names] = useState<NameOfAllah[]>(NAMES_OF_ALLAH);
  const [filteredNames, setFilteredNames] = useState<NameOfAllah[]>(NAMES_OF_ALLAH);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);
  const [memorized, setMemorized] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("ruhani-memorized-names");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.debug("Failed parsing memorized names:", e);
      return [];
    }
  });

  const toggleMemorized = (number: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isAdding = !memorized.includes(number);
    const updated = isAdding
      ? [...memorized, number]
      : memorized.filter((n) => n !== number);
    setMemorized(updated);
    localStorage.setItem("ruhani-memorized-names", JSON.stringify(updated));
    if (isAdding) {
      soundEffects.playCompletionChime();
      triggerSpiritualMilestone(e?.currentTarget as HTMLElement);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredNames(names);
      return;
    }
    const lower = query.toLowerCase().trim();
    const filtered = names.filter(
      (n) =>
        searchMatch(n.arabic, query) ||
        n.english.toLowerCase().includes(lower) ||
        n.transliteration.toLowerCase().includes(lower) ||
        n.meaning.toLowerCase().includes(lower) ||
        String(n.number) === lower
    );
    setFilteredNames(filtered);
  };

  const speakArabic = (text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const memorizedPercent = Math.round((memorized.length / 99) * 100);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-40 sm:pb-36">
      {/* Header */}
      <div className="py-6 sm:py-8 text-center max-w-2xl mx-auto relative">
        <FloatingSacredParticles />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === "ar" ? "أَسْمَاءُ اللَّهِ الْحُسْنَى" : "The 99 Beautiful Divine Names"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {t.namesTitle}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2">
          {t.namesSubtitle}
        </p>
        <p className="font-['Amiri'] text-2xl md:text-3xl text-emerald-800 dark:text-emerald-400 mt-4 leading-relaxed">
          ﴿ وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا ﴾
        </p>
      </div>

      {/* Memorization Progress Card */}
      <div className="max-w-2xl mx-auto mb-8 bg-gradient-to-br from-[#061e13] via-neutral-950 to-black text-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-arabesque-stars opacity-15 pointer-events-none" />
        <div className="flex items-center justify-between mb-3 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-emerald-300 block">
                {language === "ar" ? "مسيرة الحفظ والتدبر" : "Memorization Journey"}
              </span>
              <span className="text-[11px] text-neutral-400">
                {language === "ar" ? "إحصاء أسماء الله الحسنى" : "Contemplate & commit to heart"}
              </span>
            </div>
          </div>
          <span className="text-sm font-mono font-bold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
            {memorized.length} / 99 ({memorizedPercent}%)
          </span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden relative z-10 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${memorizedPercent}%` }}
          />
        </div>
        <p className="text-[11px] sm:text-xs text-neutral-300 mt-3.5 text-center relative z-10 leading-relaxed font-serif italic">
          {language === "ar"
            ? "«إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا مِائَةً إِلَّا وَاحِدًا مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ» (صحيح البخاري)"
            : "“Allah has ninety-nine names; whoever memorizes and acts upon them will enter Paradise.” (Sahih al-Bukhari)"}
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder={t.namesSearchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full ltr:pl-11 ltr:pr-10 rtl:pr-11 rtl:pl-10 py-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch("")}
              className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 99 Names Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {filteredNames.map((name, i) => {
          const isLearned = memorized.includes(name.number);

          return (
            <motion.div
              key={name.number}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.01, 0.25) }}
              onClick={() => setSelectedName(name)}
              className={`spiritual-card rounded-2xl p-4 sm:p-5 border transition-all text-center cursor-pointer group flex flex-col justify-between relative min-h-[160px] ${
                isLearned
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-400/60 dark:border-amber-700/60 shadow-sm ring-1 ring-amber-400/20"
                  : "hover:border-emerald-500/40 hover:shadow-lg"
              }`}
            >
              {/* Top row: Number and Star */}
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300">
                  #{name.number}
                </span>
                <button
                  onClick={(e) => toggleMemorized(name.number, e)}
                  title={isLearned ? (language === "ar" ? "إلغاء الحفظ" : "Unmark memorized") : (language === "ar" ? "تحديد كمحفوظ" : "Mark memorized")}
                  aria-label={isLearned ? "Unmark memorized" : "Mark memorized"}
                  className={`p-1.5 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                    isLearned ? "text-amber-500" : "text-neutral-300 dark:text-neutral-600 hover:text-amber-400"
                  }`}
                >
                  <Star className="w-4 h-4" fill={isLearned ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Calligraphy */}
              <div className="py-2">
                <p className="font-['Amiri'] text-2xl sm:text-3xl text-neutral-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors drop-shadow-sm">
                  {name.arabic}
                </p>
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mt-1.5">
                  {name.transliteration}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                  {name.english}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredNames.length === 0 && (
        <div className="text-center py-20 spiritual-card rounded-3xl p-8 max-w-md mx-auto my-6">
          <Sparkles className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <p className="text-sm text-neutral-500">
            {language === "ar" ? `لم يتم العثور على اسم يطابق "${searchQuery}"` : `No name found matching "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Name Detail Modal */}
      <AnimatePresence>
        {selectedName && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setSelectedName(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="spiritual-card rounded-3xl p-6 sm:p-8 max-w-md w-full max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center relative"
            >
              <button
                onClick={() => setSelectedName(null)}
                aria-label="Close details"
                className="absolute ltr:right-4 rtl:left-4 top-4 p-2.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 font-mono bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                {language === "ar" ? `الاسم #${selectedName.number} من 99` : `Name #${selectedName.number} of 99`}
              </span>

              <p className="font-['Amiri'] text-5xl sm:text-6xl text-neutral-900 dark:text-white my-5 drop-shadow-md">
                {selectedName.arabic}
              </p>

              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {selectedName.transliteration}
              </h3>

              <p className="text-sm text-emerald-800 dark:text-emerald-400 font-semibold mt-1">
                {selectedName.english}
              </p>

              <div className="mt-5 p-5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/40 text-start">
                <p className="text-xs uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t.namesMeaning}</span>
                </p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-serif">
                  {selectedName.meaning}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
                <button
                  onClick={(e) => speakArabic(selectedName.arabic, e)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#1A5D3A] dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors min-h-[44px]"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{t.namesListenPronounce}</span>
                </button>

                <button
                  onClick={() => toggleMemorized(selectedName.number)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold transition-all min-h-[44px] ${
                    memorized.includes(selectedName.number)
                      ? "bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20"
                      : "bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  }`}
                >
                  <Star className="w-4 h-4" fill={memorized.includes(selectedName.number) ? "currentColor" : "none"} />
                  <span>
                    {memorized.includes(selectedName.number)
                      ? (language === "ar" ? "محفوظ" : "Memorized")
                      : (language === "ar" ? "تحديد كمحفوظ" : "Mark Memorized")}
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


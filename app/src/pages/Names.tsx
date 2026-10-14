import { useState, useEffect } from "react";
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

export default function Names() {
  const { t, language } = useLanguage();
  const [names] = useState<NameOfAllah[]>(NAMES_OF_ALLAH);
  const [filteredNames, setFilteredNames] = useState<NameOfAllah[]>(NAMES_OF_ALLAH);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);
  const [memorized, setMemorized] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("ruhani-memorized-names");
    if (saved) {
      try {
        setMemorized(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const toggleMemorized = (number: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const updated = memorized.includes(number)
      ? memorized.filter((n) => n !== number)
      : [...memorized, number];
    setMemorized(updated);
    localStorage.setItem("ruhani-memorized-names", JSON.stringify(updated));
    if (!memorized.includes(number)) {
      soundEffects.playCompletionChime();
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
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-32 sm:pb-28">
      {/* Header */}
      <div className="py-6 md:py-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.namesTitle}
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 mt-2">
          {t.namesSubtitle}
        </p>
        <p className="font-['Amiri'] text-xl md:text-2xl text-emerald-800 dark:text-emerald-400 mt-3">
          وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا
        </p>
      </div>

      {/* Memorization Progress Card */}
      <div className="max-w-xl mx-auto mb-8 bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-300">
              {language === "ar" ? "مسيرة الحفظ" : "Memorization Journey"}
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300">
            {memorized.length} / 99 {t.namesMemorizedProgress} ({memorizedPercent}%)
          </span>
        </div>
        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-500"
            style={{ width: `${memorizedPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-white/60 mt-3 text-center">
          {language === "ar"
            ? "«إِنَّ لِلَّهِ تِسْعَةً وَتِسْعِينَ اسْمًا مِائَةً إِلَّا وَاحِدًا مَنْ أَحْصَاهَا دَخَلَ الْجَنَّةَ» (صحيح البخاري)"
            : "“Allah has ninety-nine names; whoever memorizes and acts upon them will enter Paradise.” (Sahih al-Bukhari)"}
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t.namesSearchPlaceholder}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full ltr:pl-11 ltr:pr-10 rtl:pr-11 rtl:pl-10 py-3 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch("")}
              className="absolute ltr:right-4 rtl:left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 99 Names Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
        {filteredNames.map((name, i) => {
          const isLearned = memorized.includes(name.number);

          return (
            <motion.div
              key={name.number}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.01, 0.3) }}
              onClick={() => setSelectedName(name)}
              className={`rounded-2xl p-4 border transition-all text-center cursor-pointer group flex flex-col justify-between relative ${
                isLearned
                  ? "bg-amber-50/40 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700"
              }`}
            >
              {/* Top row: Number and Star */}
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-[11px] font-semibold">#{name.number}</span>
                <button
                  onClick={(e) => toggleMemorized(name.number, e)}
                  title={isLearned ? (language === "ar" ? "إلغاء الحفظ" : "Unmark memorized") : (language === "ar" ? "تحديد كمحفوظ" : "Mark memorized")}
                  className={`p-1 rounded-md transition-colors ${
                    isLearned ? "text-amber-500" : "text-slate-300 dark:text-slate-600 hover:text-amber-400"
                  }`}
                >
                  <Star className="w-3.5 h-3.5" fill={isLearned ? "currentColor" : "none"} />
                </button>
              </div>

              {/* Calligraphy */}
              <div className="py-2">
                <p className="font-['Amiri'] text-2xl text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {name.arabic}
                </p>
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                  {name.transliteration}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {name.english}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredNames.length === 0 && (
        <div className="text-center py-20">
          <Sparkles className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">
            {language === "ar" ? `لم يتم العثور على اسم يطابق "${searchQuery}"` : `No name found matching "${searchQuery}"`}
          </p>
        </div>
      )}

      {/* Name Detail Modal */}
      <AnimatePresence>
        {selectedName && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedName(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-200 dark:border-slate-800 text-center relative"
            >
              <button
                onClick={() => setSelectedName(null)}
                className="absolute ltr:right-4 rtl:left-4 top-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="text-xs uppercase font-bold tracking-widest text-emerald-700 dark:text-emerald-400 font-mono">
                {language === "ar" ? `الاسم #${selectedName.number} من 99` : `Name #${selectedName.number} of 99`}
              </span>

              <p className="font-['Amiri'] text-5xl text-slate-900 dark:text-white my-4">
                {selectedName.arabic}
              </p>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {selectedName.transliteration}
              </h3>

              <p className="text-sm text-emerald-800 dark:text-emerald-400 font-semibold mt-1">
                {selectedName.english}
              </p>

              <div className="mt-5 p-5 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-start">
                <p className="text-xs uppercase font-bold tracking-wider text-emerald-800 dark:text-emerald-300 mb-1">
                  {t.namesMeaning}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                  {selectedName.meaning}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={(e) => speakArabic(selectedName.arabic, e)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#1A5D3A] dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-200 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{t.namesListenPronounce}</span>
                </button>

                <button
                  onClick={() => toggleMemorized(selectedName.number)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-colors ${
                    memorized.includes(selectedName.number)
                      ? "bg-amber-400 text-slate-950"
                      : "bg-gray-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gray-200"
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


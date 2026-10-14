import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Play,
  Pause,
  Languages,
  Bookmark,
  Copy,
  Check,
  FileText,
  Headphones,
  Loader2
} from "lucide-react";
import * as api from "../services/api";
import type { SurahMeta, SurahDetail, SearchResult, Verse } from "../types";
import { useAudio } from "../context/AudioContext";
import { useLanguage } from "../context/LanguageContext";
import { searchMatch } from "../lib/arabic";
import { RECITERS_LIST, getAyahAudioUrl } from "../data/reciters";

export default function Quran() {
  const { t, isArabic } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSurah = Number(searchParams.get("surah")) || 1;

  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [currentSurah, setCurrentSurah] = useState<number>(initialSurah);
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSidebar, setShowSidebar] = useState(false);
  const [surahFilterQuery, setSurahFilterQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [translation, setTranslation] = useState<"sahih_international" | "pickthall" | "yusuf_ali">("sahih_international");
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const savedBookmarks = localStorage.getItem("ruhani-quran-bookmarks");
      return savedBookmarks ? JSON.parse(savedBookmarks) : [];
    } catch (e) {
      console.debug("Failed parsing saved bookmarks:", e);
      return [];
    }
  });
  const [fontSize, setFontSize] = useState<number>(28);
  const [viewMode, setViewMode] = useState<"verses" | "mushaf">("verses");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedReciter, setSelectedReciter] = useState<number>(1);

  // Tafsir state
  const [activeTafsirAyah, setActiveTafsirAyah] = useState<Verse | null>(null);
  const [tafsirText, setTafsirText] = useState<string>("");
  const [tafsirLoading, setTafsirLoading] = useState(false);

  const { playTrack, currentTrack, isPlaying } = useAudio();
  const verseRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    loadSurahs();
  }, []);

  useEffect(() => {
    loadSurah(currentSurah);
    setSearchParams({ surah: String(currentSurah) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSurah, setSearchParams]);

  async function loadSurahs() {
    try {
      const data = await api.getAllSurahs();
      setSurahs(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadSurah(num: number) {
    setLoading(true);
    try {
      const data = await api.getSurah(num);
      setSurahDetail(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      setHasSearched(false);
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    setHasSearched(true);
    try {
      // 1. Also search local verses in the currently loaded surah
      const localMatches: SearchResult[] = (surahDetail?.verses || [])
        .filter(
          (v) =>
            searchMatch(v.arabic, searchQuery) ||
            v.translations.sahih_international?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.translations.pickthall?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            v.translations.yusuf_ali?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((v) => ({
          verse_key: v.verse_key,
          surah_number: currentSurah,
          surah_name: currentSurahMeta?.name_english || `Surah ${currentSurah}`,
          ayah: v.ayah,
          arabic: v.arabic,
          transliteration: v.transliteration || "",
          matched_in: "arabic",
          translation: v.translations[translation] || v.translations.sahih_international,
          translation_source: translation,
        }));

      // 2. Query global search API
      const data = await api.searchQuran(searchQuery);
      const apiResults = data.results || [];

      // Deduplicate by verse_key
      const seen = new Set<string>();
      const combined: SearchResult[] = [];
      for (const item of [...localMatches, ...apiResults]) {
        if (!seen.has(item.verse_key)) {
          seen.add(item.verse_key);
          combined.push(item);
        }
      }
      setSearchResults(combined);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }

  function toggleBookmark(verseKey: string) {
    const updated = bookmarks.includes(verseKey)
      ? bookmarks.filter((b) => b !== verseKey)
      : [...bookmarks, verseKey];
    setBookmarks(updated);
    localStorage.setItem("ruhani-quran-bookmarks", JSON.stringify(updated));
  }

  const handlePlayAyah = (verse: Verse) => {
    const reciter = RECITERS_LIST.find((r) => r.id === selectedReciter) || RECITERS_LIST[0];
    const audioUrl = getAyahAudioUrl(selectedReciter, currentSurah, verse.ayah);

    playTrack({
      title: `${currentSurahMeta?.name_english || "Surah"} — Ayah ${verse.ayah}`,
      subtitle: `${reciter.name} (${reciter.name_arabic})`,
      arabicTitle: `${currentSurahMeta?.name_arabic} : ${verse.ayah}`,
      src: audioUrl,
    });
  };

  const openTafsir = async (verse: Verse) => {
    setActiveTafsirAyah(verse);
    setTafsirLoading(true);
    try {
      const res = await api.getTafsir("ar-tafsir-al-saadi", currentSurah, verse.ayah);
      setTafsirText(res.text || "Tafsir unavailable for this verse.");
    } catch {
      setTafsirText("Tafsir details are currently not available.");
    } finally {
      setTafsirLoading(false);
    }
  };

  const copyVerse = (verse: Verse) => {
    const text = `${verse.arabic}\n\n"${verse.translations[translation]}"\n— [Surah ${verse.verse_key}]`;
    navigator.clipboard.writeText(text);
    setCopiedKey(verse.verse_key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const currentSurahMeta = surahs.find((s) => s.number === currentSurah);
  const filteredSurahs = surahs.filter(
    (s) =>
      s.name_english.toLowerCase().includes(surahFilterQuery.toLowerCase()) ||
      s.name_complex?.toLowerCase().includes(surahFilterQuery.toLowerCase()) ||
      s.name_translation?.toLowerCase().includes(surahFilterQuery.toLowerCase()) ||
      searchMatch(s.name_arabic, surahFilterQuery) ||
      String(s.number).includes(surahFilterQuery)
  );

  const matchingSurahs = searchQuery.trim()
    ? surahs
        .filter(
          (s) =>
            searchMatch(s.name_arabic, searchQuery) ||
            s.name_english.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.name_complex?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.name_translation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(s.number) === searchQuery.trim()
        )
        .slice(0, 6)
    : [];

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-32 sm:pb-28">
      {/* Quran Header Toolbar */}
      <div className="py-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/60 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {currentSurahMeta?.name_english || "The Holy Quran"}
            </h1>
            <span className="font-['Amiri'] text-2xl text-emerald-700 dark:text-emerald-400 font-bold">
              {currentSurahMeta?.name_arabic}
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isArabic ? "سورة رقم" : "Surah #"} {currentSurah} &middot; {currentSurahMeta?.verses_count || surahDetail?.total_verses || 0} {t.quranVersesCount} &middot;{" "}
            {currentSurahMeta?.revelation_place === "makkah" ? t.quranMeccan : t.quranMedinan}
          </p>
        </div>

        {/* View Controls & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="bg-gray-100 dark:bg-slate-800 p-1 rounded-full flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode("verses")}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                viewMode === "verses"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {t.quranModeVerses}
            </button>
            <button
              onClick={() => setViewMode("mushaf")}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                viewMode === "mushaf"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {t.quranModeMushaf}
            </button>
          </div>

          {/* Font Size slider */}
          <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-slate-700 text-xs">
            <span className="text-slate-400">Aa</span>
            <input
              type="range"
              min={20}
              max={44}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-20 h-1 bg-slate-300 dark:bg-slate-700 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-slate-400 font-bold">Aa</span>
          </div>

          {/* Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
            title={t.search}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Surah Drawer Button */}
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A5D3A] dark:bg-emerald-600 text-white hover:bg-[#13472d] transition-colors text-xs font-semibold"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t.quranSurahsButton} ({currentSurah}/114)</span>
          </button>
        </div>
      </div>

      {/* Global Search Popup */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden my-4"
          >
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 shadow-xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t.quranSearchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (!e.target.value.trim()) {
                      setSearchResults([]);
                      setHasSearched(false);
                    }
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="px-5 py-2.5 bg-[#1A5D3A] text-white rounded-xl text-sm font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-2"
                >
                  {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : t.search}
                </button>
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchResults([]);
                    setSearchQuery("");
                    setHasSearched(false);
                  }}
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Loading Indicator */}
              {searchLoading && (
                <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>{isArabic ? "جاري البحث في القرآن الكريم..." : "Searching the Holy Quran..."}</span>
                </div>
              )}

              {/* Matching Surahs */}
              {matchingSurahs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                    {isArabic ? `سور مطابقة (${matchingSurahs.length})` : `Matching Surahs (${matchingSurahs.length})`}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {matchingSurahs.map((surah) => (
                      <button
                        key={surah.number}
                        onClick={() => {
                          setCurrentSurah(surah.number);
                          setShowSearch(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-100 dark:border-slate-800 hover:bg-emerald-50/60 dark:hover:bg-slate-800 text-start transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {surah.name_english}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            #{surah.number} &middot; {surah.verses_count}v
                          </span>
                        </div>
                        <span className="font-['Amiri'] text-emerald-700 dark:text-emerald-400 text-sm font-bold shrink-0">
                          {surah.name_arabic}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Verses */}
              {searchResults.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                    {isArabic ? `آيات مطابقة (${searchResults.length})` : `Matching Verses (${searchResults.length})`}
                  </p>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800 custom-scrollbar">
                    {searchResults.map((result) => (
                      <button
                        key={result.verse_key}
                        onClick={() => {
                          setCurrentSurah(result.surah_number);
                          setShowSearch(false);
                          setTimeout(() => {
                            const el = verseRefs.current[result.verse_key];
                            el?.scrollIntoView({ behavior: "smooth", block: "center" });
                          }, 500);
                        }}
                        className="w-full text-left p-3 hover:bg-emerald-50/50 dark:hover:bg-slate-800/50 transition-colors rounded-xl"
                      >
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                          {result.surah_name} ({result.verse_key})
                        </p>
                        <p className="font-['Amiri'] text-right text-base text-slate-900 dark:text-slate-100 mt-1">
                          {result.arabic}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                          {result.translation}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {hasSearched && !searchLoading && matchingSurahs.length === 0 && searchResults.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <p className="font-bold text-slate-700 dark:text-slate-300 text-sm mb-1">
                    {isArabic ? `لم نجد نتائج مطابقة لـ "${searchQuery}"` : `No matching surahs or verses found for "${searchQuery}"`}
                  </p>
                  <p className="text-slate-400 max-w-sm mx-auto leading-relaxed">
                    {isArabic
                      ? "جرّب البحث باسم السورة (مثل: يس، الكهف، الفاتحة) أو برقمها (مثل: 36)، أو كلمات بالإنجليزية مثل: mercy, patience, peace."
                      : "Try searching by Surah name (e.g. 'Yasin', 'Kahf'), Surah number (e.g. '36', '18'), or English keywords (e.g. 'peace', 'patience', 'mercy')."}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-8 mt-6">
        {/* Mobile Surah Drawer Sheet (< lg) */}
        <AnimatePresence>
          {showSidebar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSidebar(false)}
                className="lg:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: isArabic ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: isArabic ? "100%" : "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="lg:hidden fixed inset-y-0 start-0 z-50 w-[85vw] max-w-[340px] bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-e border-gray-200 dark:border-slate-800"
              >
                <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>{t.quranSurahsButton} (114)</span>
                  </span>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-3 border-b border-gray-100 dark:border-slate-800">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={isArabic ? "ابحث في السور الـ ١١٤..." : "Filter 114 Surahs..."}
                      value={surahFilterQuery}
                      onChange={(e) => setSurahFilterQuery(e.target.value)}
                      className="w-full ltr:pl-9 ltr:pr-8 rtl:pr-9 rtl:pl-8 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {surahFilterQuery && (
                      <button
                        onClick={() => setSurahFilterQuery("")}
                        className="absolute ltr:right-2.5 rtl:left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-gray-100/60 dark:divide-slate-800/50 pb-20 custom-scrollbar">
                  {filteredSurahs.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => {
                        setCurrentSurah(surah.number);
                        setShowSidebar(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3.5 text-start transition-all group ${
                        surah.number === currentSurah
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border-s-4 border-emerald-600 dark:border-emerald-400"
                          : "hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105 ${
                          surah.number === currentSurah
                            ? "bg-gradient-to-br from-[#1A5D3A] to-emerald-700 text-white shadow-md shadow-emerald-900/20"
                            : "bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {surah.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs truncate font-bold text-slate-900 dark:text-white">
                            {isArabic ? surah.name_arabic : surah.name_english}
                          </p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-normal">
                            {surah.revelation_place === "makkah" ? (isArabic ? "مكية" : "Makkah") : (isArabic ? "مدنية" : "Madinah")}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {surah.verses_count} {t.quranVersesCount} &middot; {surah.name_translation || (isArabic ? surah.name_english : surah.name_arabic)}
                        </p>
                      </div>
                      <span className="font-['Amiri'] text-base text-slate-800 dark:text-slate-200 shrink-0 font-bold">
                        {surah.name_arabic}
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Surahs Sidebar (lg+) */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="hidden lg:block overflow-hidden flex-shrink-0"
            >
              <div className="w-[340px] bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm max-h-[calc(100vh-180px)] flex flex-col">
                <div className="p-3.5 border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={isArabic ? "ابحث في السور الـ ١١٤..." : "Filter 114 Surahs..."}
                      value={surahFilterQuery}
                      onChange={(e) => setSurahFilterQuery(e.target.value)}
                      className="w-full ltr:pl-9 ltr:pr-8 rtl:pr-9 rtl:pl-8 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {surahFilterQuery && (
                      <button
                        onClick={() => setSurahFilterQuery("")}
                        className="absolute ltr:right-2.5 rtl:left-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-gray-100/60 dark:divide-slate-800/50 custom-scrollbar">
                  {filteredSurahs.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => {
                        setCurrentSurah(surah.number);
                      }}
                      className={`w-full flex items-center gap-3 p-3.5 text-start transition-all group ${
                        surah.number === currentSurah
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border-s-4 border-emerald-600 dark:border-emerald-400"
                          : "hover:bg-emerald-50/40 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105 ${
                          surah.number === currentSurah
                            ? "bg-gradient-to-br from-[#1A5D3A] to-emerald-700 text-white shadow-md shadow-emerald-900/20"
                            : "bg-gray-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {surah.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs truncate font-bold text-slate-900 dark:text-white">
                            {isArabic ? surah.name_arabic : surah.name_english}
                          </p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-normal">
                            {surah.revelation_place === "makkah" ? (isArabic ? "مكية" : "Makkah") : (isArabic ? "مدنية" : "Madinah")}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {surah.verses_count} {t.quranVersesCount} &middot; {surah.name_translation || (isArabic ? surah.name_english : surah.name_arabic)}
                        </p>
                      </div>
                      <span className="font-['Amiri'] text-base text-slate-800 dark:text-slate-200 shrink-0 font-bold">
                        {surah.name_arabic}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quran Reader Body */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-28">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-[#1A5D3A] dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-400">Loading sacred revelation...</p>
              </div>
            </div>
          ) : surahDetail ? (
            <div>
              {/* Surah Bismillah Card */}
              <div className="bg-gradient-to-b from-white to-emerald-50/20 dark:from-slate-900 dark:to-slate-900/60 rounded-3xl p-6 md:p-10 border border-emerald-900/10 dark:border-emerald-500/20 shadow-sm text-center mb-8 relative overflow-hidden">
                <div className="max-w-xl mx-auto">
                  <h2 className="font-['Amiri'] text-4xl md:text-5xl text-slate-900 dark:text-white mb-2">
                    {surahDetail.surah.name_arabic}
                  </h2>
                  <p className="text-xl font-bold text-emerald-800 dark:text-emerald-400">
                    {currentSurahMeta?.name_english}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {currentSurahMeta?.name_translation} &middot; {surahDetail.total_verses} Verses &middot;{" "}
                    {currentSurahMeta?.revelation_place === "makkah" ? "Meccan" : "Medinan"}
                  </p>

                  {/* Sheikh Reciter & Translation Pickers */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    {/* Reciter selector */}
                    <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3.5 py-2 rounded-full border border-emerald-900/10 dark:border-emerald-500/20 shadow-sm text-xs">
                      <Headphones className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-slate-400 font-medium hidden sm:inline">{t.quranReciterLabel}</span>
                      <select
                        value={selectedReciter}
                        onChange={(e) => setSelectedReciter(Number(e.target.value))}
                        className="bg-transparent text-slate-800 dark:text-slate-100 font-semibold focus:outline-none cursor-pointer max-w-[210px] truncate"
                      >
                        {RECITERS_LIST.map((r) => (
                          <option key={r.id} value={r.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                            {r.name} ({r.name_arabic})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Translation picker */}
                    <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3.5 py-2 rounded-full border border-emerald-900/10 dark:border-emerald-500/20 shadow-sm text-xs">
                      <Languages className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-400 font-medium hidden sm:inline">{t.quranTranslationLabel}</span>
                      <select
                        value={translation}
                        onChange={(e) => setTranslation(e.target.value as "sahih_international" | "pickthall" | "yusuf_ali")}
                        className="bg-transparent text-slate-700 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
                      >
                        <option value="sahih_international" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">Sahih International</option>
                        <option value="pickthall" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">Pickthall Translation</option>
                        <option value="yusuf_ali" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">Yusuf Ali Translation</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Bismillah Header (except Surah At-Tawbah) */}
                {currentSurah !== 9 && (
                  <div className="mt-8 pt-6 border-t border-emerald-950/10 dark:border-emerald-500/10">
                    <p className="font-['Amiri'] text-2xl md:text-3xl text-emerald-950 dark:text-emerald-200">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </p>
                  </div>
                )}
              </div>

              {/* View Mode: Mushaf Continuous Reading Mode */}
              {viewMode === "mushaf" ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-14 border border-emerald-900/10 dark:border-emerald-500/10 shadow-md">
                  <div
                    className="font-['Amiri'] text-right leading-[2.6] text-slate-900 dark:text-slate-100 text-justify"
                    style={{ fontSize: `${fontSize}px`, textJustify: "inter-word" }}
                  >
                    {surahDetail.verses.map((verse) => (
                      <span key={verse.verse_key} className="inline hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                        {verse.arabic}{" "}
                        <span className="inline-flex items-center justify-center font-sans text-xs px-2 py-0.5 mx-1 rounded-full bg-amber-100/70 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold align-middle select-none border border-amber-300/40">
                          {verse.ayah}
                        </span>{" "}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                /* View Mode: Verse by Verse Detailed Cards */
                <div className="space-y-4">
                  {surahDetail.verses.map((verse) => {
                    const isBookmarked = bookmarks.includes(verse.verse_key);
                    const isCopied = copiedKey === verse.verse_key;
                    const paddedSurah = String(currentSurah).padStart(3, "0");
                    const paddedAyah = String(verse.ayah).padStart(3, "0");
                    const isThisAyahActive = Boolean(currentTrack?.src && currentTrack.src.endsWith(`${paddedSurah}${paddedAyah}.mp3`));
                    const isThisAyahPlaying = isThisAyahActive && isPlaying;

                    return (
                      <div
                        key={verse.verse_key}
                        ref={(el) => {
                          verseRefs.current[verse.verse_key] = el;
                        }}
                        className={`bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 md:p-8 border transition-all duration-300 group ${
                          isThisAyahPlaying
                            ? "border-emerald-500/80 dark:border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20"
                            : "border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md"
                        }`}
                      >
                        {/* Top Actions Row */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50 dark:border-slate-800/80">
                          <div className="flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                              isThisAyahPlaying
                                ? "bg-emerald-600 text-white"
                                : "bg-emerald-100 dark:bg-emerald-950 text-[#1A5D3A] dark:text-emerald-400"
                            }`}>
                              {verse.ayah}
                            </span>
                            <span className="text-xs text-slate-400">
                              {verse.verse_key}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Play Ayah Audio */}
                            <button
                              onClick={() => handlePlayAyah(verse)}
                              title={isThisAyahPlaying ? t.playerPause : t.quranPlayVerse}
                              className={`p-2 rounded-xl transition-all ${
                                isThisAyahPlaying
                                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                  : "hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400"
                              }`}
                            >
                              {isThisAyahPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>

                            {/* View Tafsir */}
                            <button
                              onClick={() => openTafsir(verse)}
                              title={t.quranTafsirBtn}
                              className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            {/* Copy Verse */}
                            <button
                              onClick={() => copyVerse(verse)}
                              title={t.quranCopyVerse}
                              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>

                            {/* Bookmark Verse */}
                            <button
                              onClick={() => toggleBookmark(verse.verse_key)}
                              title={t.quranBookmarkVerse}
                              className={`p-2 rounded-xl transition-colors ${
                                isBookmarked
                                  ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                                  : "hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-400"
                              }`}
                            >
                              <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
                            </button>
                          </div>
                        </div>

                        {/* Arabic Typography with adjustable font size */}
                        <p
                          className="font-['Amiri'] text-right leading-[2.2] text-slate-900 dark:text-white select-text"
                          style={{ fontSize: `${fontSize}px` }}
                        >
                          {verse.arabic}
                        </p>

                        {/* Transliteration */}
                        {verse.transliteration && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 italic leading-relaxed">
                            {verse.transliteration}
                          </p>
                        )}

                        {/* Translation */}
                        <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 mt-3 font-serif leading-relaxed">
                          {verse.translations?.[translation] || verse.translations?.sahih_international || ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Prev / Next Surah Pagination */}
              <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200 dark:border-slate-800">
                <button
                  onClick={() => currentSurah > 1 && setCurrentSurah(currentSurah - 1)}
                  disabled={currentSurah <= 1}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t.quranPrevSurah}</span>
                </button>

                <span className="text-xs font-mono text-slate-400">
                  {isArabic ? "سورة" : "Surah"} {currentSurah} / 114
                </span>

                <button
                  onClick={() => currentSurah < 114 && setCurrentSurah(currentSurah + 1)}
                  disabled={currentSurah >= 114}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-full text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
                >
                  <span>{t.quranNextSurah}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Tafsir Modal */}
      <AnimatePresence>
        {activeTafsirAyah && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveTafsirAyah(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-slate-800 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.quranTafsirTitle} — {isArabic ? "سورة" : "Surah"} {activeTafsirAyah.verse_key}</span>
                  </h3>
                  <p className="text-xs text-slate-400">Tafsir as-Sa'di / Ibn Kathir commentary</p>
                </div>
                <button
                  onClick={() => setActiveTafsirAyah(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Ayah Snippet */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-2xl mb-4 border border-emerald-100 dark:border-emerald-900/30">
                <p className="font-['Amiri'] text-right text-xl text-emerald-900 dark:text-emerald-200 mb-2 leading-relaxed">
                  {activeTafsirAyah.arabic}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-serif italic">
                  &ldquo;{activeTafsirAyah.translations?.[translation] || activeTafsirAyah.translations?.sahih_international}&rdquo;
                </p>
              </div>

              {/* Tafsir Commentary */}
              <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {tafsirLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-serif whitespace-pre-line">
                    {tafsirText}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                <button
                  onClick={() => setActiveTafsirAyah(null)}
                  className="px-5 py-2 bg-[#1A5D3A] text-white rounded-full text-xs font-semibold hover:bg-emerald-800 transition-colors"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

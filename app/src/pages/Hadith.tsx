import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Search,
  X,
  ChevronDown,
  Loader2,
  Quote,
  Copy,
  Check,
  Bookmark,
  BookOpen
} from "lucide-react";
import * as api from "../services/api";
import type { HadithCollection, Hadith } from "../types";
import { useLanguage } from "../context/LanguageContext";
import { triggerBookmarkBurst } from "../lib/animations";
import FloatingSacredParticles from "../components/FloatingSacredParticles";

export default function HadithPage() {
  const { t, language } = useLanguage();
  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [randomHadith, setRandomHadith] = useState<Hadith | null>(null);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedHadiths, setSavedHadiths] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("ruhani-saved-hadiths");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.debug("Failed parsing saved hadiths:", e);
      return [];
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [collectionsData, random] = await Promise.all([
        api.getHadithCollections(),
        api.getRandomHadith(),
      ]);
      setCollections(collectionsData.collections || []);
      setRandomHadith(random);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function browseCollection(key: string, pageNum = 1) {
    setLoading(true);
    try {
      const data = await api.browseHadithCollection(key, pageNum, 20);
      setHadiths(data.hadiths || []);
      setSelectedCollection(key);
      setPage(pageNum);
      setShowCollections(false);
      window.scrollTo({ top: 300, behavior: "smooth" });
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
    setSearching(true);
    setHasSearched(true);
    try {
      const data = await api.searchHadiths(searchQuery);
      setSearchResults(data.results || []);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  async function loadNewRandom() {
    try {
      const data = await api.getRandomHadith();
      setRandomHadith(data);
    } catch (err) {
      console.error(err);
    }
  }

  const toggleSaveHadith = (id: string, targetEl?: HTMLElement | null) => {
    const isAdding = !savedHadiths.includes(id);
    const updated = isAdding
      ? [...savedHadiths, id]
      : savedHadiths.filter(h => h !== id);
    setSavedHadiths(updated);
    localStorage.setItem("ruhani-saved-hadiths", JSON.stringify(updated));
    if (isAdding && targetEl) {
      triggerBookmarkBurst(targetEl);
    }
  };

  const copyHadithText = (hadith: Hadith) => {
    const text = `"${hadith.english}"\n\n${hadith.arabic ? hadith.arabic + "\n\n" : ""}— [${hadith.collection_name} #${hadith.hadithnumber}] (${hadith.grade})`;
    navigator.clipboard.writeText(text);
    setCopiedId(hadith.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const selectedCollectionMeta = collections.find((c) => c.key === selectedCollection);
  if (loading && collections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#1A5D3A] dark:text-emerald-400" />
      </div>
    );
  }

  const displayedHadiths = hasSearched ? searchResults : hadiths;

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-40 sm:pb-36">
      {/* Header */}
      <div className="py-6 sm:py-8 max-w-3xl relative">
        <FloatingSacredParticles />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
          <BookOpen className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === "ar" ? "السُّنَّةُ النَّبَوِيَّةُ الْمُطَهَّرَة" : "The Prophetic Sunnah & Canonical Traditions"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {t.hadithTitle}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2">
          {t.hadithSubtitle}
        </p>
      </div>

      {/* Featured / Random Hadith */}
      {randomHadith && !selectedCollection && !searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="spiritual-card rounded-3xl p-6 sm:p-8 md:p-10 border border-emerald-900/20 shadow-xl mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                <Quote className="w-4 h-4 text-amber-400" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {language === "ar" ? "حديث شريف مختار" : "Featured Hadith"}
              </span>
            </div>
            <button
              onClick={loadNewRandom}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
            >
              <span>{language === "ar" ? "حديث آخر ↺" : "Get Another Hadith →"}</span>
            </button>
          </div>

          <p className="font-serif text-lg md:text-xl text-neutral-800 dark:text-neutral-200 leading-relaxed relative z-10">
            &ldquo;{randomHadith.english}&rdquo;
          </p>

          {randomHadith.arabic && (
            <div className="font-['Amiri'] text-xl sm:text-2xl text-right text-neutral-900 dark:text-neutral-100 mt-5 leading-[2.3] bg-emerald-50/40 dark:bg-neutral-950/80 border border-emerald-900/10 dark:border-neutral-800/80 p-5 rounded-2xl relative z-10 select-text">
              {randomHadith.arabic}
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800/80 relative z-10 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                {randomHadith.collection_name} #{randomHadith.hadithnumber}
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300/40 dark:border-emerald-800/40">
                {randomHadith.grade}
              </span>
            </div>

            <button
              onClick={() => copyHadithText(randomHadith)}
              className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-900 min-h-[44px]"
            >
              {copiedId === randomHadith.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId === randomHadith.id ? t.copied : t.copy}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Search Input Bar */}
      <div className="spiritual-card rounded-3xl p-3 sm:p-4 border border-emerald-900/20 shadow-sm mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder={t.hadithSearchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) setSearchResults([]);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-transparent text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-3 bg-[#1A5D3A] text-white rounded-2xl text-xs font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-2"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>{t.search}</span>}
          </button>
          {(searchQuery || hasSearched || selectedCollection) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setHasSearched(false);
                setSelectedCollection(null);
                setHadiths([]);
              }}
              aria-label="Clear Search"
              className="p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Canonical Collections Grid */}
      {!searchQuery && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {language === "ar" ? "أمهات كتب الحديث الشريف" : "Browse Canonical Hadith Books"}
            </h2>
            <button
              onClick={() => setShowCollections(!showCollections)}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 p-1"
            >
              <span>{showCollections ? (language === "ar" ? "طي" : "Collapse") : (language === "ar" ? "عرض الكل" : "View All")}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCollections ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {collections.slice(0, showCollections ? collections.length : 4).map((col) => {
              const isSelected = selectedCollection === col.key;

              return (
                <button
                  key={col.key}
                  onClick={() => browseCollection(col.key)}
                  className={`spiritual-card p-5 rounded-2xl border text-start transition-all min-h-[110px] ${
                    isSelected
                      ? "border-emerald-600 dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-sm ring-2 ring-emerald-500/30"
                      : "hover:border-emerald-500/30 hover:shadow-md"
                  }`}
                >
                  <p className="font-bold text-sm text-neutral-900 dark:text-white truncate">
                    {language === "ar" && col.arabic_name ? col.arabic_name : col.name}
                  </p>
                  <p className="font-['Amiri'] text-xs text-neutral-400 mt-1 truncate">
                    {language === "ar" ? col.name : col.arabic_name}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-[11px] text-neutral-400">
                      {col.total_hadiths?.toLocaleString()} {language === "ar" ? "حديث" : "hadiths"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300/40 dark:border-emerald-800/40">
                      {col.reliability}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Collection Header */}
      {selectedCollectionMeta && !searchQuery && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
              {language === "ar" && selectedCollectionMeta.arabic_name ? selectedCollectionMeta.arabic_name : selectedCollectionMeta.name}
            </h3>
            <p className="text-xs text-neutral-400">{selectedCollectionMeta.author}</p>
          </div>
          <span className="text-xs font-mono text-neutral-400">
            {language === "ar" ? `الصفحة ${page}` : `Page ${page}`}
          </span>
        </div>
      )}

      {/* Searching loading indicator */}
      {searching && (
        <div className="text-center py-12 spiritual-card rounded-3xl border border-emerald-900/20 shadow-sm mb-6">
          <Loader2 className="w-8 h-8 animate-spin text-[#1A5D3A] dark:text-emerald-400 mx-auto mb-2" />
          <p className="text-xs text-neutral-500 font-medium">
            {language === "ar" ? "جاري البحث في الأحاديث النبوية الشريفة..." : "Searching authentic Hadith..."}
          </p>
        </div>
      )}

      {/* Empty State when search returns 0 */}
      {hasSearched && !searching && searchResults.length === 0 && (
        <div className="text-center py-16 spiritual-card rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm mb-6 max-w-md mx-auto">
          <BookOpen className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
            {language === "ar" ? `لم يتم العثور على أحاديث تطابق "${searchQuery}"` : `No Hadiths found matching "${searchQuery}"`}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 max-w-sm mx-auto leading-relaxed">
            {language === "ar" ? "جرّب البحث بكلمة عامة مثل: نية، صلاة، طهارة، صدقة، أو باللغة الإنجليزية." : "Try searching with keywords like 'prayer', 'intention', 'purity', or 'charity'."}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSearchResults([]);
              setHasSearched(false);
            }}
            className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold hover:bg-emerald-200 transition-colors min-h-[44px]"
          >
            {language === "ar" ? "مسح البحث وعرض الأحاديث" : "Clear Search"}
          </button>
        </div>
      )}

      {/* Hadiths Stream List */}
      <div className="space-y-4">
        {displayedHadiths.map((hadith, i) => {
          const isSaved = savedHadiths.includes(hadith.id);
          const isCopied = copiedId === hadith.id;

          return (
            <motion.div
              key={hadith.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.25) }}
              className="spiritual-card rounded-3xl p-6 sm:p-7 border transition-all hover:border-emerald-500/30 hover:shadow-lg"
            >
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-neutral-100 dark:border-neutral-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    {hadith.collection_name} #{hadith.hadithnumber}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300/40 dark:border-emerald-800/40">
                    {hadith.grade}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => copyHadithText(hadith)}
                    title={t.copy}
                    aria-label={t.copy}
                    className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 min-h-[38px] min-w-[38px] flex items-center justify-center"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={(e) => toggleSaveHadith(hadith.id, e.currentTarget)}
                    title={isSaved ? (language === "ar" ? "إزالة الحفظ" : "Remove bookmark") : (language === "ar" ? "حفظ الحديث" : "Bookmark hadith")}
                    aria-label={isSaved ? "Remove bookmark" : "Bookmark hadith"}
                    className={`p-2 rounded-lg transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center ${
                      isSaved ? "text-amber-500" : "text-neutral-400 hover:text-amber-500"
                    }`}
                  >
                    <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              {/* Hadith Content */}
              {hadith.arabic ? (
                <div>
                  <div className="font-['Amiri'] text-right text-lg sm:text-xl text-neutral-900 dark:text-neutral-100 leading-[2.3] bg-emerald-50/30 dark:bg-neutral-950/80 border border-emerald-900/10 dark:border-neutral-800/80 p-4 sm:p-5 rounded-2xl mb-3 select-text">
                    {hadith.arabic}
                  </div>
                  <p className="font-serif text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    &ldquo;{hadith.english}&rdquo;
                  </p>
                </div>
              ) : (
                <p className="font-serif text-base text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  &ldquo;{hadith.english}&rdquo;
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {selectedCollection && !searchQuery && displayedHadiths.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => browseCollection(selectedCollection, page - 1)}
            disabled={page <= 1}
            className="px-5 py-2.5 rounded-full spiritual-card text-xs font-semibold text-neutral-700 dark:text-neutral-300 disabled:opacity-40 min-h-[44px]"
          >
            {t.hadithPrevPage}
          </button>
          <span className="text-xs font-mono text-neutral-400">
            {language === "ar" ? `الصفحة ${page}` : `Page ${page}`}
          </span>
          <button
            onClick={() => browseCollection(selectedCollection, page + 1)}
            className="px-5 py-2.5 rounded-full spiritual-card text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-emerald-500/40 min-h-[44px]"
          >
            {t.hadithNextPage}
          </button>
        </div>
      )}
    </div>
  );
}


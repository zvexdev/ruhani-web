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
  Bookmark
} from "lucide-react";
import * as api from "../services/api";
import type { HadithCollection, Hadith } from "../types";
import { useLanguage } from "../context/LanguageContext";

export default function HadithPage() {
  const { t, language } = useLanguage();
  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [randomHadith, setRandomHadith] = useState<Hadith | null>(null);
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedHadiths, setSavedHadiths] = useState<string[]>([]);

  useEffect(() => {
    loadData();
    const saved = localStorage.getItem("ruhani-saved-hadiths");
    if (saved) {
      try {
        setSavedHadiths(JSON.parse(saved));
      } catch {}
    }
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
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await api.searchHadiths(searchQuery);
      setSearchResults(data.results || []);
    } catch (err) {
      console.error(err);
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

  const toggleSaveHadith = (id: string) => {
    const updated = savedHadiths.includes(id)
      ? savedHadiths.filter(h => h !== id)
      : [...savedHadiths, id];
    setSavedHadiths(updated);
    localStorage.setItem("ruhani-saved-hadiths", JSON.stringify(updated));
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

  const displayedHadiths = searchQuery.trim() ? searchResults : hadiths;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-28">
      {/* Header */}
      <div className="py-6 md:py-8">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t.hadithTitle}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t.hadithSubtitle}
        </p>
      </div>

      {/* Featured / Random Hadith */}
      {randomHadith && !selectedCollection && !searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-gray-100 dark:border-slate-800 shadow-md mb-8 relative"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Quote className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                {language === "ar" ? "حديث مختار" : "Featured Hadith"}
              </span>
            </div>
            <button
              onClick={loadNewRandom}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              {language === "ar" ? "حديث آخر ↺" : "Get Another Hadith →"}
            </button>
          </div>

          <p className="font-serif text-lg md:text-xl text-slate-800 dark:text-slate-200 leading-relaxed">
            &ldquo;{randomHadith.english}&rdquo;
          </p>

          {randomHadith.arabic && (
            <p className="font-['Amiri'] text-xl text-right text-slate-700 dark:text-slate-300 mt-4 leading-[2.2] bg-emerald-50/40 dark:bg-slate-800/40 p-4 rounded-2xl">
              {randomHadith.arabic}
            </p>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                {randomHadith.collection_name} #{randomHadith.hadithnumber}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                {randomHadith.grade}
              </span>
            </div>

            <button
              onClick={() => copyHadithText(randomHadith)}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              {copiedId === randomHadith.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedId === randomHadith.id ? t.copied : t.copy}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-gray-100 dark:border-slate-800 shadow-sm mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute ltr:left-4 rtl:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t.hadithSearchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value.trim()) setSearchResults([]);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full ltr:pl-11 ltr:pr-4 rtl:pr-11 rtl:pl-4 py-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-3 bg-[#1A5D3A] text-white rounded-2xl text-xs font-semibold hover:bg-emerald-800 transition-colors disabled:opacity-50"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : t.search}
          </button>
          {(searchQuery || selectedCollection) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSearchResults([]);
                setSelectedCollection(null);
                setHadiths([]);
              }}
              className="p-3 rounded-2xl border border-gray-200 dark:border-slate-700 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Collections Carousel / Filter Grid */}
      {!searchQuery && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {language === "ar" ? "أمهات كتب الحديث الشريف" : "Browse Canonical Books"}
            </h2>
            <button
              onClick={() => setShowCollections(!showCollections)}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              <span>{showCollections ? (language === "ar" ? "طي" : "Collapse") : (language === "ar" ? "عرض الكل" : "View All")}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCollections ? "rotate-180" : ""}`} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {collections.slice(0, showCollections ? collections.length : 4).map((col) => {
              const isSelected = selectedCollection === col.key;

              return (
                <button
                  key={col.key}
                  onClick={() => browseCollection(col.key)}
                  className={`p-5 rounded-2xl border text-start transition-all ${
                    isSelected
                      ? "border-emerald-600 dark:border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 shadow-sm"
                      : "border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md"
                  }`}
                >
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {language === "ar" && col.arabic_name ? col.arabic_name : col.name}
                  </p>
                  <p className="font-['Amiri'] text-xs text-slate-400 mt-1">
                    {language === "ar" ? col.name : col.arabic_name}
                  </p>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-[11px] text-slate-400">
                      {col.total_hadiths?.toLocaleString()} {language === "ar" ? "حديث" : "hadiths"}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
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
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {language === "ar" && selectedCollectionMeta.arabic_name ? selectedCollectionMeta.arabic_name : selectedCollectionMeta.name}
            </h3>
            <p className="text-xs text-slate-400">{selectedCollectionMeta.author}</p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {language === "ar" ? `الصفحة ${page}` : `Page ${page}`}
          </span>
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
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-50 dark:border-slate-800/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                    {hadith.collection_name} #{hadith.hadithnumber}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                    {hadith.grade}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => copyHadithText(hadith)}
                    title={t.copy}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleSaveHadith(hadith.id)}
                    title={isSaved ? (language === "ar" ? "إزالة الحفظ" : "Remove bookmark") : (language === "ar" ? "حفظ الحديث" : "Bookmark hadith")}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isSaved ? "text-amber-500" : "text-slate-400 hover:text-amber-500"
                    }`}
                  >
                    <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
                  </button>
                </div>
              </div>

              {/* In Arabic mode, display Arabic text directly if available */}
              {hadith.arabic ? (
                <div>
                  <p className="font-['Amiri'] text-right text-lg md:text-xl text-slate-900 dark:text-white leading-[2.2] bg-emerald-50/30 dark:bg-slate-800/40 p-4 rounded-2xl mb-3">
                    {hadith.arabic}
                  </p>
                  <p className="font-serif text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {hadith.english}
                  </p>
                </div>
              ) : (
                <p className="font-serif text-base text-slate-800 dark:text-slate-200 leading-relaxed">
                  {hadith.english}
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
            className="px-5 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 disabled:opacity-40"
          >
            {t.hadithPrevPage}
          </button>
          <span className="text-xs font-mono text-slate-400">
            {language === "ar" ? `الصفحة ${page}` : `Page ${page}`}
          </span>
          <button
            onClick={() => browseCollection(selectedCollection, page + 1)}
            className="px-5 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-gray-50"
          >
            {t.hadithNextPage}
          </button>
        </div>
      )}
    </div>
  );
}


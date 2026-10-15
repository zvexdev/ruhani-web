import { useState, useEffect, useRef, useMemo } from "react";
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
  Loader2,
  Trash2,
  Navigation,
  Sparkles,
  Download,
  CheckCircle2,
  Award,
  HelpCircle,
  Volume2,
  AlertCircle
} from "lucide-react";
import * as api from "../services/api";
import type { SurahMeta, SurahDetail, SearchResult, Verse } from "../types";
import { useAudio } from "../context/AudioContext";
import { useLanguage } from "../context/LanguageContext";
import { searchMatch } from "../lib/arabic";
import { RECITERS_LIST, DEFAULT_RECITER, getSurahAudioUrl } from "../data/reciters";
import { triggerBookmarkBurst, triggerGoldenPulse } from "../lib/animations";
import LuxuryCombobox from "../components/LuxuryCombobox";
import KhatmaTracker from "../components/KhatmaTracker";
import {
  renderTajweedContent,
  getWordDetails,
  fetchVerseWords,
  fetchSurahWords,
  playWordAudio,
  stripTashkeel,
  type WordMorphology
} from "../lib/quranWords";
import { isAudioCached, cacheAudio } from "../lib/audioCache";
import {
  fetchSurahTimestamps,
  type SurahTimestampsResult
} from "../lib/quranTimestamps";

// Canonical list of 15 Quranic Sajdah verses
const SAJDAH_VERSES = new Set([
  "7:206", "13:15", "16:50", "17:109", "19:58",
  "22:18", "22:77", "25:60", "27:26", "32:15",
  "38:24", "41:38", "53:62", "84:21", "96:19"
]);

export default function Quran() {
  const { t, isArabic } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [currentSurah, setCurrentSurah] = useState<number>(initialSurah);

  const handleSelectSurah = (newSurah: number) => {
    if (newSurah >= 1 && newSurah <= 114 && newSurah !== currentSurah) {
      setCurrentSurah(newSurah);
      setSearchParams({ surah: String(newSurah) }, { replace: true });
    }
  };
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
  const [selectedReciter, setSelectedReciter] = useState<number>(() => {
    try {
      const saved = localStorage.getItem("ruhani-favorite-reciter");
      return saved ? Number(saved) : DEFAULT_RECITER.id;
    } catch {
      return DEFAULT_RECITER.id;
    }
  });
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);

  // Tajweed, Word Morphology & Khatma states
  const [tajweedMode, setTajweedMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("ruhani-quran-tajweed") === "true";
    } catch {
      return false;
    }
  });
  const [showTajweedLegend, setShowTajweedLegend] = useState(false);
  const [activeWord, setActiveWord] = useState<{ word: WordMorphology; verseKey: string } | null>(null);
  const [surahWordsMap, setSurahWordsMap] = useState<Map<string, WordMorphology[]>>(new Map());
  const [showKhatmaModal, setShowKhatmaModal] = useState(false);
  const [isOfflineCached, setIsOfflineCached] = useState(false);
  const [isDownloadingOffline, setIsDownloadingOffline] = useState(false);

  // Tafsir state
  const [activeTafsirAyah, setActiveTafsirAyah] = useState<Verse | null>(null);
  const [tafsirText, setTafsirText] = useState<string>("");
  const [tafsirLoading, setTafsirLoading] = useState(false);

  // Method A: Full Surah Timestamps state
  const [surahTimestamps, setSurahTimestamps] = useState<SurahTimestampsResult | null>(null);

  const currentSurahMeta = useMemo(
    () => surahs.find((s) => s.number === currentSurah),
    [surahs, currentSurah]
  );

  const {
    playTrack,
    playAyahSequence,
    currentTrack,
    isPlaying,
    togglePlay,
    seek,
    activeVerseKey: globalActiveVerseKey,
    setActiveVerseKey,
    playbackMode,
    setPlaybackMode,
    syncActiveSurah,
  } = useAudio();
  const verseRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const mushafVerseRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const [autoFollow, setAutoFollow] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("ruhani-quran-autofollow");
      return saved !== "false";
    } catch {
      return true;
    }
  });

  // Active verse key: only active when in AYAH_FOLLOW mode for the currently viewed surah
  const activeVerseKey =
    currentTrack?.surahNumber === currentSurah && playbackMode === "AYAH_FOLLOW"
      ? globalActiveVerseKey
      : null;

  // Strict Active Surah Sync: Keep AudioContext informed of active viewing Surah with equality guard
  const lastSyncedSurahRef = useRef<{ surah: number; reciter: number } | null>(null);
  useEffect(() => {
    if (
      !lastSyncedSurahRef.current ||
      lastSyncedSurahRef.current.surah !== currentSurah ||
      lastSyncedSurahRef.current.reciter !== selectedReciter
    ) {
      lastSyncedSurahRef.current = { surah: currentSurah, reciter: selectedReciter };
      syncActiveSurah(currentSurah, selectedReciter);
    }
  }, [currentSurah, selectedReciter, syncActiveSurah]);

  // Auto-advance view to next Surah if follow-mode continuous playback advances across chapters
  const lastAudioTrackSurahRef = useRef<number | null>(currentTrack?.surahNumber || null);
  useEffect(() => {
    if (
      isPlaying &&
      playbackMode === "AYAH_FOLLOW" &&
      currentTrack?.surahNumber &&
      lastAudioTrackSurahRef.current !== null &&
      lastAudioTrackSurahRef.current !== currentTrack.surahNumber
    ) {
      lastAudioTrackSurahRef.current = currentTrack.surahNumber;
      handleSelectSurah(currentTrack.surahNumber);
    } else if (currentTrack?.surahNumber) {
      lastAudioTrackSurahRef.current = currentTrack.surahNumber;
    }
  }, [isPlaying, playbackMode, currentTrack?.surahNumber]);

  // Fetch Surah Timestamps whenever currentSurah or selectedReciter changes (Method A only)
  const lastFetchedTimestampsRef = useRef<{ surah: number; reciter: number } | null>(null);
  useEffect(() => {
    if (
      lastFetchedTimestampsRef.current?.surah === currentSurah &&
      lastFetchedTimestampsRef.current?.reciter === selectedReciter
    ) {
      return;
    }
    lastFetchedTimestampsRef.current = { surah: currentSurah, reciter: selectedReciter };

    let isCancelled = false;
    const reciter = RECITERS_LIST.find((r) => r.id === selectedReciter) || DEFAULT_RECITER;

    // Reciters without Quran.com chapter timestamps strictly use Method B (gapless Ayah sequence)
    if (!reciter.quranComId) {
      setSurahTimestamps(null);
      return;
    }

    fetchSurahTimestamps(reciter.quranComId, currentSurah)
      .then((res) => {
        if (!isCancelled && res?.surahNumber === currentSurah) {
          setSurahTimestamps(res);
        }
      })
      .catch((err) => {
        console.debug("Failed resolving Surah timestamps:", err);
      });

    return () => {
      isCancelled = true;
    };
  }, [currentSurah, selectedReciter]);

  // Real-time Ayah-by-Ayah Audio Sync & Follow (Center in viewport with smooth scroll)
  useEffect(() => {
    if (!activeVerseKey || !isPlaying || !autoFollow) return;
    const targetEl =
      viewMode === "mushaf"
        ? mushafVerseRefs.current[activeVerseKey]
        : verseRefs.current[activeVerseKey];

    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
      triggerGoldenPulse(targetEl);
    }
  }, [activeVerseKey, isPlaying, autoFollow, viewMode]);

  // Check whether active Surah is cached in offline storage
  useEffect(() => {
    const audioUrl = getSurahAudioUrl(selectedReciter, currentSurah);
    isAudioCached(audioUrl)
      .then(setIsOfflineCached)
      .catch(() => setIsOfflineCached(false));
  }, [currentSurah, selectedReciter]);

  const handleDownloadOffline = async () => {
    setIsDownloadingOffline(true);
    const audioUrl = getSurahAudioUrl(selectedReciter, currentSurah);
    const success = await cacheAudio(audioUrl);
    setIsDownloadingOffline(false);
    if (success) {
      setIsOfflineCached(true);
    }
  };

  const reciterOptions = useMemo(
    () =>
      RECITERS_LIST.map((r) => ({
        value: r.id,
        label: r.name,
        arabicLabel: r.name_arabic,
        badge: r.id === 1 ? (isArabic ? "الافتراضي" : "Default") : undefined,
        subtitle: `${r.style} — ${r.riwayah}`,
      })),
    [isArabic]
  );

  const translationOptions = useMemo(
    () => [
      {
        value: "sahih_international" as const,
        label: "Sahih International",
        subtitle: "Clear modern English translation",
      },
      {
        value: "pickthall" as const,
        label: "Pickthall Translation",
        subtitle: "Classic Marmaduke Pickthall",
      },
      {
        value: "yusuf_ali" as const,
        label: "Yusuf Ali Translation",
        subtitle: "Abdullah Yusuf Ali commentary",
      },
    ],
    []
  );

  const handleWordSelect = (word: WordMorphology, verseKey: string) => {
    setActiveWord({ word, verseKey });
  };

  const cleanVerseArabic = (arabic: string, surahNum?: number, ayahNum?: number) => {
    if (!arabic) return "";
    if (surahNum && surahNum > 1 && ayahNum === 1) {
      return arabic.replace(/^بِسْمِ\s+(?:ٱللَّهِ|اللَّهِ)\s+(?:ٱلرَّحْمَٰنِ|الرَّحْمَٰنِ|الرَّحْمَنِ)\s+(?:ٱلرَّحِيمِ|الرَّحِيمِ)\s*/u, "").trim();
    }
    return arabic;
  };

  const renderInteractiveArabicText = (arabicText: string, verseKey: string, surahNum?: number, ayahNum?: number) => {
    if (!arabicText) return null;
    const cleanedText = cleanVerseArabic(arabicText, surahNum, ayahNum);
    const apiWords = surahWordsMap.get(verseKey);

    // STRICT BINDING: When API-verified word tokens are available, bind UI click directly to immutable API word object
    if (apiWords && apiWords.length > 0) {
      return apiWords.map((word) => (
        <span
          key={`w-${word.id || `${verseKey}-${word.position}`}`}
          onClick={(e) => {
            e.stopPropagation();
            handleWordSelect(word, verseKey);
          }}
          className="inline-block cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 hover:underline decoration-emerald-500/40 decoration-1 underline-offset-4 transition-colors px-0.5 rounded select-text tracking-normal"
          title={isArabic ? "اضغط لعرض المعنى اللفظي" : "Tap for word-by-word meaning"}
        >
          {tajweedMode ? renderTajweedContent(word.arabic) : word.arabic}{" "}
        </span>
      ));
    }

    // Fallback if surahWordsMap is still resolving
    if (tajweedMode) {
      return renderTajweedContent(cleanedText);
    }
    const words = cleanedText.split(/\s+/).filter(Boolean);
    return words.map((w, wIdx) => (
      <span
        key={`${verseKey}-w-${wIdx}`}
        onClick={(e) => {
          e.stopPropagation();
          fetchVerseWords(verseKey).then((verseWords) => {
            if (verseWords && verseWords.length > 0) {
              setSurahWordsMap((prev) => new Map(prev).set(verseKey, verseWords));
              const clean = stripTashkeel(w).trim();
              const matched = verseWords.find((vw) => vw.cleanArabic === clean) || verseWords[wIdx] || verseWords[0];
              setActiveWord({ word: matched, verseKey });
            } else {
              setActiveWord({ word: getWordDetails(w), verseKey });
            }
          });
        }}
        className="inline-block cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 hover:underline decoration-emerald-500/40 decoration-1 underline-offset-4 transition-colors px-0.5 rounded select-text tracking-normal"
        title={isArabic ? "اضغط لعرض المعنى اللفظي" : "Tap for word-by-word meaning"}
      >
        {w}{" "}
      </span>
    ));
  };

  useEffect(() => {
    loadSurahs();
  }, []);

  // Sync URL query params -> local state (single source of truth for URL updates)
  useEffect(() => {
    const paramSurah = searchParams.get("surah");
    if (paramSurah !== null) {
      const parsed = parseInt(paramSurah, 10);
      if (isNaN(parsed) || parsed < 1 || parsed > 114) {
        // Clean up invalid parameter by sanitizing URL
        setSearchParams({ surah: String(currentSurah || 1) }, { replace: true });
      } else if (parsed !== currentSurah) {
        setCurrentSurah(parsed);
      }
    }
  }, [searchParams, currentSurah, setSearchParams]);

  // Outbound state sync: only updates URL & localStorage when values actually differ
  useEffect(() => {
    const paramSurah = searchParams.get("surah");
    const currentStr = String(currentSurah);

    if (paramSurah !== currentStr) {
      setSearchParams({ surah: currentStr }, { replace: true });
    }
    try {
      localStorage.setItem("ruhani-last-surah", currentStr);
    } catch (e) {
      console.debug("Failed saving last surah:", e);
    }
    loadSurah(currentSurah);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentSurah]);

  async function loadSurahs() {
    try {
      const data = await api.getAllSurahs();
      setSurahs(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadSurah(num: number) {
    if (num < 1 || num > 114 || isNaN(num)) {
      handleSelectSurah(1);
      return;
    }
    setLoading(true);
    try {
      const [data, wordsMap] = await Promise.all([
        api.getSurah(num),
        fetchSurahWords(num),
      ]);
      setSurahDetail(data);
      setSurahWordsMap(wordsMap);

      // Handle ?ayah= parameter if specified
      const paramAyah = searchParams.get("ayah");
      if (paramAyah && data?.verses) {
        const parsedAyah = parseInt(paramAyah, 10);
        if (!isNaN(parsedAyah) && parsedAyah >= 1 && parsedAyah <= data.verses.length) {
          const verseKey = `${num}:${parsedAyah}`;
          setTimeout(() => {
            const el = verseRefs.current[verseKey] || mushafVerseRefs.current[verseKey];
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
          }, 400);
        }
      }
    } catch (err) {
      console.error("Failed loading surah:", err);
      setSurahDetail(null);
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

  function toggleBookmark(verseKey: string, targetEl?: HTMLElement | null) {
    const isAdding = !bookmarks.includes(verseKey);
    const updated = isAdding
      ? [...bookmarks, verseKey]
      : bookmarks.filter((b) => b !== verseKey);
    setBookmarks(updated);
    localStorage.setItem("ruhani-quran-bookmarks", JSON.stringify(updated));
    if (isAdding && targetEl) {
      triggerBookmarkBurst(targetEl);
    }
  }

  const jumpToBookmark = (verseKey: string) => {
    const [surahStr] = verseKey.split(":");
    const surahNum = parseInt(surahStr, 10);
    setShowBookmarksModal(false);
    handleSelectSurah(surahNum);
    setTimeout(() => {
      const el = verseRefs.current[verseKey];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        triggerGoldenPulse(el);
      }
    }, 450);
  };

  const playAyahAtIndex = async (targetSurahNumber: number, index: number, overrideReciterId?: number) => {
    // 1. Strict Active Surah Inheritance: Ensure explicit Surah number is consumed
    const activeSurahNum =
      (targetSurahNumber && targetSurahNumber >= 1 && targetSurahNumber <= 114)
        ? targetSurahNumber
        : (currentSurah && currentSurah >= 1 && currentSurah <= 114)
        ? currentSurah
        : (surahDetail?.surah?.number && surahDetail.surah.number >= 1)
        ? surahDetail.surah.number
        : 1;

    // Ensure local view stays strictly synchronized
    handleSelectSurah(activeSurahNum);

    // Ensure verses list belongs to activeSurahNum
    let versesList = surahDetail?.verses;
    if (!versesList || surahDetail?.surah?.number !== activeSurahNum) {
      try {
        const freshDetail = await api.getSurah(activeSurahNum);
        if (freshDetail?.verses) {
          versesList = freshDetail.verses;
          setSurahDetail(freshDetail);
        }
      } catch (e) {
        console.error("Failed fetching fresh surah detail for playback:", e);
      }
    }

    if (!versesList || index < 0 || index >= versesList.length) return;
    const targetVerse = versesList[index];
    const activeReciterId = overrideReciterId !== undefined ? overrideReciterId : selectedReciter;
    const reciter = RECITERS_LIST.find((r) => r.id === activeReciterId) || DEFAULT_RECITER;
    const sMeta = surahs.find((s) => s.number === activeSurahNum) || currentSurahMeta;

    setPlaybackMode("AYAH_FOLLOW");

    // METHOD A: Reciters WITH exact API Timestamps
    let timestampsObj: SurahTimestampsResult | null = null;
    if (surahTimestamps && surahTimestamps.surahNumber === activeSurahNum) {
      timestampsObj = surahTimestamps;
    }

    if (activeReciterId !== selectedReciter) {
      timestampsObj = reciter.quranComId ? await fetchSurahTimestamps(reciter.quranComId, activeSurahNum) : null;
    } else if (!timestampsObj && reciter.quranComId) {
      timestampsObj = await fetchSurahTimestamps(reciter.quranComId, activeSurahNum);
      if (timestampsObj && timestampsObj.surahNumber === activeSurahNum) {
        setSurahTimestamps(timestampsObj);
      }
    }

    const hasValidTimestamps = Boolean(
      reciter.quranComId &&
      timestampsObj &&
      timestampsObj.surahNumber === activeSurahNum &&
      timestampsObj.timestamps &&
      timestampsObj.timestamps.length > 0 &&
      timestampsObj.timestamps.some((t) => t.verse_key === targetVerse.verse_key)
    );

    if (hasValidTimestamps && timestampsObj) {
      const timestamp = timestampsObj.timestamps.find(
        (t) => t.verse_key === targetVerse.verse_key
      );
      const seekSeconds = timestamp ? timestamp.timestamp_from / 1000 : 0;

      const isAlreadyPlayingThisSurah =
        currentTrack?.mode === "AYAH_FOLLOW" &&
        currentTrack?.type === "surah" &&
        currentTrack.surahNumber === activeSurahNum &&
        currentTrack.reciterId === activeReciterId &&
        Boolean(currentTrack.timestamps && currentTrack.timestamps.length > 0);

      if (isAlreadyPlayingThisSurah) {
        seek(seekSeconds);
        setActiveVerseKey(targetVerse.verse_key);
        if (!isPlaying) {
          togglePlay();
        }
        return;
      }

      playTrack({
        title: `${sMeta?.name_english || "Surah"} — ${isArabic ? "سورة" : "Surah"} ${activeSurahNum}`,
        subtitle: `${reciter.name} (${reciter.name_arabic})`,
        arabicTitle: `${sMeta?.name_arabic || ""} : ${targetVerse.ayah}`,
        src: timestampsObj.audioUrl,
        type: "surah",
        mode: "AYAH_FOLLOW",
        surahNumber: activeSurahNum,
        reciterId: activeReciterId,
        timestamps: timestampsObj.timestamps,
        initialSeekTime: seekSeconds,
      });
      setActiveVerseKey(targetVerse.verse_key);
      return;
    }

    // METHOD B: Reciters WITHOUT chapter timestamps (e.g., Sheikh Yasser Al-Dosari)
    // 100% exact voice sync: Individual Ayah MP3s with 0ms ping-pong preloader
    playAyahSequence({
      surahNumber: activeSurahNum,
      reciterId: activeReciterId,
      startAyahIndex: index,
      verses: versesList,
      surahName: sMeta?.name_english || `Surah ${activeSurahNum}`,
      reciterName: `${reciter.name} (${reciter.name_arabic})`,
      arabicTitle: sMeta?.name_arabic,
    });
  };

  const handlePlayAyah = (verse: Verse) => {
    const isThisAyahActive = Boolean(
      activeVerseKey === verse.verse_key && isPlaying
    );

    if (isThisAyahActive) {
      togglePlay();
      return;
    }

    const [vSurahStr, vAyahStr] = verse.verse_key.split(":");
    const verseSurah = parseInt(vSurahStr, 10) || currentSurah;
    const verseAyah = parseInt(vAyahStr, 10) || verse.ayah;

    const idx = surahDetail?.verses?.findIndex((v) => v.ayah === verseAyah) ?? -1;
    if (idx !== -1) {
      playAyahAtIndex(verseSurah, idx);
    }
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
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-40 sm:pb-36">
      {/* Quran Header Toolbar */}
      <div className="py-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/60 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-4xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              {currentSurahMeta?.name_english || "The Holy Quran"}
            </h1>
            <span className="font-quran text-2xl text-emerald-700 dark:text-emerald-400 font-bold tracking-normal leading-[1.8]" dir="rtl">
              {currentSurahMeta?.name_arabic}
            </span>
          </div>
          <p className="text-xs md:text-sm text-neutral-500 dark:text-neutral-400 mt-1">
            {isArabic ? "سورة رقم" : "Surah #"} {currentSurah} &middot; {currentSurahMeta?.verses_count || surahDetail?.total_verses || 0} {t.quranVersesCount} &middot;{" "}
            {currentSurahMeta?.revelation_place === "makkah" ? t.quranMeccan : t.quranMedinan}
          </p>
        </div>

        {/* View Controls & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="bg-gray-100 dark:bg-neutral-800 p-1 rounded-full flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode("verses")}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                viewMode === "verses"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {t.quranModeVerses}
            </button>
            <button
              onClick={() => setViewMode("mushaf")}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                viewMode === "mushaf"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-sm"
                  : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {t.quranModeMushaf}
            </button>
          </div>

          {/* Auto-Follow Reciter Toggle */}
          <button
            onClick={() => {
              setAutoFollow((prev) => {
                const next = !prev;
                try {
                  localStorage.setItem("ruhani-quran-autofollow", String(next));
                } catch (e) {
                  console.debug("Failed saving autoFollow:", e);
                }
                return next;
              });
            }}
            title={autoFollow ? t.quranAutoFollowActive : t.quranAutoFollow}
            className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              autoFollow
                ? "bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10"
                : "bg-white dark:bg-neutral-800 text-neutral-400 border-gray-200 dark:border-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            <Navigation className={`w-3.5 h-3.5 ${autoFollow ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
            <span>{t.quranAutoFollow}</span>
            {autoFollow && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </button>

          {/* Tajweed Mode Toggle */}
          <div className="inline-flex items-center gap-1">
            <button
              onClick={() => {
                setTajweedMode((prev) => {
                  const next = !prev;
                  try {
                    localStorage.setItem("ruhani-quran-tajweed", String(next));
                  } catch (e) {
                    console.debug("Failed saving tajweed mode:", e);
                  }
                  return next;
                });
              }}
              title={t.quranTajweedMode}
              className={`min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                tajweedMode
                  ? "bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm shadow-amber-400/20"
                  : "bg-white dark:bg-neutral-800 text-neutral-400 border-gray-200 dark:border-neutral-700 hover:text-neutral-700 dark:hover:text-neutral-200"
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${tajweedMode ? "text-amber-400" : ""}`} />
              <span>{t.quranTajweedMode}</span>
            </button>
            {tajweedMode && (
              <button
                onClick={() => setShowTajweedLegend(true)}
                title={t.quranTajweedLegend}
                className="p-2 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-neutral-400 hover:text-white"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sacred Khatma Progress Tracker Button */}
          <button
            onClick={() => setShowKhatmaModal(true)}
            title={t.quranKhatmaTracker}
            className="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-all active:scale-95"
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>{t.quranKhatmaTracker}</span>
          </button>

          {/* Font Size slider */}
          <div className="hidden sm:flex items-center gap-2 bg-white dark:bg-neutral-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-neutral-700 text-xs">
            <span className="text-neutral-400">Aa</span>
            <input
              type="range"
              min={20}
              max={44}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-20 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full appearance-none cursor-pointer"
            />
            <span className="text-neutral-400 font-bold">Aa</span>
          </div>

          {/* Search Button */}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2.5 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
            title={t.search}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Bookmarks Modal Button */}
          <button
            onClick={() => setShowBookmarksModal(true)}
            className="relative p-2.5 rounded-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors text-neutral-700 dark:text-neutral-300"
            title={isArabic ? "الآيات المحفوظة" : "Saved Bookmarks"}
          >
            <Bookmark className={`w-4 h-4 ${bookmarks.length > 0 ? "text-amber-500 fill-amber-500/20" : ""}`} />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-neutral-950 font-bold text-[9px] flex items-center justify-center shadow-xs">
                {bookmarks.length}
              </span>
            )}
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
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-4 border border-gray-200 dark:border-neutral-800 shadow-xl">
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
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-neutral-900 dark:text-white"
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
                  className="p-2.5 rounded-xl border border-gray-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Loading Indicator */}
              {searchLoading && (
                <div className="py-8 text-center text-neutral-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>{isArabic ? "جاري البحث في القرآن الكريم..." : "Searching the Holy Quran..."}</span>
                </div>
              )}

              {/* Matching Surahs */}
              {matchingSurahs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                    {isArabic ? `سور مطابقة (${matchingSurahs.length})` : `Matching Surahs (${matchingSurahs.length})`}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {matchingSurahs.map((surah) => (
                      <button
                        key={surah.number}
                        onClick={() => {
                          handleSelectSurah(surah.number);
                          setShowSearch(false);
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-100 dark:border-neutral-800 hover:bg-emerald-50/60 dark:hover:bg-neutral-800 text-start transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                            {surah.name_english}
                          </p>
                          <span className="text-[10px] text-neutral-400">
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
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800">
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2">
                    {isArabic ? `آيات مطابقة (${searchResults.length})` : `Matching Verses (${searchResults.length})`}
                  </p>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-neutral-800 custom-scrollbar">
                    {searchResults.map((result) => (
                      <button
                        key={result.verse_key}
                        onClick={() => {
                          handleSelectSurah(result.surah_number);
                          setShowSearch(false);
                          setTimeout(() => {
                            const el = verseRefs.current[result.verse_key];
                            el?.scrollIntoView({ behavior: "smooth", block: "center" });
                          }, 500);
                        }}
                        className="w-full text-left p-3 hover:bg-emerald-50/50 dark:hover:bg-neutral-800/50 transition-colors rounded-xl"
                      >
                        <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold">
                          {result.surah_name} ({result.verse_key})
                        </p>
                        <p className="font-quran text-right text-base text-neutral-900 dark:text-neutral-100 mt-1 leading-[2.2] tracking-normal" dir="rtl">
                          {result.arabic}
                        </p>
                        <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 line-clamp-2">
                          {result.translation}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {hasSearched && !searchLoading && matchingSurahs.length === 0 && searchResults.length === 0 && (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  <p className="font-bold text-neutral-700 dark:text-neutral-300 text-sm mb-1">
                    {isArabic ? `لم نجد نتائج مطابقة لـ "${searchQuery}"` : `No matching surahs or verses found for "${searchQuery}"`}
                  </p>
                  <p className="text-neutral-400 max-w-sm mx-auto leading-relaxed">
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
                className="lg:hidden fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
              />
              <motion.div
                initial={{ x: isArabic ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: isArabic ? "100%" : "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="lg:hidden fixed inset-y-0 start-0 z-[100] w-[85vw] max-w-[340px] bg-white dark:bg-neutral-900 shadow-2xl flex flex-col border-e border-gray-200 dark:border-neutral-800"
              >
                <div className="p-4 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                  <span className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>{t.quranSurahsButton} (114)</span>
                  </span>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-3 border-b border-gray-100 dark:border-neutral-800">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={isArabic ? "ابحث في السور الـ ١١٤..." : "Filter 114 Surahs..."}
                      value={surahFilterQuery}
                      onChange={(e) => setSurahFilterQuery(e.target.value)}
                      className="w-full ltr:pl-9 ltr:pr-8 rtl:pr-9 rtl:pl-8 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {surahFilterQuery && (
                      <button
                        onClick={() => setSurahFilterQuery("")}
                        className="absolute ltr:right-2.5 rtl:left-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-gray-100/60 dark:divide-neutral-800/50 pb-20 custom-scrollbar">
                  {filteredSurahs.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => {
                        handleSelectSurah(surah.number);
                        setShowSidebar(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3.5 text-start transition-all group ${
                        surah.number === currentSurah
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border-s-4 border-emerald-600 dark:border-emerald-400"
                          : "hover:bg-emerald-50/40 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105 ${
                          surah.number === currentSurah
                            ? "bg-gradient-to-br from-[#1A5D3A] to-emerald-700 text-white shadow-md shadow-emerald-900/20"
                            : "bg-gray-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        {surah.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs truncate font-bold text-neutral-900 dark:text-white">
                            {isArabic ? surah.name_arabic : surah.name_english}
                          </p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-normal">
                            {surah.revelation_place === "makkah" ? (isArabic ? "مكية" : "Makkah") : (isArabic ? "مدنية" : "Madinah")}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {surah.verses_count} {t.quranVersesCount} &middot; {surah.name_translation || (isArabic ? surah.name_english : surah.name_arabic)}
                        </p>
                      </div>
                      <span className="font-['Amiri'] text-base text-neutral-800 dark:text-neutral-200 shrink-0 font-bold">
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
              <div className="w-[340px] bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 shadow-sm max-h-[calc(100vh-180px)] flex flex-col">
                <div className="p-3.5 border-b border-gray-100 dark:border-neutral-800 sticky top-0 bg-white dark:bg-neutral-900 z-10">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute ltr:left-3 rtl:right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder={isArabic ? "ابحث في السور الـ ١١٤..." : "Filter 114 Surahs..."}
                      value={surahFilterQuery}
                      onChange={(e) => setSurahFilterQuery(e.target.value)}
                      className="w-full ltr:pl-9 ltr:pr-8 rtl:pr-9 rtl:pl-8 py-2 rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    {surahFilterQuery && (
                      <button
                        onClick={() => setSurahFilterQuery("")}
                        className="absolute ltr:right-2.5 rtl:left-2.5 top-1/2 -translate-y-1/2 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-gray-100/60 dark:divide-neutral-800/50 custom-scrollbar">
                  {filteredSurahs.map((surah) => (
                    <button
                      key={surah.number}
                      onClick={() => {
                        handleSelectSurah(surah.number);
                      }}
                      className={`w-full flex items-center gap-3 p-3.5 text-start transition-all group ${
                        surah.number === currentSurah
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-semibold border-s-4 border-emerald-600 dark:border-emerald-400"
                          : "hover:bg-emerald-50/40 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-transform group-hover:scale-105 ${
                          surah.number === currentSurah
                            ? "bg-gradient-to-br from-[#1A5D3A] to-emerald-700 text-white shadow-md shadow-emerald-900/20"
                            : "bg-gray-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                        }`}
                      >
                        {surah.number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs truncate font-bold text-neutral-900 dark:text-white">
                            {isArabic ? surah.name_arabic : surah.name_english}
                          </p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-normal">
                            {surah.revelation_place === "makkah" ? (isArabic ? "مكية" : "Makkah") : (isArabic ? "مدنية" : "Madinah")}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-0.5">
                          {surah.verses_count} {t.quranVersesCount} &middot; {surah.name_translation || (isArabic ? surah.name_english : surah.name_arabic)}
                        </p>
                      </div>
                      <span className="font-['Amiri'] text-base text-neutral-800 dark:text-neutral-200 shrink-0 font-bold">
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
                <p className="text-xs text-neutral-400">Loading sacred revelation...</p>
              </div>
            </div>
          ) : surahDetail ? (
            <div>
              {/* Surah Bismillah Card */}
              <div className="bg-gradient-to-b from-white to-emerald-50/20 dark:from-black dark:to-neutral-950 rounded-3xl p-6 md:p-10 border border-emerald-900/10 dark:border-emerald-500/20 shadow-sm text-center mb-8 relative z-20">
                <div className="max-w-xl mx-auto">
                  <h2 className="font-quran text-4xl md:text-5xl text-neutral-900 dark:text-white mb-2 leading-[2.0] tracking-normal" dir="rtl">
                    {surahDetail.surah.name_arabic}
                  </h2>
                  <p className="text-xl font-bold text-emerald-800 dark:text-emerald-400">
                    {currentSurahMeta?.name_english}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    {currentSurahMeta?.name_translation} &middot; {surahDetail.total_verses} Verses &middot;{" "}
                    {currentSurahMeta?.revelation_place === "makkah" ? "Meccan" : "Medinan"}
                  </p>

                  {/* Sheikh Reciter & Translation Pickers */}
                  <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
                    {/* Reciter selector with LuxuryCombobox */}
                    <LuxuryCombobox
                      value={selectedReciter}
                      onChange={(val) => {
                        setSelectedReciter(val);
                        try {
                          localStorage.setItem("ruhani-favorite-reciter", String(val));
                        } catch (e) {
                          console.debug("Failed saving favorite reciter:", e);
                        }
                        if (isPlaying && activeVerseKey && surahDetail?.verses) {
                          const currentIdx = surahDetail.verses.findIndex((v) => v.verse_key === activeVerseKey);
                          if (currentIdx !== -1) {
                            setTimeout(() => {
                              playAyahAtIndex(currentSurah, currentIdx, val);
                            }, 50);
                          }
                        }
                      }}
                      options={reciterOptions}
                      label={t.quranReciterLabel}
                      icon={<Headphones className="w-3.5 h-3.5 text-emerald-400" />}
                      searchPlaceholder={isArabic ? "ابحث بين القراء..." : "Search reciters..."}
                    />

                    {/* Translation selector with LuxuryCombobox */}
                    <LuxuryCombobox
                      value={translation}
                      onChange={(val) => setTranslation(val)}
                      options={translationOptions}
                      label={t.quranTranslationLabel}
                      icon={<Languages className="w-3.5 h-3.5 text-neutral-400" />}
                      searchable={false}
                    />

                    {/* Offline Download Action */}
                    <button
                      onClick={handleDownloadOffline}
                      disabled={isOfflineCached || isDownloadingOffline}
                      title={isOfflineCached ? t.offlineDownloaded : t.offlineDownload}
                      className={`min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all border ${
                        isOfflineCached
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40 shadow-sm"
                          : "bg-neutral-900/90 dark:bg-[#0a0a0a] text-neutral-300 hover:text-white border-emerald-900/40 hover:border-emerald-500/40"
                      }`}
                    >
                      {isDownloadingOffline ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      ) : isOfflineCached ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-neutral-400" />
                      )}
                      <span>
                        {isDownloadingOffline
                          ? t.offlineDownloading
                          : isOfflineCached
                          ? t.offlineAvailable
                          : t.offlineDownload}
                      </span>
                    </button>

                    {/* Play All Ayahs Sequentially Action */}
                    <button
                      onClick={() => playAyahAtIndex(currentSurah, 0)}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-500 hover:to-emerald-600 text-white px-4 py-2 rounded-full shadow-md shadow-emerald-900/30 text-xs font-bold transition-all active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{t.quranPlayAllAyahs}</span>
                    </button>
                  </div>
                </div>

                {/* Bismillah Header (only for Surahs 2-8 and 10-114; NOT Surah 1 and NOT Surah 9) */}
                {currentSurah !== 1 && currentSurah !== 9 && (
                  <div className="mt-8 pt-6 border-t border-emerald-950/10 dark:border-emerald-500/10" dir="rtl">
                    <p className="font-quran text-2xl md:text-3xl text-emerald-950 dark:text-emerald-200 leading-[2.6] tracking-normal">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </p>
                  </div>
                )}
              </div>

              {/* View Mode: Mushaf Continuous Reading Mode */}
              {viewMode === "mushaf" ? (
                <div className="bg-white dark:bg-neutral-900 rounded-3xl p-8 md:p-14 border border-emerald-900/10 dark:border-emerald-500/10 shadow-md">
                  <div
                    dir="rtl"
                    className="font-quran text-right leading-[2.8] text-neutral-900 dark:text-neutral-100 text-justify tracking-normal select-text break-words break-anywhere"
                    style={{ fontSize: `${fontSize}px`, textJustify: "inter-word" }}
                  >
                    {surahDetail.verses.map((verse) => {
                      const isThisAyahActive = activeVerseKey === verse.verse_key;
                      const isThisAyahPlaying = isThisAyahActive && isPlaying;
                      const isSajdah = SAJDAH_VERSES.has(verse.verse_key);
                      return (
                        <span
                          key={verse.verse_key}
                          ref={(el) => {
                            mushafVerseRefs.current[verse.verse_key] = el;
                          }}
                          onClick={() => handlePlayAyah(verse)}
                          className={`inline cursor-pointer transition-all duration-300 rounded-xl px-1.5 py-0.5 mx-0.5 ${
                            isThisAyahPlaying
                              ? "bg-amber-400/25 dark:bg-emerald-500/30 ring-2 ring-amber-400/90 dark:ring-emerald-400/90 shadow-[0_0_24px_rgba(245,158,11,0.45)] text-amber-950 dark:text-amber-200 font-bold"
                              : "hover:bg-emerald-50/50 dark:hover:bg-neutral-800/60 hover:text-emerald-800 dark:hover:text-emerald-300"
                          }`}
                          title={`${t.quranPlayVerse} #${verse.ayah}`}
                        >
                          {renderInteractiveArabicText(verse.arabic, verse.verse_key, currentSurah, verse.ayah)}{" "}
                          <span
                            className={`inline-flex items-center justify-center font-sans text-xs px-2 py-0.5 mx-1 rounded-full font-bold align-middle select-none border transition-colors ${
                              isThisAyahPlaying
                                ? "bg-amber-400 text-neutral-950 border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                                : "bg-amber-100/70 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border-amber-300/40"
                            }`}
                          >
                            {verse.ayah}
                          </span>{" "}
                          {isSajdah && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-sans px-1.5 py-0.5 mx-1 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/40 align-middle select-none">
                              ۩ {isArabic ? "سجدة" : "Sajdah"}
                            </span>
                          )}{" "}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* View Mode: Verse by Verse Detailed Cards */
                <div className="space-y-4">
                  {surahDetail.verses.map((verse) => {
                    const isBookmarked = bookmarks.includes(verse.verse_key);
                    const isCopied = copiedKey === verse.verse_key;
                    const isThisAyahActive = activeVerseKey === verse.verse_key;
                    const isThisAyahPlaying = isThisAyahActive && isPlaying;

                    return (
                      <div
                        key={verse.verse_key}
                        ref={(el) => {
                          verseRefs.current[verse.verse_key] = el;
                        }}
                        className={`bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-6 md:p-8 border transition-all duration-300 group ${
                          isThisAyahPlaying
                            ? "border-emerald-500/90 dark:border-emerald-400/90 shadow-[0_0_35px_rgba(16,185,129,0.22)] ring-2 ring-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/40"
                            : "border-gray-100 dark:border-neutral-800 shadow-sm hover:shadow-md"
                        }`}
                      >
                        {/* Top Actions Row */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-50 dark:border-neutral-800/80">
                          <div className="flex items-center gap-2">
                            <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                              isThisAyahPlaying
                                ? "bg-emerald-600 text-white"
                                : "bg-emerald-100 dark:bg-emerald-950 text-[#1A5D3A] dark:text-emerald-400"
                            }`}>
                              {verse.ayah}
                            </span>
                            <span className="text-xs text-neutral-400">
                              {verse.verse_key}
                            </span>
                            {SAJDAH_VERSES.has(verse.verse_key) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                                <span>۩</span>
                                <span>{isArabic ? "سجدة تلاوة" : "Sajdah"}</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {/* Play Ayah Audio */}
                            <button
                              onClick={() => handlePlayAyah(verse)}
                              title={isThisAyahPlaying ? t.playerPause : t.quranPlayVerse}
                              className={`p-2 rounded-xl transition-all ${
                                isThisAyahPlaying
                                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                                  : "hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-neutral-500 hover:text-emerald-700 dark:hover:text-emerald-400"
                              }`}
                            >
                              {isThisAyahPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>

                            {/* View Tafsir */}
                            <button
                              onClick={() => openTafsir(verse)}
                              title={t.quranTafsirBtn}
                              className="p-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-neutral-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                            </button>

                            {/* Copy Verse */}
                            <button
                              onClick={() => copyVerse(verse)}
                              title={t.quranCopyVerse}
                              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
                            >
                              {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                            </button>

                            {/* Bookmark Verse */}
                            <button
                              onClick={(e) => toggleBookmark(verse.verse_key, e.currentTarget)}
                              title={t.quranBookmarkVerse}
                              className={`p-2 rounded-xl transition-colors ${
                                isBookmarked
                                  ? "bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400"
                                  : "hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-400"
                              }`}
                            >
                              <Bookmark className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
                            </button>
                          </div>
                        </div>

                        {/* Arabic Typography with adjustable font size */}
                        <div dir="rtl" className="w-full">
                          <p
                            dir="rtl"
                            className="font-quran text-right leading-[2.8] text-neutral-900 dark:text-white select-text tracking-normal break-words break-anywhere"
                            style={{ fontSize: `${fontSize}px` }}
                          >
                            {renderInteractiveArabicText(verse.arabic, verse.verse_key, currentSurah, verse.ayah)}
                          </p>
                        </div>

                        {/* Transliteration */}
                        {verse.transliteration && (
                          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-3 italic leading-relaxed break-words break-anywhere">
                            {verse.transliteration}
                          </p>
                        )}

                        {/* Translation */}
                        <p className="text-sm md:text-base text-neutral-700 dark:text-neutral-300 mt-3 font-serif leading-relaxed break-words break-anywhere">
                          {verse.translations?.[translation] || verse.translations?.sahih_international || ""}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Prev / Next Surah Pagination */}
              <div className="flex items-center justify-between mt-12 pt-6 border-t border-gray-200 dark:border-neutral-800">
                <button
                  onClick={() => currentSurah > 1 && handleSelectSurah(currentSurah - 1)}
                  disabled={currentSurah <= 1}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-full text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t.quranPrevSurah}</span>
                </button>

                <span className="text-xs font-mono text-neutral-400">
                  {isArabic ? "سورة" : "Surah"} {currentSurah} / 114
                </span>

                <button
                  onClick={() => currentSurah < 114 && handleSelectSurah(currentSurah + 1)}
                  disabled={currentSurah >= 114}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-full text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors disabled:opacity-40"
                >
                  <span>{t.quranNextSurah}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : !loading ? (
            <div className="text-center py-16 spiritual-card rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm max-w-md mx-auto my-12">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-900 dark:text-white mb-1">
                {isArabic ? "تعذر تحميل السورة" : "Unable to load Surah"}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-5 leading-relaxed">
                {isArabic
                  ? "يرجى التحقق من اتصال الإنترنت أو تجربة إعادة المحاولة."
                  : "Please check your network connection or try reloading."}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => loadSurah(currentSurah)}
                  className="px-5 py-2.5 bg-[#1A5D3A] text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  {isArabic ? "إعادة المحاولة" : "Retry"}
                </button>
                <button
                  onClick={() => handleSelectSurah(1)}
                  className="px-4 py-2.5 border border-neutral-200 dark:border-neutral-800 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {isArabic ? "العودة للفاتحة" : "Go to Al-Fatiha"}
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setActiveTafsirAyah(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-neutral-900 rounded-3xl p-4 sm:p-6 md:p-8 max-w-2xl w-full shadow-2xl border border-gray-200 dark:border-neutral-800 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-neutral-800">
                <div>
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.quranTafsirTitle} — {isArabic ? "سورة" : "Surah"} {activeTafsirAyah.verse_key}</span>
                  </h3>
                  <p className="text-xs text-neutral-400">Tafsir as-Sa'di / Ibn Kathir commentary</p>
                </div>
                <button
                  onClick={() => setActiveTafsirAyah(null)}
                  className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Ayah Snippet */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/30 p-4 rounded-2xl mb-4 border border-emerald-100 dark:border-emerald-900/30" dir="rtl">
                <p className="font-quran text-right text-xl md:text-2xl text-emerald-900 dark:text-emerald-200 mb-2 leading-[2.6] tracking-normal">
                  {activeTafsirAyah.arabic}
                </p>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 font-serif italic">
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
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-serif whitespace-pre-line break-words break-anywhere">
                    {tafsirText}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800 flex justify-end">
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

      {/* Bookmarks Saved Verses Modal */}
      <AnimatePresence>
        {showBookmarksModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowBookmarksModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-black rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-2xl border border-gray-200 dark:border-neutral-800 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-500">
                    <Bookmark className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-neutral-900 dark:text-white">
                      {isArabic ? "الآيات المحفوظة في خزانتي" : "Saved Sanctuary Bookmarks"}
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-medium">
                      {bookmarks.length}{" "}
                      {isArabic ? "آية محفوظة للتدبر والقراءة" : "verses bookmarked for quick contemplation"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowBookmarksModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bookmarks List */}
              <div className="overflow-y-auto flex-1 divide-y divide-gray-100/70 dark:divide-neutral-900 pr-1 pb-3 custom-scrollbar">
                {bookmarks.length === 0 ? (
                  <div className="py-12 text-center text-neutral-400">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-500">
                      <Bookmark className="w-6 h-6 opacity-60" />
                    </div>
                    <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                      {isArabic ? "لا توجد آيات محفوظة بعد" : "No saved bookmarks yet"}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
                      {isArabic
                        ? "انقر على علامة المرجعية بجوار أي آية أثناء القراءة لحفظها والرجوع إليها بسهولة."
                        : "Tap the bookmark icon on any ayah while reading to save it here for instant access."}
                    </p>
                  </div>
                ) : (
                  bookmarks.map((verseKey) => {
                    const [sNum, aNum] = verseKey.split(":");
                    const surahMeta = surahs.find((s) => s.number === Number(sNum));
                    return (
                      <div
                        key={verseKey}
                        className="py-3 px-2 flex items-center justify-between gap-3 hover:bg-emerald-50/40 dark:hover:bg-neutral-900/60 rounded-xl transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5 truncate">
                            <span>
                              {surahMeta
                                ? (isArabic ? `سورة ${surahMeta.name_arabic}` : surahMeta.name_english)
                                : `Surah ${sNum}`}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-mono font-bold">
                              {verseKey}
                            </span>
                          </p>
                          <p className="text-[11px] text-neutral-400 mt-0.5 font-sans">
                            {isArabic ? `الآية رقم ${aNum}` : `Ayah ${aNum}`} &middot;{" "}
                            {surahMeta?.revelation_place === "makkah" ? (isArabic ? "مكية" : "Meccan") : (isArabic ? "مدنية" : "Medinan")}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => jumpToBookmark(verseKey)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-transform active:scale-95"
                          >
                            <span>{isArabic ? "الانتقال" : "Open"}</span>
                            {isArabic ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => toggleBookmark(verseKey)}
                            title={isArabic ? "إزالة الحفظ" : "Remove bookmark"}
                            className="p-1.5 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800 flex justify-end">
                <button
                  onClick={() => setShowBookmarksModal(false)}
                  className="px-5 py-2 bg-[#1A5D3A] text-white rounded-full text-xs font-semibold hover:bg-emerald-800 transition-colors"
                >
                  {t.done}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tajweed Legend Modal */}
      <AnimatePresence>
        {showTajweedLegend && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
            onClick={() => setShowTajweedLegend(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl border border-emerald-900/40 relative text-neutral-100 my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-emerald-900/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {t.quranTajweedLegend}
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      {isArabic ? "الألوان الدلالية لأحكام التلاوة والتجويد" : "Color-coded guide to Quranic Tajweed rules"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTajweedLegend(false)}
                  className="p-2 rounded-xl hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{isArabic ? "الغُنّة (نّ، مّ)" : "Ghunna (Nasalization)"}</span>
                      <span className="font-mono text-emerald-400 text-[11px]">{isArabic ? "حركتان" : "2 Counts"}</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {isArabic ? "صوت رخيم يخرج من الخيشوم عند النون والميم المشددتين." : "Gentle nasal sound held for 2 counts on doubled Noon and Meem."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{isArabic ? "القلقلة (ق، ط، ب، ج، د)" : "Qalqala (Echoing Vibration)"}</span>
                      <span className="font-mono text-rose-400 text-[11px]">قطب جد</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {isArabic ? "اضطراب المخرج عند النطق بالحرف الساكن حتى يُسمع له نبرة قوية." : "Echoing bounce when these 5 letters carry a sukoon or at a stop."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-purple-500 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{isArabic ? "المدود (المد المتصل والمنفصل واللازم)" : "Madd (Prolongation)"}</span>
                      <span className="font-mono text-purple-400 text-[11px]">{isArabic ? "٤-٦ حركات" : "4-6 Counts"}</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {isArabic ? "إطالة الصوت بحرف المد واللين عند ملاقاة همز أو سكون." : "Prolongation of vowel sounds (4 to 6 counts) indicated with wavy Madd signs."}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex items-center gap-3">
                  <span className="w-4 h-4 rounded-full bg-amber-500 shrink-0 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white flex items-center justify-between">
                      <span>{isArabic ? "الإدغام والإخفاء" : "Idgham & Ikhfa"}</span>
                      <span className="font-mono text-amber-400 text-[11px]">يرملون</span>
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {isArabic ? "إدخال حرف ساكن في متحرك بحيث يصيران حرفاً واحداً، أو ستر النون الساكنة." : "Blending or concealing the noon sakinah / tanween seamlessly."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-neutral-800 flex justify-end">
                <button
                  onClick={() => setShowTajweedLegend(false)}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-emerald-900/40"
                >
                  {t.done}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Word Morphology & Translation Modal */}
      <AnimatePresence>
        {activeWord && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveWord(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] rounded-3xl p-6 sm:p-8 max-w-md w-full max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl border border-emerald-900/40 relative text-neutral-100 my-auto"
            >
              <div className="flex items-center justify-between pb-4 border-b border-emerald-900/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">
                      {t.quranWordMeaning}
                    </h3>
                    <p className="text-[11px] text-neutral-400">
                      {isArabic ? "تحليل الكلمة القرآنية" : "Quranic Lexicon & Morphology"} &middot; {activeWord.verseKey}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveWord(null)}
                  className="p-2 rounded-xl hover:bg-neutral-900 text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Big Arabic Word Display & Audio Pronunciation */}
              <div className="py-6 text-center bg-gradient-to-b from-emerald-950/20 to-transparent rounded-2xl my-4 border border-emerald-900/20" dir="rtl">
                <p className="font-quran text-4xl md:text-5xl text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.3)] leading-[2.2] tracking-normal">
                  {activeWord.word.arabic}
                </p>
                <p className="text-xs text-neutral-400 mt-2 font-mono">
                  {activeWord.word.cleanArabic}
                </p>

                {activeWord.word.audioUrl && (
                  <button
                    onClick={() => playWordAudio(activeWord.word.audioUrl)}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 text-xs font-semibold transition-all active:scale-95 border border-emerald-500/40 shadow-sm"
                    title={isArabic ? "استمع للنطق الصوتي" : "Listen to pronunciation"}
                  >
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isArabic ? "استمع للنطق الصوتي" : "Pronounce"}</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-medium">
                    {isArabic ? "المعنى بالإنجليزية:" : "English Meaning:"}
                  </span>
                  <span className="text-sm font-semibold text-emerald-400">
                    {activeWord.word.english}
                  </span>
                </div>

                <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                  <span className="text-xs text-neutral-400 font-medium">
                    {t.quranWordTransliteration}:
                  </span>
                  <span className="text-sm font-mono text-neutral-200">
                    {activeWord.word.transliteration}
                  </span>
                </div>

                {activeWord.word.root && (
                  <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-medium">
                      {t.quranWordRoot}:
                    </span>
                    <span className="text-sm font-['Amiri'] font-bold text-amber-400 text-lg">
                      {activeWord.word.root}
                    </span>
                  </div>
                )}

                {activeWord.word.type && (
                  <div className="bg-neutral-900/80 p-3.5 rounded-2xl border border-neutral-800 flex items-center justify-between">
                    <span className="text-xs text-neutral-400 font-medium">
                      {isArabic ? "الصنف اللغوي:" : "Classification:"}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-300">
                      {activeWord.word.type}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-neutral-800 flex justify-end">
                <button
                  onClick={() => setActiveWord(null)}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-emerald-900/40"
                >
                  {t.done}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sacred Khatma Progress Modal */}
      <AnimatePresence>
        {showKhatmaModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            onClick={() => setShowKhatmaModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0a0a] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-emerald-900/40 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <KhatmaTracker onClose={() => setShowKhatmaModal(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

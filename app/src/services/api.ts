// Islamic Data API service powered by UmmahAPI (https://ummahapi.com) with offline fallback
import { SURAHS } from "../data/surahs";
import { NAMES_OF_ALLAH } from "../data/namesOfAllah";
import { AUTHENTIC_ADHKAR } from "../data/adhkar";
import { CURATED_HADITHS, DEFAULT_COLLECTIONS } from "../data/hadiths";
import { RECITERS_LIST, DEFAULT_RECITER, getSurahAudioUrl, getAyahAudioUrl, type ReciterInfo } from "../data/reciters";
import { calculatePrayerTimes } from "../lib/prayerTimes";
import { searchMatch } from "../lib/arabic";
import type { SurahMeta, Verse, Hadith, NameOfAllah, Dua, SearchResult } from "../types";

const BASE_URL = "https://ummahapi.com";
const FETCH_TIMEOUT_MS = 6000;

/**
 * Fetch helper with timeout and error protection
 */
async function fetchAPI(endpoint: string, params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url.toString(), { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    return await res.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// ============ QURAN ============
export async function getAllSurahs(): Promise<SurahMeta[]> {
  try {
    const data = await fetchAPI("/api/quran/surahs");
    if (data?.data?.surahs && data.data.surahs.length > 0) {
      return data.data.surahs;
    }
    return SURAHS;
  } catch (err) {
    console.warn("UmmahAPI offline or slow; using local Surah list", err);
    return SURAHS;
  }
}

export async function getSurah(number: number) {
  try {
    const data = await fetchAPI(`/api/quran/surah/${number}`);
    return data.data;
  } catch (err) {
    // Fallback: If single Surah fails, try alternative Quran CDN or Quran.com API
    try {
      const qdcRes = await fetch(`https://api.quran.com/api/v4/verses/by_chapter/${number}?language=en&words=false&translations=131&per_page=300&fields=text_uthmani`);
      if (qdcRes.ok) {
        const qdcData = await qdcRes.json();
        const surahMeta = SURAHS.find((s: SurahMeta) => s.number === number) || SURAHS[0];
        interface QdcVerse {
          verse_key: string;
          verse_number: number;
          text_uthmani: string;
          translations?: Array<{ text?: string }>;
        }
        const verses: Verse[] = ((qdcData.verses || []) as QdcVerse[]).map((v) => ({
          verse_key: v.verse_key,
          ayah: v.verse_number,
          arabic: v.text_uthmani,
          transliteration: `Verse ${v.verse_number}`,
          translations: {
            sahih_international: v.translations?.[0]?.text?.replace(/<[^>]*>?/gm, '') || ""
          },
          audio: {
            ayah_audio: getAyahAudioUrl(DEFAULT_RECITER.id, number, v.verse_number),
            all_reciters: ""
          }
        }));
        return {
          surah: {
            number: surahMeta.number,
            name_arabic: surahMeta.name_arabic,
            name_english: surahMeta.name_english,
            verses_count: surahMeta.verses_count
          },
          audio: {
            reciters_available: RECITERS_LIST.length,
            example_audio: getSurahAudioUrl(DEFAULT_RECITER.id, number)
          },
          total_verses: surahMeta.verses_count,
          verses
        };
      }
    } catch (fallbackErr) {
      console.error("Quran API fallback error:", fallbackErr);
    }
    throw err;
  }
}

export async function getAyah(surah: number, ayah: number) {
  const data = await fetchAPI(`/api/quran/surah/${surah}/ayah/${ayah}`);
  return data.data;
}

export async function getRandomAyah(): Promise<{ verse: Verse; surah?: Record<string, unknown> }> {
  try {
    const data = await fetchAPI("/api/quran/random");
    if (data?.data?.verse) {
      return {
        ...data.data,
        verse: {
          ...data.data.verse,
          audio: {
            ...data.data.verse.audio,
            ayah_audio: getAyahAudioUrl(
              DEFAULT_RECITER.id,
              Number(data.data.verse.verse_key.split(":")[0]) || 2,
              data.data.verse.ayah || 255
            )
          }
        }
      };
    }
    return data.data;
  } catch (err) {
    console.debug("getRandomAyah offline fallback:", err);
    // Beautiful offline fallback: Ayat al-Kursi with Sheikh Yasser Al-Dosari
    return {
      verse: {
        verse_key: "2:255",
        ayah: 255,
        arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ",
        transliteration: "Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum. La ta'khudhuhu sinatuw-wa la nawm. Lahu ma fis-samawati wa ma fil-ard...",
        translations: {
          sahih_international: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth..."
        },
        audio: {
          ayah_audio: getAyahAudioUrl(DEFAULT_RECITER.id, 2, 255),
          all_reciters: ""
        }
      }
    };
  }
}

interface RawQuranSearchResult {
  verse_key?: string;
  surah_number?: number | string;
  surah_name?: string;
  ayah?: number | string;
  arabic?: string;
  transliteration?: string;
  matched_in?: string;
  translation?: string;
  translations?: {
    sahih_international?: string;
    pickthall?: string;
    yusuf_ali?: string;
  };
  translation_source?: string;
}

export async function searchQuran(query: string): Promise<{ results: SearchResult[] }> {
  try {
    const data = await fetchAPI("/api/quran/search", { q: query, limit: "50" });
    const rawResults: RawQuranSearchResult[] = data?.data?.results || [];
    const results: SearchResult[] = rawResults.map((r) => ({
      verse_key: r.verse_key || `${r.surah_number}:${r.ayah}`,
      surah_number: Number(r.surah_number) || 1,
      surah_name: r.surah_name || `Surah ${r.surah_number}`,
      ayah: Number(r.ayah) || 1,
      arabic: r.arabic || "",
      transliteration: r.transliteration || "",
      matched_in: r.matched_in || "translation",
      translation: r.translation || r.translations?.sahih_international || r.translations?.pickthall || r.translations?.yusuf_ali || "",
      translation_source: r.translation_source || "sahih_international",
    }));
    return { results };
  } catch (err) {
    console.warn("UmmahAPI searchQuran failed:", err);
    return { results: [] };
  }
}

export async function getReciters(): Promise<ReciterInfo[]> {
  // Return the comprehensive verified list of Sheikhs with Yasser Al-Dosari as default
  return RECITERS_LIST;
}

export async function getSurahAudio(surah: number) {
  return {
    surah,
    reciters: RECITERS_LIST.map((r) => ({
      id: r.id,
      name: r.name,
      name_arabic: r.name_arabic,
      style: r.style,
      riwayah: r.riwayah,
      full_surah_audio: getSurahAudioUrl(r.id, surah)
    }))
  };
}

export async function getAyahAudio(surah: number, ayah: number, reciterId: number = DEFAULT_RECITER.id) {
  return {
    audio_url: getAyahAudioUrl(reciterId, surah, ayah)
  };
}

export async function getJuz(number: number) {
  const data = await fetchAPI(`/api/quran/juz/${number}`);
  return data.data;
}

// ============ TAFSIR ============
export async function getTafasir() {
  try {
    const data = await fetchAPI("/api/tafsir");
    return data.data;
  } catch (err) {
    console.debug("getTafasir fallback:", err);
    return [
      { id: "ar-tafsir-ibn-kathir", name: "Tafsir Ibn Kathir", language: "ar" },
      { id: "ar-tafsir-al-saadi", name: "Tafsir as-Sa'di", language: "ar" },
      { id: "ar-tafsir-al-jalalayn", name: "Tafsir al-Jalalayn", language: "ar" }
    ];
  }
}

export async function getTafsir(tafsir: string, surah: number, ayah: number) {
  try {
    const data = await fetchAPI(`/api/tafsir/${tafsir}/surah/${surah}/ayah/${ayah}`);
    return data.data;
  } catch (err) {
    console.debug("getTafsir fallback to qdc:", err);
    // Fallback to Quran.com tafsir API
    const fallbackRes = await fetch(`https://api.qurancdn.com/api/qdc/tafsirs/169/by_ayah/${surah}:${ayah}`);
    if (fallbackRes.ok) {
      const fbData = await fallbackRes.json();
      return {
        text: fbData.tafsir?.text?.replace(/<[^>]*>?/gm, "") || "Tafsir unavailable offline."
      };
    }
    return { text: "Tafsir is currently unavailable for this ayah." };
  }
}

// ============ HADITH ============
export async function getHadithCollections(): Promise<{ collections: typeof DEFAULT_COLLECTIONS }> {
  try {
    const data = await fetchAPI("/api/hadith/collections");
    if (data?.data?.collections?.length) {
      return data.data;
    }
    return { collections: DEFAULT_COLLECTIONS };
  } catch (err) {
    console.debug("getHadithCollections fallback:", err);
    return { collections: DEFAULT_COLLECTIONS };
  }
}

export async function getRandomHadith(): Promise<Hadith> {
  try {
    const data = await fetchAPI("/api/hadith/random");
    return data.data;
  } catch (err) {
    console.debug("getRandomHadith fallback:", err);
    const rand = CURATED_HADITHS[Math.floor(Math.random() * CURATED_HADITHS.length)];
    return rand;
  }
}

interface RawApiHadith {
  id?: string;
  collection?: string;
  collection_name?: string;
  hadithnumber?: number | string;
  arabic?: string;
  english?: string;
  grade?: string;
}

export async function searchHadiths(query: string): Promise<{ results: Hadith[] }> {
  try {
    const data = await fetchAPI("/api/hadith/search", { q: query });
    const list: RawApiHadith[] = data?.data?.hadiths || data?.data?.results || [];
    if (list.length > 0) {
      const results: Hadith[] = list.map((h, i) => ({
        id: h.id || `hadith-${h.collection || "col"}-${h.hadithnumber || i}`,
        collection: h.collection || "bukhari",
        collection_name: h.collection_name || h.collection || "Sahih",
        hadithnumber: Number(h.hadithnumber) || i + 1,
        arabic: h.arabic || "",
        english: h.english || "",
        grade: h.grade || "Sahih",
      }));
      return { results };
    }
  } catch (err) {
    console.warn("UmmahAPI searchHadiths failed, falling back to local curation", err);
  }

  // Fallback to local CURATED_HADITHS with normalized Arabic matching
  const results = CURATED_HADITHS.filter((h) =>
    h.english.toLowerCase().includes(query.toLowerCase()) ||
    searchMatch(h.arabic, query) ||
    h.collection_name.toLowerCase().includes(query.toLowerCase()) ||
    String(h.hadithnumber) === query.trim()
  );
  return { results };
}

export async function browseHadithCollection(collection: string, page = 1, limit = 20) {
  try {
    const data = await fetchAPI(`/api/hadith/${collection}`, { page: String(page), limit: String(limit) });
    return data.data;
  } catch (err) {
    console.debug("browseHadithCollection fallback:", err);
    const filtered = CURATED_HADITHS.filter(h => h.collection === collection);
    return { hadiths: filtered.length ? filtered : CURATED_HADITHS };
  }
}

// ============ DUAS ============
export async function getAllDuas(): Promise<{ duas: Dua[] }> {
  try {
    const data = await fetchAPI("/api/duas");
    if (data?.data?.duas?.length) return data.data;
    return {
      duas: AUTHENTIC_ADHKAR.map((item, idx) => ({
        id: idx + 1,
        category: item.category,
        title: item.title,
        arabic: item.arabic,
        transliteration: item.transliteration,
        translation: item.translation,
        source: item.source,
        repeat: item.repeat
      }))
    };
  } catch (err) {
    console.debug("getAllDuas fallback:", err);
    return {
      duas: AUTHENTIC_ADHKAR.map((item, idx) => ({
        id: idx + 1,
        category: item.category,
        title: item.title,
        arabic: item.arabic,
        transliteration: item.transliteration,
        translation: item.translation,
        source: item.source,
        repeat: item.repeat
      }))
    };
  }
}

export async function getDuaCategories(): Promise<{ categories: string[] }> {
  try {
    const data = await fetchAPI("/api/duas/categories");
    return data.data;
  } catch (err) {
    console.debug("getDuaCategories fallback:", err);
    return {
      categories: ["morning", "evening", "prayer", "before_sleep", "general"]
    };
  }
}

export async function getRandomDua(): Promise<Dua> {
  const item = AUTHENTIC_ADHKAR[Math.floor(Math.random() * AUTHENTIC_ADHKAR.length)];
  return {
    id: 1,
    category: item.category,
    title: item.title,
    arabic: item.arabic,
    transliteration: item.transliteration,
    translation: item.translation,
    source: item.source,
    repeat: item.repeat
  };
}

export async function getDuasByCategory(category: string): Promise<{ duas: Dua[] }> {
  const filtered = AUTHENTIC_ADHKAR.filter(a => a.category === category);
  return {
    duas: (filtered.length ? filtered : AUTHENTIC_ADHKAR).map((item, idx) => ({
      id: idx + 1,
      category: item.category,
      title: item.title,
      arabic: item.arabic,
      transliteration: item.transliteration,
      translation: item.translation,
      source: item.source,
      repeat: item.repeat
    }))
  };
}

// ============ 99 NAMES ============
export async function getAllNames(): Promise<{ names: NameOfAllah[] }> {
  try {
    const data = await fetchAPI("/api/asma-ul-husna");
    if (data?.data?.names?.length) return data.data;
    return { names: NAMES_OF_ALLAH };
  } catch (err) {
    console.debug("getAllNames fallback:", err);
    return { names: NAMES_OF_ALLAH };
  }
}

export async function getName(number: number): Promise<NameOfAllah> {
  const found = NAMES_OF_ALLAH.find(n => n.number === number);
  return found || NAMES_OF_ALLAH[0];
}

export async function getRandomName(): Promise<NameOfAllah> {
  const rand = NAMES_OF_ALLAH[Math.floor(Math.random() * NAMES_OF_ALLAH.length)];
  return rand;
}

export async function searchNames(query: string) {
  const lower = query.toLowerCase().trim();
  const results = NAMES_OF_ALLAH.filter(
    (n) =>
      searchMatch(n.arabic, query) ||
      n.english.toLowerCase().includes(lower) ||
      n.transliteration.toLowerCase().includes(lower) ||
      n.meaning.toLowerCase().includes(lower) ||
      String(n.number) === lower
  );
  return { names: results };
}

export async function getDailyNames(day: number): Promise<{ names: NameOfAllah[] }> {
  const startIndex = ((day - 1) * 3) % 99;
  return {
    names: NAMES_OF_ALLAH.slice(startIndex, startIndex + 4)
  };
}

// ============ PRAYER TIMES ============
export async function getPrayerTimes(latitude: number, longitude: number, method = 2) {
  try {
    const data = await fetchAPI("/api/prayer-times", {
      latitude: String(latitude),
      longitude: String(longitude),
      method: String(method),
    });
    return data.data;
  } catch (err) {
    console.debug("getPrayerTimes fallback:", err);
    // High-precision local calculation engine
    const schedule = calculatePrayerTimes(new Date(), latitude, longitude);
    return {
      timings: schedule.timings,
      date: {
        readable: new Date().toDateString(),
        hijri: {
          day: "14",
          month: { en: "Shawwal" },
          year: "1447"
        }
      }
    };
  }
}

// ============ HIJRI DATE ============
export async function getTodayHijri() {
  try {
    const data = await fetchAPI("/api/today-hijri");
    if (data?.data?.hijri) return data.data;
    throw new Error("No data");
  } catch (err) {
    console.debug("getTodayHijri primary fallback:", err);
    // Native browser/node Intl Islamic Umalqura calculation
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      const parts = formatter.formatToParts(now);
      const day = parts.find(p => p.type === "day")?.value || "14";
      const month = parts.find(p => p.type === "month")?.value || "Shawwal";
      const year = parts.find(p => p.type === "year")?.value || "1447";

      return {
        hijri: {
          day,
          month_name: month,
          year
        }
      };
    } catch {
      return {
        hijri: {
          day: "14",
          month_name: "Shawwal",
          year: "1447"
        }
      };
    }
  }
}
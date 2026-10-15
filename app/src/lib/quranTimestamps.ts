/**
 * Quran Audio Synchronization Engine
 * Supports Approach A (Full Surah Stream + Ayah Timestamps)
 * and Approach B (Seamless Dual-Buffer Preloader)
 */

import { cacheAudio } from "./audioCache";

export interface AyahTimestamp {
  verse_key: string;
  timestamp_from: number; // in milliseconds
  timestamp_to: number;   // in milliseconds
  duration?: number;
}

export interface SurahTimestampsResult {
  surahNumber: number;
  audioUrl: string;
  timestamps: AyahTimestamp[];
}

// Memory cache for fetched surah timestamps to prevent repeat network roundtrips
const timestampsMemoryCache = new Map<string, SurahTimestampsResult>();

// Audio preloading cache to keep pre-decoded Audio objects in memory (Approach B)
const audioPreloadPool: Record<string, HTMLAudioElement> = {};

/**
 * Preloads an Ayah audio URL into browser memory cache and CacheStorage
 * Ensures instant 0ms transition for Approach B
 */
export function preloadAyahAudio(url: string): void {
  if (!url) return;

  // 1. Warm up browser audio decoder pool
  if (!audioPreloadPool[url]) {
    try {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = url;
      audio.load();
      audioPreloadPool[url] = audio;

      // Keep pool bounded to last 10 preloaded audios to preserve memory
      const keys = Object.keys(audioPreloadPool);
      if (keys.length > 10) {
        delete audioPreloadPool[keys[0]];
      }
    } catch (e) {
      console.debug("Failed preloading audio element:", e);
    }
  }

  // 2. Warm up CacheStorage in background
  cacheAudio(url).catch(() => {});
}

/**
 * Fetches verse timestamps and continuous Surah recitation stream from Quran.com API v4
 */
export async function fetchSurahTimestamps(
  quranComId: number,
  surahNumber: number
): Promise<SurahTimestampsResult | null> {
  const cacheKey = `${quranComId}:${surahNumber}`;

  // 1. Check in-memory cache
  if (timestampsMemoryCache.has(cacheKey)) {
    const cached = timestampsMemoryCache.get(cacheKey)!;
    return { ...cached, surahNumber };
  }

  // 2. Check localStorage cache
  try {
    const stored = localStorage.getItem(`ruhani-timestamps-${cacheKey}`);
    if (stored) {
      const parsed: SurahTimestampsResult = JSON.parse(stored);
      parsed.surahNumber = surahNumber;
      timestampsMemoryCache.set(cacheKey, parsed);
      return parsed;
    }
  } catch (e) {
    console.debug("Failed reading timestamp cache:", e);
  }

  // 3. Fetch from Quran.com API v4
  try {
    const url = `https://api.quran.com/api/v4/chapter_recitations/${quranComId}/${surahNumber}?segments=true`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();
    if (!data?.audio_file?.audio_url || !Array.isArray(data.audio_file.timestamps)) {
      return null;
    }

    const result: SurahTimestampsResult = {
      surahNumber,
      audioUrl: data.audio_file.audio_url,
      timestamps: data.audio_file.timestamps.map((t: { verse_key: string; timestamp_from: number; timestamp_to: number; duration?: number }) => ({
        verse_key: t.verse_key,
        timestamp_from: t.timestamp_from,
        timestamp_to: t.timestamp_to,
        duration: t.duration,
      })),
    };

    // Save to caches
    timestampsMemoryCache.set(cacheKey, result);
    try {
      localStorage.setItem(`ruhani-timestamps-${cacheKey}`, JSON.stringify(result));
    } catch (e) {
      console.debug("Failed saving timestamp cache:", e);
    }

    return result;
  } catch (err) {
    console.debug("Failed fetching Quran.com surah timestamps:", err);
    return null;
  }
}

/**
 * Matches audio playback time (in ms) to the corresponding verse segment
 */
export function findAyahSegmentAtMs(
  timestamps: AyahTimestamp[],
  currentMs: number
): AyahTimestamp | null {
  if (!timestamps || timestamps.length === 0) return null;

  for (let i = 0; i < timestamps.length; i++) {
    const seg = timestamps[i];
    if (currentMs >= seg.timestamp_from && currentMs < seg.timestamp_to) {
      return seg;
    }
  }

  // If time is slightly past the last segment, return the last one
  const last = timestamps[timestamps.length - 1];
  if (currentMs >= last.timestamp_from) {
    return last;
  }

  return null;
}

// Standard verse count for each of the 114 Surahs
export const SURAH_VERSE_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
  112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85,
  54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13,
  14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42,
  29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11,
  11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
];


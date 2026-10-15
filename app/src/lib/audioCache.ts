// High-performance Offline Recitation Cache utilizing the browser's CacheStorage API

const CACHE_NAME = "ruhani-audio-cache-v1";

/**
 * Checks whether audio for a specific URL is stored in the offline cache.
 */
export async function isAudioCached(url: string): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window) || !url) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(url);
    return Boolean(match);
  } catch (err) {
    console.debug("Cache check error:", err);
    return false;
  }
}

/**
 * Downloads and caches an audio stream for instant offline listening.
 */
export async function cacheAudio(url: string): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window) || !url) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) return false;
    await cache.put(url, response);
    return true;
  } catch (err) {
    console.warn("Failed caching audio stream:", err);
    return false;
  }
}

/**
 * Deletes a cached audio stream from CacheStorage.
 */
export async function removeCachedAudio(url: string): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window) || !url) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    return await cache.delete(url);
  } catch (err) {
    console.debug("Failed deleting cached audio:", err);
    return false;
  }
}

/**
 * Retrieves the cached audio as a local Blob URL if available, otherwise returns the original URL.
 */
export async function getCachedAudioUrl(url: string): Promise<string> {
  if (typeof window === "undefined" || !("caches" in window) || !url) return url;
  try {
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(url);
    if (match) {
      const blob = await match.blob();
      return URL.createObjectURL(blob);
    }
  } catch (err) {
    console.debug("Error accessing cached audio blob:", err);
  }
  return url;
}

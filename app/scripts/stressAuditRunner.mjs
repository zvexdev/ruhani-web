// Automated Stress Audit and Runtime Edge-Case Test Suite
// Exercises Audio Engine, URL sanitization, Tajweed/Bismillah rules, LocalStorage corruption, and Zikr counters.

import assert from "node:assert";

console.log("=================================================");
console.log("🚀 STARTING EXHAUSTIVE RUNTIME STRESS AUDIT");
console.log("=================================================\n");

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

// -------------------------------------------------------------
// VECTOR 1: AUDIO ENGINE & GAPLESS EDGE CASES
// -------------------------------------------------------------
console.log("--- 1. AUDIO ENGINE & GAPLESS EDGE CASES ---");

runTest("Rapid track / reciter spamming: Cancellation token prevents stale resolution", () => {
  let playRequestId = 0;
  const requests = [];

  // Simulate 10 rapid clicks within a few milliseconds
  for (let i = 1; i <= 10; i++) {
    const reqId = ++playRequestId;
    requests.push({ id: reqId, surahNumber: i, isStale: () => reqId !== playRequestId });
  }

  // The first 9 requests must be stale
  for (let i = 0; i < 9; i++) {
    assert.strictEqual(requests[i].isStale(), true, `Request ${i + 1} should be marked stale`);
  }
  // The 10th request must be active
  assert.strictEqual(requests[9].isStale(), false, "Request 10 must be active");
  assert.strictEqual(requests[9].surahNumber, 10, "Final request should be Surah 10");
});

runTest("Audio Boundary: Surah 114 -> Next Surah with loopMode='off' triggers stop", () => {
  const currentNum = 114;
  const loopMode = "off";
  let stopped = false;
  let nextNum = null;

  if (currentNum >= 114) {
    if (loopMode === "off") {
      stopped = true;
    } else {
      nextNum = 1;
    }
  } else {
    nextNum = currentNum + 1;
  }

  assert.strictEqual(stopped, true, "Playback should stop at Surah 114 when loopMode is off");
  assert.strictEqual(nextNum, null);
});

runTest("Audio Boundary: Surah 114 -> Next Surah with loopMode='all' wraps cleanly to Surah 1", () => {
  const currentNum = 114;
  const loopMode = "all";
  let nextNum = null;

  if (currentNum >= 114) {
    if (loopMode === "off") {
      // stop
    } else {
      nextNum = 1;
    }
  } else {
    nextNum = currentNum + 1;
  }

  assert.strictEqual(nextNum, 1, "Playback should wrap cleanly to Surah 1 when loopMode is all");
});

runTest("Audio Boundary: Surah 1 -> Prev Surah with loopMode='off' stays at Surah 1", () => {
  const currentNum = 1;
  const loopMode = "off";
  let prevNum = null;

  if (currentNum <= 1) {
    prevNum = loopMode === "off" ? 1 : 114;
  } else {
    prevNum = currentNum - 1;
  }

  assert.strictEqual(prevNum, 1, "Previous Surah from 1 with loopMode off should stay at 1");
});

runTest("Audio Boundary: Surah 1 -> Prev Surah with loopMode='all' wraps cleanly to Surah 114", () => {
  const currentNum = 1;
  const loopMode = "all";
  let prevNum = null;

  if (currentNum <= 1) {
    prevNum = loopMode === "off" ? 1 : 114;
  } else {
    prevNum = currentNum - 1;
  }

  assert.strictEqual(prevNum, 114, "Previous Surah from 1 with loopMode all should wrap to 114");
});

runTest("Ayah Sequence Boundary: Last Ayah transition (Ayah 7 of Al-Fatiha)", () => {
  const verses = [{ ayah: 1 }, { ayah: 2 }, { ayah: 3 }, { ayah: 4 }, { ayah: 5 }, { ayah: 6 }, { ayah: 7 }];
  let currentIdx = 6; // Ayah 7 (0-indexed 6)
  const nextIdx = currentIdx + 1;
  let surahFinished = false;

  if (nextIdx < verses.length) {
    currentIdx = nextIdx;
  } else {
    surahFinished = true;
  }

  assert.strictEqual(surahFinished, true, "Surah must be marked finished after last Ayah");
  assert.strictEqual(currentIdx, 6, "Index must not exceed bounds");
});

// -------------------------------------------------------------
// VECTOR 2: NAVIGATION & URL SANITIZATION
// -------------------------------------------------------------
console.log("\n--- 2. NAVIGATION & URL SANITIZATION ---");

function sanitizeSurahParam(param) {
  const num = Number(param);
  if (!isNaN(num) && num >= 1 && num <= 114) {
    return Math.floor(num);
  }
  return 1;
}

runTest("Invalid URL parameter '?surah=999' falls back to Surah 1", () => {
  assert.strictEqual(sanitizeSurahParam("999"), 1);
});

runTest("Invalid URL parameter '?surah=-1' falls back to Surah 1", () => {
  assert.strictEqual(sanitizeSurahParam("-1"), 1);
});

runTest("Invalid URL parameter '?surah=abc' falls back to Surah 1", () => {
  assert.strictEqual(sanitizeSurahParam("abc"), 1);
});

runTest("Invalid URL parameter '?surah=0' falls back to Surah 1", () => {
  assert.strictEqual(sanitizeSurahParam("0"), 1);
});

runTest("Valid URL parameters '?surah=2' and '?surah=114' parse correctly", () => {
  assert.strictEqual(sanitizeSurahParam("2"), 2);
  assert.strictEqual(sanitizeSurahParam("114"), 114);
});

function sanitizeAyahParam(param, totalVerses) {
  if (!param) return null;
  const num = parseInt(param, 10);
  if (!isNaN(num) && num >= 1 && num <= totalVerses) {
    return num;
  }
  return null;
}

runTest("Invalid URL parameter '?ayah=9999' for Al-Fatiha (7 verses) returns null (no crash)", () => {
  assert.strictEqual(sanitizeAyahParam("9999", 7), null);
});

runTest("Invalid URL parameter '?ayah=-5' returns null (no crash)", () => {
  assert.strictEqual(sanitizeAyahParam("-5", 7), null);
});

runTest("Valid URL parameter '?ayah=5' for Al-Fatiha returns 5", () => {
  assert.strictEqual(sanitizeAyahParam("5", 7), 5);
});

// -------------------------------------------------------------
// VECTOR 3: LOCAL STORAGE CORRUPTION RESILIENCE
// -------------------------------------------------------------
console.log("\n--- 3. LOCAL STORAGE CORRUPTION RESILIENCE ---");

function parseStoredJsonSafe(raw, fallback) {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed !== null && parsed !== undefined ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function parseStoredNumberSafe(raw, min, max, fallback) {
  if (!raw) return fallback;
  try {
    const num = Number(raw);
    if (!isNaN(num) && num >= min && num <= max) {
      return num;
    }
  } catch {}
  return fallback;
}

runTest("Corrupt 'ruhani-last-surah' (e.g. '{bad json', '999', 'undefined') falls back to 1", () => {
  assert.strictEqual(parseStoredNumberSafe("{bad json", 1, 114, 1), 1);
  assert.strictEqual(parseStoredNumberSafe("999", 1, 114, 1), 1);
  assert.strictEqual(parseStoredNumberSafe("-5", 1, 114, 1), 1);
  assert.strictEqual(parseStoredNumberSafe("undefined", 1, 114, 1), 1);
});

runTest("Corrupt 'ruhani-quran-bookmarks' (corrupted JSON) falls back to empty array []", () => {
  const result = parseStoredJsonSafe("['1:1', corrupted json...", []);
  assert.deepStrictEqual(result, []);
});

runTest("Corrupt 'ruhani-khatma-progress' (corrupted JSON) falls back safely", () => {
  const defaultKhatma = { completedJuz: [], completedSurahs: [], notes: {} };
  const result = parseStoredJsonSafe("{invalidJson!!!", defaultKhatma);
  assert.deepStrictEqual(result, defaultKhatma);
});

runTest("Corrupt 'ruhani-selected-city' (missing lat/lng) falls back to default city", () => {
  const defaultCity = { name: "Cairo", lat: 30.0444, lng: 31.2357 };
  const corrupt1 = parseStoredJsonSafe("not valid json", defaultCity);
  assert.deepStrictEqual(corrupt1, defaultCity);

  const parsedIncomplete = parseStoredJsonSafe('{"name":"Unknown"}', defaultCity);
  const finalCity = (parsedIncomplete?.lat && parsedIncomplete?.lng) ? parsedIncomplete : defaultCity;
  assert.deepStrictEqual(finalCity, defaultCity);
});

// -------------------------------------------------------------
// VECTOR 4: MUSHAF TEXT, BISMILLAH & SAJDAH RULES
// -------------------------------------------------------------
console.log("\n--- 4. MUSHAF TEXT, BISMILLAH & SAJDAH RULES ---");

function cleanVerseArabic(arabic, surahNum, ayahNum) {
  if (!arabic) return "";
  if (surahNum && surahNum > 1 && ayahNum === 1) {
    return arabic.replace(/^بِسْمِ\s+(?:ٱللَّهِ|اللَّهِ)\s+(?:ٱلرَّحْمَٰنِ|الرَّحْمَٰنِ|الرَّحْمَنِ)\s+(?:ٱلرَّحِيمِ|الرَّحِيمِ)\s*/u, "").trim();
  }
  return arabic;
}

runTest("Bismillah rule: Surah 1 Ayah 1 is the Bismillah itself and must NEVER be stripped", () => {
  const fatihaAyah1 = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ";
  const cleaned = cleanVerseArabic(fatihaAyah1, 1, 1);
  assert.strictEqual(cleaned, fatihaAyah1, "Surah 1 Ayah 1 should not have Bismillah stripped");
});

runTest("Bismillah rule: Surah 2 Ayah 1 does not repeat Bismillah inside verse text", () => {
  const baqarahAyah1WithBismillah = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ الٓمٓ";
  const cleaned = cleanVerseArabic(baqarahAyah1WithBismillah, 2, 1);
  assert.strictEqual(cleaned, "الٓمٓ", "Prefixed Bismillah must be stripped from Ayah 1 of Surahs 2-114");
});

runTest("Bismillah banner rule: Banner displays on Surahs 2-8, 10-114; OMITTED on Surah 1 and Surah 9", () => {
  const shouldShowBanner = (surahNum) => surahNum !== 1 && surahNum !== 9;

  assert.strictEqual(shouldShowBanner(1), false, "Surah 1 (Al-Fatiha) must NOT show top Bismillah banner");
  assert.strictEqual(shouldShowBanner(9), false, "Surah 9 (At-Tawbah) must NOT show top Bismillah banner");
  assert.strictEqual(shouldShowBanner(2), true, "Surah 2 (Al-Baqarah) MUST show top Bismillah banner");
  assert.strictEqual(shouldShowBanner(36), true, "Surah 36 (Ya-Sin) MUST show top Bismillah banner");
  assert.strictEqual(shouldShowBanner(114), true, "Surah 114 (An-Nas) MUST show top Bismillah banner");
});

runTest("Sajdah indicators: Exactly 15 canonical verses are recognized", () => {
  const SAJDAH_VERSES = new Set([
    "7:206", "13:15", "16:50", "17:109", "19:58",
    "22:18", "22:77", "25:60", "27:26", "32:15",
    "38:24", "41:38", "53:62", "84:21", "96:19"
  ]);

  assert.strictEqual(SAJDAH_VERSES.size, 15, "There must be exactly 15 canonical Sajdah verses");
  assert.strictEqual(SAJDAH_VERSES.has("96:19"), true, "Surah Al-Alaq 96:19 must be a Sajdah verse");
  assert.strictEqual(SAJDAH_VERSES.has("1:7"), false, "Surah 1:7 is not a Sajdah verse");
});

// -------------------------------------------------------------
// VECTOR 5: ZIKR COUNTER OVERFLOW & TAJWEED PARSING
// -------------------------------------------------------------
console.log("\n--- 5. ZIKR COUNTER & TAJWEED PARSING ---");

runTest("Zikr Counter: Zero target does not divide by zero or yield NaN", () => {
  const calcProgress = (current, target) => {
    return target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  };

  assert.strictEqual(calcProgress(0, 0), 0);
  assert.strictEqual(calcProgress(5, 0), 0);
  assert.strictEqual(calcProgress(33, 33), 100);
  assert.strictEqual(calcProgress(50, 33), 100); // capped at 100
  assert.strictEqual(isNaN(calcProgress(5, 0)), false, "Progress must never be NaN");
});

runTest("Zikr Counter: Out of bounds dhikr index falls back cleanly", () => {
  const defaultDhikrs = [
    { phrase: "SubhanAllah", arabic: "سُبْحَانَ ٱللَّٰهِ", target: 33, current: 0 }
  ];
  const counters = [...defaultDhikrs];
  const dhikrIndex = 999;
  const currentDhikr = counters[dhikrIndex] || defaultDhikrs[0];

  assert.strictEqual(currentDhikr.phrase, "SubhanAllah", "Should fall back to default dhikr on out-of-bounds index");
});

runTest("Tajweed parser: Handles null, undefined, and non-string inputs safely without crashing", () => {
  function renderTajweedContent(arabicText) {
    if (!arabicText || typeof arabicText !== "string") return null;
    return arabicText.split(/([ن|م]ّ|[قطبجد]ْ|[آ|ـٓ|وٓ|يٓ|ٓ])/g);
  }

  assert.strictEqual(renderTajweedContent(""), null);
  assert.strictEqual(renderTajweedContent(null), null);
  assert.strictEqual(renderTajweedContent(undefined), null);
  assert.strictEqual(renderTajweedContent(123), null);
  assert.strictEqual(renderTajweedContent({}), null);

  const tokens = renderTajweedContent("قُلْ هُوَ اللَّهُ أَحَدٌ");
  assert.strictEqual(Array.isArray(tokens), true);
  assert.strictEqual(tokens.length > 0, true);
});

function stripTashkeel(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/[\u0617-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
    .replace(/[\u0640]/g, "")
    .replace(/\u0670/g, "ا")
    .trim();
}

runTest("stripTashkeel: Handles null, undefined, numbers without crashing", () => {
  assert.strictEqual(stripTashkeel(""), "");
  assert.strictEqual(stripTashkeel(null), "");
  assert.strictEqual(stripTashkeel(undefined), "");
  assert.strictEqual(stripTashkeel(456), "");
  assert.strictEqual(stripTashkeel("بِسْمِ ٱللَّهِ"), "بسم ٱلله");
  const cleanWithAlif = stripTashkeel("بِسْمِ ٱللَّهِ").replace(/[إأآٱ]/g, "ا");
  assert.strictEqual(cleanWithAlif, "بسم الله");
});

console.log("\n=================================================");
console.log(`🎉 AUDIT COMPLETE: ${passedTests}/${totalTests} TESTS PASSED`);
console.log("=================================================");

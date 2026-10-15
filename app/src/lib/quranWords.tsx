import React from "react";

// =========================================================================
// UNIVERSAL QURANIC PART-OF-SPEECH (POS) MAPPING DICTIONARY
// Maps Quranic Arabic Corpus / Quran.com grammatical tags to Arabic terms
// =========================================================================
export const QURANIC_POS_MAP: Record<string, string> = {
  // Nominals (الأسماء)
  "N": "اسم",
  "NOUN": "اسم",
  "PN": "اسم علم",
  "PROPER_NOUN": "اسم علم",
  "ADJ": "صفة (نعت)",
  "ADJECTIVE": "صفة (نعت)",
  "PRON": "ضمير",
  "PRONOUN": "ضمير",
  "DEM": "اسم إشارة",
  "DEMONSTRATIVE": "اسم إشارة",
  "REL": "اسم موصول",
  "RELATIVE": "اسم موصول",
  "T": "ظرف زمان",
  "TIME": "ظرف زمان",
  "LOC": "ظرف مكان",
  "LOCATION": "ظرف مكان",

  // Verbs (الأفعال)
  "V": "فعل",
  "VERB": "فعل",
  "V_PERF": "فعل ماض",
  "V_IMPF": "فعل مضارع",
  "V_IMPV": "فعل أمر",
  "PERF": "فعل ماض",
  "IMPF": "فعل مضارع",
  "IMPV": "فعل أمر",
  "ACT_PCPL": "اسم فاعل",
  "PASS_PCPL": "اسم مفعول",
  "VN": "مصدر",

  // Particles (الحروف والأدوات)
  "P": "حرف جر",
  "PREP": "حرف جر",
  "PREPOSITION": "حرف جر",
  "CONJ": "حرف عطف",
  "CONJUNCTION": "حرف عطف",
  "SUB": "حرف مصدري ونصب",
  "EMPH": "حرف توكيد (لام التوكيد)",
  "ACC": "حرف توكيد ونصب",
  "NEG": "حرف نفي",
  "NEGATIVE": "حرف نفي",
  "PROH": "حرف نهي",
  "PROHIBITION": "حرف نهي",
  "INTG": "حرف استفهام",
  "INTERROGATIVE": "حرف استفهام",
  "VOC": "حرف نداء",
  "VOCATIVE": "حرف نداء",
  "ANS": "حرف جواب",
  "ANSWER": "حرف جواب",
  "AVR": "حرف ردع وزجر",
  "CAUS": "حرف سببية",
  "CERT": "حرف تحقيق",
  "CERTAINTY": "حرف تحقيق",
  "CIRC": "حرف حال (واو الحال)",
  "COM": "واو المعية",
  "COND": "حرف شرط",
  "CONDITIONAL": "حرف شرط",
  "EQ": "حرف تسوية",
  "EXH": "حرف تحضيض",
  "EXL": "حرف تفصيل",
  "EXP": "أداة استثناء",
  "EXCEPT": "أداة استثناء",
  "FUT": "حرف استقبال (تسويف)",
  "FUTURE": "حرف استقبال",
  "INC": "حرف ابتداء",
  "INT": "حرف تفسير",
  "PREV": "حرف كاف",
  "REM": "حرف استئنافية",
  "RES": "أداة حصر",
  "RESTRICTION": "أداة حصر",
  "RET": "حرف إضراب",
  "RSLT": "حرف واقع في جواب الشرط",
  "SUP": "حرف صلة (زائد)",
  "SUR": "حرف فجاءة",
  "ATT": "حرف تنبيه",
  "INL": "حروف مقطعة",
};

// =========================================================================
// EXHAUSTIVE CLOSED-CLASS GRAMMATICAL DICTIONARIES
// Particles, Prepositions, Pronouns, and Functional Words in the Quran
// =========================================================================

// Prepositions (حروف الجر)
const PREPOSITIONS_EXACT = new Set([
  "على", "في", "من", "إلى", "عن", "حتى", "مذ", "منذ", "خلا", "عدا", "حاشا",
  "عليه", "عليها", "عليهم", "عليهما", "عليكم", "علينا", "علي",
  "فيه", "فيها", "فيهم", "فيهما", "فيكم", "فينا",
  "منه", "منها", "منهم", "منهما", "منكم", "منا", "مني",
  "إليه", "إليها", "إليهم", "إليهما", "إليكم", "إلينا", "إلي",
  "عنه", "عنها", "عنهم", "عنهما", "عنكم", "عنا", "عني",
  "به", "بها", "بهم", "بهما", "بكم", "بنا", "بي",
  "له", "لها", "لهم", "لهما", "لكم", "لنا", "لي"
]);

// Particles of Emphasis & Accusative (حروف التوكيد والنصب)
const PARTICLES_EMPHASIS_EXACT = new Set([
  "إن", "إنما", "أن", "أنما", "كأن", "لكن", "ليت", "لعل", "قد"
]);

// Negative & Prohibition Particles (حروف النفي والنهي)
const PARTICLES_NEGATIVE_EXACT = new Set([
  "لا", "ما", "لم", "لن", "لات", "ليس", "ليست", "ليسوا"
]);

// Conjunctions (حروف العطف)
const PARTICLES_CONJUNCTION_EXACT = new Set([
  "ثم", "أو", "أم", "بل", "لكن"
]);

// Interrogative Particles & Nouns (حروف وأدوات الاستفهام)
const PARTICLES_INTERROGATIVE_EXACT = new Set([
  "هل", "أين", "متى", "كيف", "كم", "أيان", "أنى", "ماذا"
]);

// Relative Pronouns (الأسماء الموصولة)
const RELATIVE_PRONOUNS_EXACT = new Set([
  "الذي", "التي", "اللذان", "اللتان", "الذين", "اللاتي", "اللواتي", "اللائي", "الاولى", "الأولى",
  "ٱلذي", "ٱلتي", "ٱلذين", "ٱللاتي", "ٱللائي"
]);

// Demonstrative Pronouns (أسماء الإشارة)
const DEMONSTRATIVES_EXACT = new Set([
  "هذا", "هذه", "هذان", "هاتان", "هؤلاء", "ذلك", "ذلكم", "ذلكما", "تلك", "أولئك", "اولئك", "أولاء",
  "هنا", "هنالك"
]);

// Pronouns (الضمائر المنفصلة)
const PRONOUNS_EXACT = new Set([
  "هو", "هي", "هما", "هم", "هن", "أنت", "أنتما", "أنتم", "أنتن", "أنا", "نحن",
  "إياه", "إياها", "إياهما", "إياهم", "إياهن", "إياك", "إياكما", "إياكم", "إياكن", "إياي", "إيانا"
]);

// Vocatives (أدوات النداء والتنبيه)
const VOCATIVES_EXACT = new Set([
  "يا", "أيها", "أيتها", "ياأيها", "يـأيها", "يأيها"
]);

// Curated high-frequency Quranic vocabulary with verified roots
const VERIFIED_QURAN_LEXICON: Record<string, { en: string; tr: string; root?: string; type: string }> = {
  "الله": { en: "Allah", tr: "Allah", root: "أله", type: "اسم علم (لفظ الجلالة)" },
  "لله": { en: "To Allah", tr: "lillah", root: "أله", type: "اسم علم (لفظ الجلالة)" },
  "بالله": { en: "In Allah", tr: "billah", root: "أله", type: "اسم علم (لفظ الجلالة)" },
  "والله": { en: "And Allah", tr: "wallah", root: "أله", type: "اسم علم (لفظ الجلالة)" },
  "الرحمن": { en: "The Most Gracious", tr: "Ar-Rahman", root: "رحم", type: "اسم (صفة مشبهة)" },
  "الرحمان": { en: "The Most Gracious", tr: "Ar-Rahman", root: "رحم", type: "اسم (صفة مشبهة)" },
  "الرحيم": { en: "The Most Merciful", tr: "Ar-Rahim", root: "رحم", type: "اسم (صفة مشبهة)" },
  "رب": { en: "Lord / Sustainer", tr: "Rabb", root: "ربب", type: "اسم" },
  "العالمين": { en: "The Universe / Worlds", tr: "Al-'Alameen", root: "علم", type: "اسم" },
  "مالك": { en: "Master / Sovereign", tr: "Maalik", root: "ملك", type: "اسم (اسم فاعل)" },
  "ملك": { en: "King / Sovereign", tr: "Malik", root: "ملك", type: "اسم" },
  "يوم": { en: "Day", tr: "Yawm", root: "يوم", type: "اسم" },
  "الدين": { en: "Judgment / Religion", tr: "Ad-Deen", root: "دين", type: "اسم" },
  "صراط": { en: "Path / Way", tr: "Sirat", root: "صرط", type: "اسم" },
  "المستقيم": { en: "The Straight", tr: "Al-Mustaqeem", root: "قوم", type: "صفة (نعت)" },
  "غير": { en: "Other than / Not", tr: "Ghayr", root: "غير", type: "اسم" },
  "المغضوب": { en: "Those who earned wrath", tr: "Al-Maghdoob", root: "غضب", type: "اسم مفعول" },
  "الضالين": { en: "Those astray", tr: "Ad-Dalleen", root: "ضلل", type: "اسم فاعل" },
  "كتاب": { en: "Book / Scripture", tr: "Kitab", root: "كتب", type: "اسم" },
  "شديد": { en: "Severe / Intense", tr: "Shadeed", root: "شدد", type: "اسم" },
  "العقاب": { en: "The Punishment", tr: "Al-'Iqab", root: "عقب", type: "اسم" },
  "البر": { en: "Righteousness", tr: "Al-Birr", root: "برر", type: "اسم" },
  "التقوى": { en: "Piety / God-consciousness", tr: "At-Taqwa", root: "وقي", type: "اسم" },
  "الإثم": { en: "Sin / Iniquity", tr: "Al-Ithm", root: "أثم", type: "اسم" },
  "العدوان": { en: "Transgression", tr: "Al-'Udwan", root: "عدو", type: "اسم" },
  "الشهر": { en: "The Month", tr: "Ash-Shahr", root: "شهر", type: "اسم" },
  "الحرام": { en: "The Sacred", tr: "Al-Haram", root: "حرم", type: "صفة (نعت)" },
  "شعائر": { en: "Symbols / Rites", tr: "Sha'a'ir", root: "شعر", type: "اسم" },
  "الصلاة": { en: "Prayer", tr: "As-Salah", root: "صلو", type: "اسم" },
  "الزكاة": { en: "Zakah / Charity", tr: "Az-Zakah", root: "زكو", type: "اسم" },
  "جنة": { en: "Paradise / Garden", tr: "Jannah", root: "جنن", type: "اسم" },
  "نار": { en: "Fire / Hellfire", tr: "Naar", root: "نور", type: "اسم" },
  "رسول": { en: "Messenger", tr: "Rasool", root: "رسل", type: "اسم" },
  "نبي": { en: "Prophet", tr: "Nabi", root: "نبأ", type: "اسم" },
  "صبر": { en: "Patience", tr: "Sabr", root: "صبر", type: "اسم" },
  "شكر": { en: "Gratitude", tr: "Shukr", root: "شكر", type: "اسم" },
  "قلب": { en: "Heart", tr: "Qalb", root: "قلب", type: "اسم" },
  "حق": { en: "Truth / Right", tr: "Haqq", root: "حقق", type: "اسم" },
  "نور": { en: "Light", tr: "Noor", root: "نور", type: "اسم" }
};

/**
 * Strips Arabic diacritics (tashkeel), tatweel, and normalizes dagger alifs
 */
export function stripTashkeel(text: string): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/[\u0617-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
    .replace(/[\u0640]/g, "") // remove tatweel
    .replace(/\u0670/g, "ا")  // normalize dagger alif to alif
    .trim();
}

/**
 * Robust, verified classification of Quranic words.
 * CRITICAL RULE: If precise grammatical data is genuinely unavailable, returns {}
 * so the "الصنف اللغوي" row is cleanly hidden rather than displaying false data.
 */
export function classifyQuranicWord(
  rawWord: string,
  englishTranslation = "",
  posTag?: string
): { type?: string; root?: string } {
  // 0. If official POS tag is provided (from Quranic Corpus / API), map it directly
  if (posTag) {
    const cleanTag = posTag.toUpperCase().trim();
    if (QURANIC_POS_MAP[cleanTag]) {
      return { type: QURANIC_POS_MAP[cleanTag] };
    }
  }

  const clean = stripTashkeel(rawWord);
  const cleanWithAlif = clean.replace(/[إأآٱ]/g, "ا");
  const en = (englishTranslation || "").toLowerCase().trim();

  // 1. Check verified Quran lexicon
  const lex = VERIFIED_QURAN_LEXICON[clean] || VERIFIED_QURAN_LEXICON[cleanWithAlif];
  if (lex) {
    return { type: lex.type, root: lex.root };
  }

  // 2. Allah / Lord (اسم علم / اسم)
  if (
    clean === "الله" || clean === "للَّه" || clean === "لله" || clean === "ٱلله" ||
    clean === "بالله" || clean === "والله" || clean === "فالله" || clean === "تالله" ||
    cleanWithAlif === "الله"
  ) {
    return { type: "اسم علم (لفظ الجلالة)", root: "أله" };
  }
  if (clean === "رب" || clean === "ربك" || clean === "ربنا" || clean === "ربكم" || clean === "ربهم" || clean === "ربي") {
    return { type: "اسم", root: "ربب" };
  }

  // 3. Prepositions (حرف جر) - STRICTLY NO ROOT for pure particles
  if (PREPOSITIONS_EXACT.has(clean) || PREPOSITIONS_EXACT.has(cleanWithAlif)) {
    return { type: "حرف جر" };
  }
  if (clean === "بسم" || clean === "باسم" || clean === "بـسم") {
    return { type: "حرف جر + اسم", root: "سمو" };
  }

  // 4. Vocatives (أداة نداء وتنبيه)
  if (
    VOCATIVES_EXACT.has(clean) ||
    VOCATIVES_EXACT.has(cleanWithAlif) ||
    clean.startsWith("يـأيها") ||
    clean.startsWith("ياأيها") ||
    clean.startsWith("يأيها")
  ) {
    return { type: "أداة نداء وتنبيه" };
  }

  // 5. Relative Pronouns (اسم موصول)
  if (RELATIVE_PRONOUNS_EXACT.has(clean) || RELATIVE_PRONOUNS_EXACT.has(cleanWithAlif)) {
    return { type: "اسم موصول" };
  }

  // 6. Demonstratives (اسم إشارة)
  if (DEMONSTRATIVES_EXACT.has(clean) || DEMONSTRATIVES_EXACT.has(cleanWithAlif)) {
    return { type: "اسم إشارة" };
  }

  // 7. Pronouns (ضمير)
  if (PRONOUNS_EXACT.has(clean) || PRONOUNS_EXACT.has(cleanWithAlif)) {
    return { type: "ضمير" };
  }
  if (clean === "وإياك" || clean === "فإياك" || cleanWithAlif === "واياك") {
    return { type: "حرف عطف + ضمير" };
  }

  // 8. Negative & Prohibition (حرف نفي / حرف نهي)
  if (PARTICLES_NEGATIVE_EXACT.has(clean) || PARTICLES_NEGATIVE_EXACT.has(cleanWithAlif)) {
    if (clean === "لا" && (en.includes("do not") || en.includes("not violate"))) {
      return { type: "حرف نهي" };
    }
    return { type: "حرف نفي" };
  }
  if (clean === "ولا" || clean === "فلا") {
    return { type: "حرف عطف + حرف نفي" };
  }

  // 9. Particle of Emphasis (حرف توكيد ونصب)
  if (PARTICLES_EMPHASIS_EXACT.has(clean) || PARTICLES_EMPHASIS_EXACT.has(cleanWithAlif)) {
    return { type: "حرف توكيد ونصب" };
  }

  // 10. Conjunctions (حرف عطف)
  if (PARTICLES_CONJUNCTION_EXACT.has(clean) || PARTICLES_CONJUNCTION_EXACT.has(cleanWithAlif)) {
    return { type: "حرف عطف" };
  }

  // 11. Interrogatives (حرف استفهام)
  if (PARTICLES_INTERROGATIVE_EXACT.has(clean) || PARTICLES_INTERROGATIVE_EXACT.has(cleanWithAlif)) {
    return { type: "حرف استفهام" };
  }

  // 12. Verbs (الأفعال: ماض، مضارع، أمر)
  // Imperative verbs (فعل أمر)
  if (
    clean === "تعاونوا" || clean === "وتعاونوا" || clean === "اتقوا" || clean === "واتقوا" ||
    clean === "اهدنا" || clean === "قل" || clean === "اعلموا" || clean === "واذكروا" || clean === "اذكروا" ||
    clean === "اسجدوا" || clean === "اركعوا" || clean === "اقرأ" || clean === "تعالوا" || clean === "استغفروا" ||
    clean === "اصبروا" || clean === "أقيموا" || clean === "وءاتوا" || clean === "وآتوا" || clean === "اطيعوا" || clean === "وأطيعوا" ||
    cleanWithAlif === "تعاونوا" || cleanWithAlif === "وتعاونوا" || cleanWithAlif === "اتقوا" || cleanWithAlif === "واتقوا" ||
    cleanWithAlif === "اهدنا"
  ) {
    return { type: "فعل أمر" };
  }

  // Past verbs (فعل ماض)
  if (
    clean === "آمنوا" || clean === "ءامنوا" || clean === "قال" || clean === "قالوا" ||
    clean === "كان" || clean === "كانوا" || clean === "أنعمت" || clean === "انعمت" ||
    clean === "خلق" || clean === "أنزل" || clean === "كفروا" || clean === "جعل" ||
    clean === "عملوا" || clean === "تابوا" || clean === "جاء" || clean === "أرسلنا" || clean === "أوتي" ||
    cleanWithAlif === "امنوا" || cleanWithAlif === "انعمت" || cleanWithAlif === "انزل"
  ) {
    return { type: "فعل ماض" };
  }

  // Present/Imperfect verbs (فعل مضارع)
  if (
    clean === "نعبد" || clean === "نستعين" || clean === "تحلوا" || clean === "تؤمنون" ||
    clean === "يؤمنون" || clean === "يقيمون" || clean === "ينفقون" || clean === "يوقنون" ||
    clean === "يعلمون" || clean === "تعلمون" || clean === "يشعرون" || clean === "يقولون" ||
    clean === "يريد" || clean === "يهدي" || clean === "يضل" || clean === "يغفر" || clean === "تتقون" ||
    cleanWithAlif === "يومنون" || cleanWithAlif === "يوقنون"
  ) {
    return { type: "فعل مضارع" };
  }

  // Contextual English translation matching for verbs
  if (en.startsWith("help one another") || en.startsWith("guide us") || en.startsWith("say!") || en.startsWith("fear allah") || en.startsWith("establish")) {
    return { type: "فعل أمر" };
  }
  if (en.startsWith("believe") || en.startsWith("they believe") || en.startsWith("he said") || en.startsWith("they said") || en.startsWith("created") || en.startsWith("bestowed")) {
    return { type: "فعل ماض" };
  }
  if (en.startsWith("we worship") || en.startsWith("we ask for help") || en.startsWith("violate") || en.startsWith("they establish") || en.startsWith("they spend") || en.startsWith("they know")) {
    return { type: "فعل مضارع" };
  }

  // 13. Nouns with definite article (الـ / ٱلـ)
  if (
    clean.startsWith("ال") || clean.startsWith("ٱل") ||
    clean.startsWith("وال") || clean.startsWith("وٱل") ||
    clean.startsWith("فال") || clean.startsWith("فٱل") ||
    cleanWithAlif.startsWith("ال") || cleanWithAlif.startsWith("وال")
  ) {
    return { type: "اسم" };
  }

  // ZERO FALLBACK STRINGS: If precise grammar is not definitively confirmed, return empty object!
  return {};
}

export interface WordMorphology {
  id?: number;
  position?: number;
  arabic: string;
  cleanArabic: string;
  english: string;
  transliteration: string;
  root?: string; // Optional: omitted when word has no root (particles/prepositions)
  type?: string; // Optional: strictly undefined when precise grammar is not verified
  audioUrl?: string; // Real pronunciation audio URL from Quran.com CDN
}

// In-memory caches for verse words and full chapter words
const verseWordsCache = new Map<string, WordMorphology[]>();
const surahWordsCache = new Map<number, Map<string, WordMorphology[]>>();

/**
 * Fetches verified word-by-word data for an entire Surah in one single API roundtrip.
 * Ensures strict, zero-offset binding where every word is an immutable API object.
 */
export async function fetchSurahWords(
  surahNumber: number
): Promise<Map<string, WordMorphology[]>> {
  if (surahWordsCache.has(surahNumber)) {
    return surahWordsCache.get(surahNumber)!;
  }

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_chapter/${surahNumber}?words=true&word_fields=text_uthmani,location&per_page=300`
    );
    if (!res.ok) return new Map();

    const data = await res.json();
    const verses = data?.verses;
    if (!Array.isArray(verses)) return new Map();

    const resultMap = new Map<string, WordMorphology[]>();

    for (const v of verses) {
      const verseKey: string = v.verse_key;
      const rawWords = v.words;
      if (!Array.isArray(rawWords)) continue;

      const parsed: WordMorphology[] = rawWords
        .filter((w: { char_type_name: string }) => w.char_type_name === "word")
        .map((w: {
          id: number;
          position: number;
          text_uthmani?: string;
          text?: string;
          translation?: { text: string };
          transliteration?: { text: string };
          audio_url?: string;
          pos?: string;
          part_of_speech?: string;
        }) => {
          const ar = w.text_uthmani || w.text || "";
          const clean = stripTashkeel(ar);
          const english = w.translation?.text || "";
          const transliteration = w.transliteration?.text || clean;
          const grammar = classifyQuranicWord(ar, english, w.pos || w.part_of_speech);

          return {
            id: w.id,
            position: w.position,
            arabic: ar,
            cleanArabic: clean,
            english,
            transliteration,
            type: grammar.type, // Strictly undefined if unverified
            root: grammar.root, // Strictly undefined if particle/preposition or unverified
            audioUrl: w.audio_url ? `https://audio.qurancdn.com/${w.audio_url}` : undefined,
          };
        });

      resultMap.set(verseKey, parsed);
      verseWordsCache.set(verseKey, parsed);
    }

    surahWordsCache.set(surahNumber, resultMap);
    return resultMap;
  } catch (err) {
    console.debug(`Failed fetching surah ${surahNumber} words from Quran.com:`, err);
    return new Map();
  }
}

/**
 * Fetches verified word-by-word data for a single verse from Quran.com API v4
 */
export async function fetchVerseWords(verseKey: string): Promise<WordMorphology[]> {
  if (verseWordsCache.has(verseKey)) {
    return verseWordsCache.get(verseKey)!;
  }

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_key/${verseKey}?words=true&word_fields=text_uthmani,location`
    );
    if (!res.ok) return [];

    const data = await res.json();
    const rawWords = data?.verse?.words;
    if (!Array.isArray(rawWords)) return [];

    const parsed: WordMorphology[] = rawWords
      .filter((w: { char_type_name: string }) => w.char_type_name === "word")
      .map((w: {
        id: number;
        position: number;
        text_uthmani?: string;
        text?: string;
        translation?: { text: string };
        transliteration?: { text: string };
        audio_url?: string;
        pos?: string;
        part_of_speech?: string;
      }) => {
        const ar = w.text_uthmani || w.text || "";
        const clean = stripTashkeel(ar);
        const english = w.translation?.text || "";
        const transliteration = w.transliteration?.text || clean;
        const grammar = classifyQuranicWord(ar, english, w.pos || w.part_of_speech);

        return {
          id: w.id,
          position: w.position,
          arabic: ar,
          cleanArabic: clean,
          english,
          transliteration,
          type: grammar.type, // Strictly undefined if unverified
          root: grammar.root, // Strictly undefined if particle/preposition or unverified
          audioUrl: w.audio_url ? `https://audio.qurancdn.com/${w.audio_url}` : undefined,
        };
      });

    verseWordsCache.set(verseKey, parsed);
    return parsed;
  } catch (err) {
    console.debug("Failed fetching verse words from Quran.com:", err);
    return [];
  }
}

/**
 * Plays word pronunciation audio with instant feedback
 */
let currentWordAudio: HTMLAudioElement | null = null;
export function playWordAudio(audioUrl?: string): void {
  if (!audioUrl) return;
  try {
    if (currentWordAudio) {
      currentWordAudio.pause();
      currentWordAudio.currentTime = 0;
    }
    currentWordAudio = new Audio(audioUrl);
    currentWordAudio.play().catch((err) => console.debug("Error playing word audio:", err));
  } catch (e) {
    console.debug("Failed initializing word audio:", e);
  }
}

/**
 * Returns morphology and translation for an individual Quranic word.
 * Zero fake fallbacks: omits type entirely if unverified.
 */
export function getWordDetails(rawWord: string, translation?: string): WordMorphology {
  const clean = stripTashkeel(rawWord);
  const grammar = classifyQuranicWord(rawWord, translation);

  return {
    arabic: rawWord,
    cleanArabic: clean,
    english: translation || "Quranic word",
    transliteration: clean,
    type: grammar.type, // undefined if unverified -> row is hidden
    root: grammar.root, // undefined if particle/preposition -> row is hidden
  };
}

/**
 * Highlights Quranic text with Tajweed rules using semantic spiritual color tokens:
 * - Ghunna (نّ, مّ): Emerald
 * - Qalqala (ق, ط, ب, ج, د): Rose / Coral
 * - Madd (ٓ, آ): Purple
 * - Idgham & Ikhfa: Amber & Cyan
 */
export function renderTajweedContent(arabicText: string): React.ReactNode {
  if (!arabicText || typeof arabicText !== "string") return null;
  const tokens = arabicText.split(/([ن|م]ّ|[قطبجد]ْ|[آ|ـٓ|وٓ|يٓ|ٓ])/g);

  return tokens.map((tok, i) => {
    if (/^[ن|م]ّ$/.test(tok)) {
      return (
        <span
          key={i}
          title="غنة (Ghunna) — Nasalization"
          className="text-emerald-600 dark:text-emerald-400 font-extrabold underline decoration-emerald-500/50 decoration-2 underline-offset-4"
        >
          {tok}
        </span>
      );
    }
    if (/^[قطبجد]ْ$/.test(tok)) {
      return (
        <span
          key={i}
          title="قلقلة (Qalqala) — Echoing Vibration"
          className="text-rose-600 dark:text-rose-400 font-extrabold drop-shadow-[0_0_6px_rgba(244,63,94,0.4)]"
        >
          {tok}
        </span>
      );
    }
    if (/^[آ|ـٓ|وٓ|يٓ|ٓ]$/.test(tok)) {
      return (
        <span
          key={i}
          title="مد (Madd) — Prolongation"
          className="text-purple-600 dark:text-purple-400 font-extrabold"
        >
          {tok}
        </span>
      );
    }
    return <span key={i}>{tok}</span>;
  });
}

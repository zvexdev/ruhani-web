/**
 * Arabic Text Normalization & Fuzzy Search Utilities
 * Handles diacritics (tashkeel), varying alifs, taa marbuta, and compounding prefixes.
 */

/**
 * Strips all Arabic diacritics (tashkeel, tanween, shaddah, sukun, dagger alif, and Quranic recitation marks)
 * and normalizes letter variants to canonical base characters.
 */
export function normalizeArabic(text: string): string {
  if (!text) return "";

  return text
    // 1. Remove standard Tashkeel & Harakat + Quranic recitation annotations
    // \u064B-\u065F = Fathatan, Dammatan, Kasratan, Fatha, Damma, Kasra, Shadda, Sukun
    // \u0670 = Superscript / Dagger Alif
    // \u0610-\u061A = Arabic honorifics & small signs
    // \u06D6-\u06ED = Quranic pause & recitation marks
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
    // 2. Normalize Alif variations (أ, إ, آ, ٱ, ٵ, ٲ) -> ا
    .replace(/[أإآٱٵٲ]/g, "ا")
    // 3. Normalize Taa Marbuta (ة) -> ه
    .replace(/ة/g, "ه")
    // 4. Normalize Yaa / Alif Maqsura (ى) -> ي
    .replace(/ى/g, "ي")
    .toLowerCase()
    .trim();
}

/**
 * Universal bilingual search matcher:
 * Checks whether `query` matches `target`, handling both Arabic normalizations and case-insensitive Latin strings.
 */
export function searchMatch(target: string | undefined | null, query: string | undefined | null): boolean {
  if (!target || !query) return false;

  const trimmedQuery = query.trim();
  if (!trimmedQuery) return false;

  // 1. Standard lower-case Latin match
  const lowerTarget = target.toLowerCase();
  const lowerQuery = trimmedQuery.toLowerCase();
  if (lowerTarget.includes(lowerQuery)) return true;

  // 2. Arabic normalized match
  const normTarget = normalizeArabic(target);
  const normQuery = normalizeArabic(trimmedQuery);

  if (!normTarget || !normQuery) return false;
  if (normTarget.includes(normQuery)) return true;

  // 3. Match without spaces (e.g. "عبد الباسط" vs "عبدالباسط" or "عبد الرحمن" vs "عبدالرحمن")
  const noSpaceTarget = normTarget.replace(/\s+/g, "");
  const noSpaceQuery = normQuery.replace(/\s+/g, "");
  if (noSpaceQuery.length >= 2 && noSpaceTarget.includes(noSpaceQuery)) return true;

  // 4. Match with / without Arabic definite article "ال" (Al-)
  const stripAlTarget = normTarget.replace(/^ال/, "");
  const stripAlQuery = normQuery.replace(/^ال/, "");
  if (stripAlQuery.length >= 2 && (stripAlTarget.includes(stripAlQuery) || normTarget.includes(stripAlQuery))) {
    return true;
  }

  // 5. English transliteration prefix handling (e.g. "Al-Fatihah" vs "Fatihah", "Ar-Rahman" vs "Rahman")
  const stripEnPrefixTarget = lowerTarget.replace(/^(al|ar|as|at|an|az|ad|ash|adh)-/, "");
  const stripEnPrefixQuery = lowerQuery.replace(/^(al|ar|as|at|an|az|ad|ash|adh)-/, "");
  if (stripEnPrefixQuery.length >= 2 && stripEnPrefixTarget.includes(stripEnPrefixQuery)) {
    return true;
  }

  return false;
}

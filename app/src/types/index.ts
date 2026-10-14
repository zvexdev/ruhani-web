export interface SurahMeta {
  number: number;
  name_arabic: string;
  name_english: string;
  name_complex: string;
  name_translation: string;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  verses_count: number;
  pages: number[];
  audio: {
    reciters_available: number;
    example_audio: string;
  };
}

export interface Verse {
  verse_key: string;
  ayah: number;
  arabic: string;
  transliteration: string;
  translations: Record<string, string>;
  audio: {
    ayah_audio: string;
    all_reciters: string;
  };
}

export interface SurahDetail {
  surah: {
    number: number;
    name_arabic: string;
    name_english: string;
    verses_count: number;
  };
  audio: {
    reciters_available: number;
    example_audio: string;
  };
  total_verses: number;
  verses: Verse[];
}

export interface Reciter {
  id: number;
  name: string;
  name_arabic: string;
  style: string;
}

export interface HadithCollection {
  key: string;
  name: string;
  arabic_name: string;
  author: string;
  reliability: string;
  total_hadiths: number;
}

export interface Hadith {
  id: string;
  collection: string;
  collection_name: string;
  hadithnumber: number;
  arabic: string;
  english: string;
  grade: string;
}

export interface Dua {
  id: number;
  category: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  source: string;
  repeat: number;
}

export interface NameOfAllah {
  number: number;
  arabic: string;
  transliteration: string;
  english: string;
  meaning: string;
}

export interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
}

export interface SearchResult {
  verse_key: string;
  surah_number: number;
  surah_name: string;
  ayah: number;
  arabic: string;
  transliteration: string;
  matched_in: string;
  translation: string;
  translation_source: string;
}

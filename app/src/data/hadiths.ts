// Curated collection of essential Sahih and Hasan Hadiths
// Provides instant offline access with full Arabic and English texts

import type { Hadith, HadithCollection } from "../types";

export const DEFAULT_COLLECTIONS: HadithCollection[] = [
  {
    key: "bukhari",
    name: "Sahih al-Bukhari",
    arabic_name: "صحيح البخاري",
    author: "Imam Muhammad al-Bukhari",
    reliability: "Sahih",
    total_hadiths: 7563
  },
  {
    key: "muslim",
    name: "Sahih Muslim",
    arabic_name: "صحيح مسلم",
    author: "Imam Muslim ibn al-Hajjaj",
    reliability: "Sahih",
    total_hadiths: 7500
  },
  {
    key: "tirmidhi",
    name: "Jami' at-Tirmidhi",
    arabic_name: "جامع الترمذي",
    author: "Imam Abu 'Isa at-Tirmidhi",
    reliability: "Hasan-Sahih",
    total_hadiths: 3956
  },
  {
    key: "abudawud",
    name: "Sunan Abi Dawud",
    arabic_name: "سنن أبي داود",
    author: "Imam Abu Dawud as-Sijistani",
    reliability: "Sahih / Hasan",
    total_hadiths: 5274
  },
  {
    key: "nasai",
    name: "Sunan an-Nasa'i",
    arabic_name: "سنن النسائي",
    author: "Imam Ahmad an-Nasa'i",
    reliability: "Sahih",
    total_hadiths: 5758
  },
  {
    key: "ibnmajah",
    name: "Sunan Ibn Majah",
    arabic_name: "سنن ابن ماجه",
    author: "Imam Ibn Majah",
    reliability: "Sahih / Hasan",
    total_hadiths: 4341
  },
  {
    key: "nawawi40",
    name: "40 Hadith an-Nawawi",
    arabic_name: "الأربعون النووية",
    author: "Imam Yahya an-Nawawi",
    reliability: "Sahih",
    total_hadiths: 42
  }
];

export const CURATED_HADITHS: Hadith[] = [
  {
    id: "hadith-1",
    collection: "bukhari",
    collection_name: "Sahih al-Bukhari",
    hadithnumber: 1,
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ",
    english: "Actions are judged by motives and intentions, and every person will get what he intended. Thus, he whose migration was for the sake of Allah and His Messenger, his migration was for Allah and His Messenger, and he whose migration was for some worldly benefit or to take a woman in marriage, his migration was for the purpose he migrated for.",
    grade: "Sahih"
  },
  {
    id: "hadith-2",
    collection: "bukhari",
    collection_name: "Sahih al-Bukhari",
    hadithnumber: 13,
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    english: "None of you truly believes until he loves for his brother what he loves for himself.",
    grade: "Sahih"
  },
  {
    id: "hadith-3",
    collection: "muslim",
    collection_name: "Sahih Muslim",
    hadithnumber: 223,
    arabic: "الطُّهُورُ شَطْرُ الإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلأُ الْمِيزَانَ، وَسُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ تَمْلآنِ مَا بَيْنَ السَّمَاوَاتِ وَالأَرْضِ",
    english: "Purity is half of faith, and 'Alhamdulillah' (Praise be to Allah) fills the scale. 'SubhanAllah' (Glory be to Allah) and 'Alhamdulillah' fill together what is between the heavens and the earth.",
    grade: "Sahih"
  },
  {
    id: "hadith-4",
    collection: "tirmidhi",
    collection_name: "Jami' at-Tirmidhi",
    hadithnumber: 1987,
    arabic: "تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ",
    english: "Your smiling in the face of your brother is charity for you.",
    grade: "Sahih"
  },
  {
    id: "hadith-5",
    collection: "bukhari",
    collection_name: "Sahih al-Bukhari",
    hadithnumber: 6011,
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ",
    english: "Whoever believes in Allah and the Last Day should speak good or remain silent; and whoever believes in Allah and the Last Day should be hospitable to his neighbor; and whoever believes in Allah and the Last Day should entertain his guest generously.",
    grade: "Sahih"
  },
  {
    id: "hadith-6",
    collection: "muslim",
    collection_name: "Sahih Muslim",
    hadithnumber: 2564,
    arabic: "إِنَّ اللَّهَ رَفِيقٌ يُحِبُّ الرِّفْقَ فِي الأَمْرِ كُلِّهِ، وَيُعْطِي عَلَى الرِّفْقِ مَا لاَ يُعْطِي عَلَى الْعُنْفِ",
    english: "Verily, Allah is gentle and loves gentleness in all matters. He grants through gentleness what He does not grant through harshness.",
    grade: "Sahih"
  },
  {
    id: "hadith-7",
    collection: "tirmidhi",
    collection_name: "Jami' at-Tirmidhi",
    hadithnumber: 2344,
    arabic: "لَوْ أَنَّكُمْ كُنْتُمْ تَوَكَّلُونَ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرُزِقْتُمْ كَمَا يُرْزَقُ الطَّيْرُ تَغْدُو خِمَاصًا وَتَرُوحُ بِطَانًا",
    english: "If you were to rely upon Allah with true reliance, He would provide for you just as He provides for the birds: they fly out in the morning hungry and return in the evening full.",
    grade: "Sahih"
  },
  {
    id: "hadith-8",
    collection: "bukhari",
    collection_name: "Sahih al-Bukhari",
    hadithnumber: 5027,
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    english: "The best among you are those who learn the Quran and teach it to others.",
    grade: "Sahih"
  }
];

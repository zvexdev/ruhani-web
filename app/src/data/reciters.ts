// Comprehensive directory of renowned Quran reciters (Qaris)
// Default reciter is Sheikh Yasser Al-Dosari (ياسر الدوسري)

export interface ReciterInfo {
  id: number;
  name: string;
  name_arabic: string;
  style: string;
  riwayah: string;
  surahBaseUrl: string;
  ayahFolder: string;
  quranComId?: number;
}

export const RECITERS_LIST: ReciterInfo[] = [
  {
    id: 1,
    name: "Yasser Al-Dosari",
    name_arabic: "ياسر الدوسري",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server11.mp3quran.net/yasser",
    ayahFolder: "Yasser_Ad-Dussary_128kbps"
  },
  {
    id: 2,
    name: "Mishary Rashid Alafasy",
    name_arabic: "مشاري راشد العفاسي",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server8.mp3quran.net/afs",
    ayahFolder: "Alafasy_128kbps",
    quranComId: 7
  },
  {
    id: 3,
    name: "Abdul Rahman Al-Sudais",
    name_arabic: "عبد الرحمن السديس",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server11.mp3quran.net/sds",
    ayahFolder: "Abdurrahmaan_As-Sudais_192kbps",
    quranComId: 3
  },
  {
    id: 4,
    name: "Maher Al-Muaiqly",
    name_arabic: "ماهر المعيقلي",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server12.mp3quran.net/maher",
    ayahFolder: "MaherAlMuaiqly128kbps"
  },
  {
    id: 5,
    name: "Saud Al-Shuraim",
    name_arabic: "سعود الشريم",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server7.mp3quran.net/shur",
    ayahFolder: "Saood_ash-Shuraym_128kbps",
    quranComId: 10
  },
  {
    id: 6,
    name: "Mahmoud Khalil Al-Husary",
    name_arabic: "محمود خليل الحصري",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server13.mp3quran.net/husr",
    ayahFolder: "Husary_128kbps",
    quranComId: 6
  },
  {
    id: 7,
    name: "Mohamed Siddiq Al-Minshawi",
    name_arabic: "محمد صديق المنشاوي",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server10.mp3quran.net/minsh",
    ayahFolder: "Minshawy_Murattal_128kbps",
    quranComId: 9
  },
  {
    id: 8,
    name: "Abdul Basit Abdul Samad",
    name_arabic: "عبد الباسط عبد الصمد",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server7.mp3quran.net/basit",
    ayahFolder: "Abdul_Basit_Murattal_192kbps",
    quranComId: 2
  },
  {
    id: 9,
    name: "Saad Al-Ghamdi",
    name_arabic: "سعد الغامدي",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server7.mp3quran.net/s_gmd",
    ayahFolder: "Ghamadi_40kbps"
  },
  {
    id: 10,
    name: "Abu Bakr Al-Shatri",
    name_arabic: "أبو بكر الشاطري",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server11.mp3quran.net/shatri",
    ayahFolder: "Abu_Bakr_Ash-Shaatree_128kbps",
    quranComId: 4
  },
  {
    id: 11,
    name: "Nasser Al-Qatami",
    name_arabic: "ناصر القطامي",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server6.mp3quran.net/qtm",
    ayahFolder: "Nasser_Alqatami_128kbps"
  },
  {
    id: 12,
    name: "Ali Jaber",
    name_arabic: "علي جابر",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server11.mp3quran.net/a_jbr",
    ayahFolder: "Ali_Jaber_64kbps"
  },
  {
    id: 13,
    name: "Fares Abbad",
    name_arabic: "فارس عباد",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server8.mp3quran.net/frs_a",
    ayahFolder: "Fares_Abbad_64kbps"
  },
  {
    id: 14,
    name: "Bandar Baleela",
    name_arabic: "بندر بليلة",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server6.mp3quran.net/balilah",
    ayahFolder: "Yasser_Ad-Dussary_128kbps"
  },
  {
    id: 15,
    name: "Abdullah Basfar",
    name_arabic: "عبد الله بصفر",
    style: "Murattal",
    riwayah: "Hafs 'an 'Asim",
    surahBaseUrl: "https://server6.mp3quran.net/bsfr",
    ayahFolder: "Abdullah_Basfar_192kbps"
  }
];

export const DEFAULT_RECITER = RECITERS_LIST[0]; // Sheikh Yasser Al-Dosari

export function getSurahAudioUrl(reciterId: number, surahNumber: number): string {
  const reciter = RECITERS_LIST.find((r) => r.id === reciterId) || DEFAULT_RECITER;
  const padded = String(surahNumber).padStart(3, "0");
  return `${reciter.surahBaseUrl}/${padded}.mp3`;
}

export function getAyahAudioUrl(reciterId: number, surahNumber: number, ayahNumber: number): string {
  const reciter = RECITERS_LIST.find((r) => r.id === reciterId) || DEFAULT_RECITER;
  const paddedSurah = String(surahNumber).padStart(3, "0");
  const paddedAyah = String(ayahNumber).padStart(3, "0");
  return `https://everyayah.com/data/${reciter.ayahFolder}/${paddedSurah}${paddedAyah}.mp3`;
}

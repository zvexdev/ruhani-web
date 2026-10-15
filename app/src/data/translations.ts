// Bilingual translation dictionary (Arabic default, English toggle)
// All rights dedicated to seeking the pleasure of Allah

export type Language = "ar" | "en";

export interface Translations {
  // Navigation & Branding
  brandName: string;
  brandTagline: string;
  navHome: string;
  navQuran: string;
  navAudio: string;
  navQibla: string;
  navHadith: string;
  navZikr: string;
  navNames: string;

  // Common UI
  search: string;
  cancel: string;
  close: string;
  done: string;
  copy: string;
  copied: string;
  loading: string;
  filter: string;
  defaultBadge: string;
  live: string;
  upcoming: string;

  // Home Page
  homeHeroBadge: string;
  homeHeroTitle1: string;
  homeHeroTitleHighlight: string;
  homeHeroSubtitle: string;
  homeOpenQuran: string;
  homeListenQaris: string;
  homeQiblaFinder: string;
  homeFeaturedRecitation: string;
  homePlayRahman: string;
  homePlayingRahman: string;
  homeVerseOfDay: string;
  homeHadithOfDay: string;
  homeListenToVerse: string;
  homeReadTafsir: string;
  homeQuickAccess: string;
  homePrayerTimesTitle: string;

  // Quran Page
  quranTitle: string;
  quranSubtitle: string;
  quranSurahsButton: string;
  quranModeVerses: string;
  quranModeMushaf: string;
  quranSearchPlaceholder: string;
  quranFilterSurahs: string;
  quranReciterLabel: string;
  quranTranslationLabel: string;
  quranVersesCount: string;
  quranMeccan: string;
  quranMedinan: string;
  quranPlayVerse: string;
  quranTafsirBtn: string;
  quranCopyVerse: string;
  quranBookmarkVerse: string;
  quranTafsirTitle: string;
  quranTafsirLoading: string;
  quranPrevSurah: string;
  quranNextSurah: string;
  quranAutoFollow: string;
  quranAutoFollowActive: string;
  quranPlayAllAyahs: string;
  playerContinuousPlay: string;
  playerNextSurah: string;
  playerPrevSurah: string;
  quranTajweedMode: string;
  quranTajweedLegend: string;
  quranWordMeaning: string;
  quranWordRoot: string;
  quranWordTransliteration: string;
  quranKhatmaTracker: string;
  playerSleepTimer: string;
  sleepTimerOff: string;
  sleepTimer15m: string;
  sleepTimer30m: string;
  sleepTimer45m: string;
  sleepTimer60m: string;
  sleepTimerEndSurah: string;
  sleepTimerFading: string;
  offlineDownload: string;
  offlineDownloaded: string;
  offlineDownloading: string;
  offlineAvailable: string;

  // Audio Page
  audioTitle: string;
  audioSubtitle: string;
  audioDefaultReciterBadge: string;
  audioNowStreaming: string;
  audioSelectReciter: string;
  audioSelectSurah: string;
  audioSearchReciters: string;
  audioSearchSurahs: string;
  audioVolume: string;
  audioSpeed: string;

  // Qibla Page
  qiblaTitle: string;
  qiblaSubtitle: string;
  qiblaFinderBadge: string;
  qiblaDirectionToKaaba: string;
  qiblaDistanceKm: string;
  qiblaDetectGPS: string;
  qiblaDetecting: string;
  qiblaDegrees: string;
  qiblaCompassTip: string;

  // Zikr & Duas Page
  zikrTitle: string;
  zikrSubtitle: string;
  zikrDigitalTasbeeh: string;
  zikrTapToCount: string;
  zikrRound: string;
  zikrTarget: string;
  zikrReset: string;
  zikrSoundOn: string;
  zikrSoundOff: string;
  zikrMorningAdhkar: string;
  zikrEveningAdhkar: string;
  zikrAfterSalah: string;
  zikrBeforeSleep: string;
  zikrVirtue: string;
  zikrRepeatTimes: string;
  zikrMarkCompleted: string;

  // 99 Names of Allah
  namesTitle: string;
  namesSubtitle: string;
  namesSearchPlaceholder: string;
  namesMemorizedProgress: string;
  namesListenPronounce: string;
  namesMeaning: string;
  namesExplanation: string;
  namesCloseModal: string;

  // Hadith Page
  hadithTitle: string;
  hadithSubtitle: string;
  hadithSearchPlaceholder: string;
  hadithSelectBook: string;
  hadithGrade: string;
  hadithNarrator: string;
  hadithPrevPage: string;
  hadithNextPage: string;

  // Player Bar
  playerSkipBack: string;
  playerSkipForward: string;
  playerPlay: string;
  playerPause: string;

  // Footer & Attribution
  footerDescription: string;
  footerBismillah: string;
  footerSanctuarySections: string;
  footerProjectAndLicense: string;
  footerMitLicense: string;
  footerFreeToUse: string;
  footerApiAttribution: string;
  footerMadeBy: string;
  footerForUmmah: string;
  footerCopyright: string;
}

export const translations: Record<Language, Translations> = {
  ar: {
    // Navigation & Branding
    brandName: "روحاني",
    brandTagline: "روحاني",
    navHome: "الرئيسية",
    navQuran: "المصحف",
    navAudio: "التلاوات",
    navQibla: "القبلة",
    navHadith: "الحديث",
    navZikr: "الأذكار",
    navNames: "الأسماء الحسنى",

    // Common UI
    search: "بحث",
    cancel: "إلغاء",
    close: "إغلاق",
    done: "تم",
    copy: "نسخ",
    copied: "تم النسخ!",
    loading: "جارٍ التحميل...",
    filter: "تصفية",
    defaultBadge: "افتراضي",
    live: "مباشر",
    upcoming: "القادمة",

    // Home Page
    homeHeroBadge: "التقويم الهجري",
    homeHeroTitle1: "اقرأ، واستمع، وتدبر في",
    homeHeroTitleHighlight: "كتاب الله العزيز",
    homeHeroSubtitle: "واحة إسلامية هادئة لقراءة القرآن الكريم بخط عثماني نقي، والاستماع لأعذب التلاوات، ومتابعة أوقات الصلاة، والذكر الحكيم.",
    homeOpenQuran: "افتح المصحف الشريف",
    homeListenQaris: "استمع لكبار القراء",
    homeQiblaFinder: "بوصلة القبلة",
    homeFeaturedRecitation: "تلاوة مختارة خاشعة",
    homePlayRahman: "تشغيل سورة الرحمن",
    homePlayingRahman: "سورة الرحمن تعمل الآن",
    homeVerseOfDay: "آية اليوم",
    homeHadithOfDay: "حديث اليوم النبوي",
    homeListenToVerse: "استمع للآية",
    homeReadTafsir: "قراءة التفسير",
    homeQuickAccess: "أقسام الواحة",
    homePrayerTimesTitle: "مواقيت الصلاة الدقيقة",

    // Quran Page
    quranTitle: "القرآن الكريم",
    quranSubtitle: "تلاوة وتدبر كلام الله عز وجل مع التفاسير المعتمدة",
    quranSurahsButton: "فهرس السور",
    quranModeVerses: "عرض الآيات",
    quranModeMushaf: "المصحف المستمر",
    quranSearchPlaceholder: "ابحث في القرآن الكريم بالعربية أو الترجمة...",
    quranFilterSurahs: "تصفية 114 سورة...",
    quranReciterLabel: "القارئ:",
    quranTranslationLabel: "الترجمة:",
    quranVersesCount: "آية",
    quranMeccan: "مكية",
    quranMedinan: "مدنية",
    quranPlayVerse: "استمع إلى الآية",
    quranTafsirBtn: "عرض التفسير الميسر",
    quranCopyVerse: "نسخ الآية الكريمة",
    quranBookmarkVerse: "حفظ في العلامات",
    quranTafsirTitle: "التفسير الميسر",
    quranTafsirLoading: "جارٍ تحميل التفسير...",
    quranPrevSurah: "السورة السابقة",
    quranNextSurah: "السورة التالية",
    quranAutoFollow: "متابعة التلاوة",
    quranAutoFollowActive: "المتابعة التلقائية مفعلة",
    quranPlayAllAyahs: "تشغيل آيات السورة بالتتابع",
    playerContinuousPlay: "التشغيل المتتالي للسور",
    playerNextSurah: "السورة التالية",
    playerPrevSurah: "السورة السابقة",
    quranTajweedMode: "أحكام التجويد",
    quranTajweedLegend: "دليل أحكام التجويد الملون",
    quranWordMeaning: "المعنى اللفظي",
    quranWordRoot: "الجذر اللغوي",
    quranWordTransliteration: "النطق الصوتي",
    quranKhatmaTracker: "متابعة الختمة",
    playerSleepTimer: "مؤقت النوم الهادئ",
    sleepTimerOff: "إيقاف المؤقت",
    sleepTimer15m: "١٥ دقيقة",
    sleepTimer30m: "٣٠ دقيقة",
    sleepTimer45m: "٤٥ دقيقة",
    sleepTimer60m: "٦٠ دقيقة",
    sleepTimerEndSurah: "نهاية السورة الحالية",
    sleepTimerFading: "تلاشٍ تدريجي...",
    offlineDownload: "تحميل للاستماع أوفلاين",
    offlineDownloaded: "تم الحفظ أوفلاين",
    offlineDownloading: "جارٍ التحميل...",
    offlineAvailable: "متاح بدون إنترنت",

    // Audio Page
    audioTitle: "استمع للقرآن الكريم",
    audioSubtitle: "استمع لتلاوات خاشعة عالية الدقة بصوت 15 من كبار أئمة الحرمين وقراء العالم الإسلامي",
    audioDefaultReciterBadge: "القارئ الافتراضي: الشيخ ياسر الدوسري",
    audioNowStreaming: "يُبث الآن",
    audioSelectReciter: "اختر القارئ / الشيخ",
    audioSelectSurah: "اختر السورة",
    audioSearchReciters: "ابحث بين 15 شيخاً...",
    audioSearchSurahs: "ابحث بين 114 سورة...",
    audioVolume: "مستوى الصوت",
    audioSpeed: "السرعة",

    // Qibla Page
    qiblaTitle: "تحديد اتجاه القبلة المشرفة",
    qiblaSubtitle: "حساب فلكي دقيق لاتجاه الكعبة المشرفة في مكة المكرمة",
    qiblaFinderBadge: "بوصلة القبلة التفاعلية",
    qiblaDirectionToKaaba: "اتجاه القبلة",
    qiblaDistanceKm: "المسافة إلى الكعبة المشرفة",
    qiblaDetectGPS: "تحديد موقعي الحالي تلقائياً (GPS)",
    qiblaDetecting: "جارٍ تحديد الموقع...",
    qiblaDegrees: "درجة",
    qiblaCompassTip: "على أجهزة الهواتف الذكية، تدور البوصلة تلقائياً وفقاً لحركة مستشعر الهاتف.",

    // Zikr & Duas Page
    zikrTitle: "الأذكار والأدعية النبوية",
    zikrSubtitle: "تسبيح رقمي تفاعلي، وأذكار الصباح والمساء وأدعية اليوم والليلة",
    zikrDigitalTasbeeh: "المسبحة الرقمية",
    zikrTapToCount: "اضغط للتسبيح",
    zikrRound: "الجولة",
    zikrTarget: "الهدف:",
    zikrReset: "إعادة ضبط",
    zikrSoundOn: "كتم صوت النقر",
    zikrSoundOff: "تشغيل صوت النقر",
    zikrMorningAdhkar: "أذكار الصباح",
    zikrEveningAdhkar: "أذكار المساء",
    zikrAfterSalah: "أذكار بعد الصلاة",
    zikrBeforeSleep: "أذكار النوم",
    zikrVirtue: "فضل الذكر",
    zikrRepeatTimes: "مرات التكرار",
    zikrMarkCompleted: "تحديد كمكتمل",

    // 99 Names of Allah
    namesTitle: "أسماء الله الحسنى",
    namesSubtitle: "تعرف على معاني أسماء الله الحسنى واستمع إلى نطقها وتتبع حفظك لها",
    namesSearchPlaceholder: "ابحث بالاسم، المعنى، أو الرقم...",
    namesMemorizedProgress: "تم حفظ",
    namesListenPronounce: "استمع للنطق",
    namesMeaning: "المعنى والدلالة",
    namesExplanation: "شرح الاسم الكريم",
    namesCloseModal: "إغلاق التفاصيل",

    // Hadith Page
    hadithTitle: "موسوعة الحديث الشريف",
    hadithSubtitle: "تصفح أصح كتب السنة النبوية المطهرة والأحاديث النبوية الصحيحة",
    hadithSearchPlaceholder: "ابحث في كتب الحديث الشريف...",
    hadithSelectBook: "اختر كتاب الحديث",
    hadithGrade: "الحكم والدرجة:",
    hadithNarrator: "الراوي:",
    hadithPrevPage: "الصفحة السابقة",
    hadithNextPage: "الصفحة التالية",

    // Player Bar
    playerSkipBack: "تقديم 10 ثوانٍ",
    playerSkipForward: "تأخير 10 ثوانٍ",
    playerPlay: "تشغيل",
    playerPause: "إيقاف مؤقت",

    // Footer & Attribution
    footerDescription: "واحة إسلامية هادئة ومفتوحة المصدر لقراءة القرآن الكريم والاستماع لأعذب التلاوات ومواقيت الصلاة والأذكار وأسماء الله الحسنى.",
    footerBismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ",
    footerSanctuarySections: "أقسام الموقع",
    footerProjectAndLicense: "المشروع والترخيص",
    footerMitLicense: "ترخيص MIT مفتوح المصدر",
    footerFreeToUse: "متاح ومجاني لجميع المسلمين والباحثين حول العالم بدون إعلانات.",
    footerApiAttribution: "البيانات الدينية والقرآنية مدعومة رسمياً بواسطة UmmahAPI والحسابات الفلكية المعتمدة.",
    footerMadeBy: "صُنع بواسطة",
    footerForUmmah: "بكل حب للأمة الإسلامية",
    footerCopyright: "جميع الحقوق محفوظة لوجه الله تعالى طلباً للأجر والثواب.",
  },

  en: {
    // Navigation & Branding
    brandName: "Ruhani",
    brandTagline: "روحاني",
    navHome: "Home",
    navQuran: "Quran",
    navAudio: "Listen",
    navQibla: "Qibla",
    navHadith: "Hadith",
    navZikr: "Zikr & Duas",
    navNames: "99 Names",

    // Common UI
    search: "Search",
    cancel: "Cancel",
    close: "Close",
    done: "Done",
    copy: "Copy",
    copied: "Copied!",
    loading: "Loading...",
    filter: "Filter",
    defaultBadge: "Default",
    live: "Live",
    upcoming: "Upcoming",

    // Home Page
    homeHeroBadge: "Hijri Calendar",
    homeHeroTitle1: "Read, Listen, & Reflect on the",
    homeHeroTitleHighlight: "Divine Word",
    homeHeroSubtitle: "An elegant, serene Islamic sanctuary to read the Holy Quran in crystal calligraphy, stream tranquil recitations, track prayer times, and practice daily remembrance.",
    homeOpenQuran: "Open Holy Quran",
    homeListenQaris: "Listen to Qaris",
    homeQiblaFinder: "Qibla Finder",
    homeFeaturedRecitation: "Featured Recitation",
    homePlayRahman: "Play Surah Ar-Rahman",
    homePlayingRahman: "Playing Ar-Rahman",
    homeVerseOfDay: "Verse of the Day",
    homeHadithOfDay: "Hadith of the Day",
    homeListenToVerse: "Listen to Verse",
    homeReadTafsir: "Read Tafsir",
    homeQuickAccess: "Sanctuary Sections",
    homePrayerTimesTitle: "Accurate Prayer Times",

    // Quran Page
    quranTitle: "The Holy Quran",
    quranSubtitle: "Read and reflect on the divine revelation with verified interpretations",
    quranSurahsButton: "Surahs Index",
    quranModeVerses: "Verses Mode",
    quranModeMushaf: "Mushaf Mode",
    quranSearchPlaceholder: "Search Quran in Arabic or English translation...",
    quranFilterSurahs: "Filter 114 Surahs...",
    quranReciterLabel: "Reciter:",
    quranTranslationLabel: "Translation:",
    quranVersesCount: "verses",
    quranMeccan: "Meccan",
    quranMedinan: "Medinan",
    quranPlayVerse: "Listen to verse",
    quranTafsirBtn: "Read Tafsir commentary",
    quranCopyVerse: "Copy verse & translation",
    quranBookmarkVerse: "Bookmark verse",
    quranTafsirTitle: "Tafsir Commentary",
    quranTafsirLoading: "Loading tafsir...",
    quranPrevSurah: "Previous Surah",
    quranNextSurah: "Next Surah",
    quranAutoFollow: "Auto-Follow Reciter",
    quranAutoFollowActive: "Auto-Follow is active",
    quranPlayAllAyahs: "Play all verses continuously",
    playerContinuousPlay: "Continuous Surah Play",
    playerNextSurah: "Next Surah",
    playerPrevSurah: "Previous Surah",
    quranTajweedMode: "Tajweed Rules",
    quranTajweedLegend: "Tajweed Color Legend",
    quranWordMeaning: "Word Meaning",
    quranWordRoot: "Linguistic Root",
    quranWordTransliteration: "Transliteration",
    quranKhatmaTracker: "Khatma Tracker",
    playerSleepTimer: "Quiet Sleep Timer",
    sleepTimerOff: "Timer Off",
    sleepTimer15m: "15 minutes",
    sleepTimer30m: "30 minutes",
    sleepTimer45m: "45 minutes",
    sleepTimer60m: "60 minutes",
    sleepTimerEndSurah: "End of Current Surah",
    sleepTimerFading: "Gradual Fade-out...",
    offlineDownload: "Download for offline listening",
    offlineDownloaded: "Saved for offline",
    offlineDownloading: "Downloading...",
    offlineAvailable: "Available Offline",

    // Audio Page
    audioTitle: "Listen to the Quran",
    audioSubtitle: "Stream heart-touching, high-definition recitations from 15 world-renowned Qaris",
    audioDefaultReciterBadge: "Default Reciter: Sheikh Yasser Al-Dosari",
    audioNowStreaming: "Now Streaming",
    audioSelectReciter: "Select Sheikh / Reciter",
    audioSelectSurah: "Select Surah",
    audioSearchReciters: "Search 15 Sheikhs...",
    audioSearchSurahs: "Search 114 Surahs...",
    audioVolume: "Volume",
    audioSpeed: "Speed",

    // Qibla Page
    qiblaTitle: "Find the Direction of the Kaaba",
    qiblaSubtitle: "Accurate astronomical calculation to the Sacred Mosque in Makkah",
    qiblaFinderBadge: "Interactive Qibla Finder",
    qiblaDirectionToKaaba: "Qibla Direction",
    qiblaDistanceKm: "Distance to the Kaaba",
    qiblaDetectGPS: "Detect My Exact Location (GPS)",
    qiblaDetecting: "Detecting location...",
    qiblaDegrees: "degrees",
    qiblaCompassTip: "On supported phones and tablets, the compass automatically tracks your device orientation.",

    // Zikr & Duas Page
    zikrTitle: "Zikr & Authentic Duas",
    zikrSubtitle: "Daily remembrance, tactile digital Tasbeeh beads, and verified prophetic supplications",
    zikrDigitalTasbeeh: "Digital Tasbeeh",
    zikrTapToCount: "Tap to Count",
    zikrRound: "Round",
    zikrTarget: "Target:",
    zikrReset: "Reset",
    zikrSoundOn: "Mute bead click sound",
    zikrSoundOff: "Enable bead click sound",
    zikrMorningAdhkar: "Morning Adhkar",
    zikrEveningAdhkar: "Evening Adhkar",
    zikrAfterSalah: "After Salah",
    zikrBeforeSleep: "Before Sleep",
    zikrVirtue: "Prophetic Virtue",
    zikrRepeatTimes: "Repeat count",
    zikrMarkCompleted: "Mark as completed",

    // 99 Names of Allah
    namesTitle: "99 Names of Allah",
    namesSubtitle: "Learn the divine meanings of Asma ul Husna, listen to pronunciations, and track your memorization",
    namesSearchPlaceholder: "Search by English, Arabic, meaning, or number...",
    namesMemorizedProgress: "Memorized",
    namesListenPronounce: "Listen to pronunciation",
    namesMeaning: "Divine Meaning",
    namesExplanation: "Spiritual Explanation",
    namesCloseModal: "Close Details",

    // Hadith Page
    hadithTitle: "Hadith Collections",
    hadithSubtitle: "Browse canonical Hadith collections and verified prophetic traditions",
    hadithSearchPlaceholder: "Search authentic Hadith narrations...",
    hadithSelectBook: "Select Hadith Book",
    hadithGrade: "Grading:",
    hadithNarrator: "Narrator:",
    hadithPrevPage: "Previous Page",
    hadithNextPage: "Next Page",

    // Player Bar
    playerSkipBack: "Rewind 10s",
    playerSkipForward: "Forward 10s",
    playerPlay: "Play",
    playerPause: "Pause",

    // Footer & Attribution
    footerDescription: "An elegant, open-source Islamic sanctuary for reading the Holy Quran, streaming tranquil recitations, checking verified prayer times, finding the Qibla, and remembering Allah.",
    footerBismillah: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ — وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ",
    footerSanctuarySections: "Sanctuary Sections",
    footerProjectAndLicense: "Project & License",
    footerMitLicense: "MIT Open Source License",
    footerFreeToUse: "Free to inspect, study, use, and share for all Muslims and seekers worldwide without ads.",
    footerApiAttribution: "Islamic and Quranic data powered by UmmahAPI & verified astronomical calculations.",
    footerMadeBy: "Made by",
    footerForUmmah: "with love for the Ummah",
    footerCopyright: "All spiritual rewards dedicated to seeking the pleasure of Allah.",
  },
};

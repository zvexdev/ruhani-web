import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Headphones,
  ChevronRight,
  Play,
  Pause,
  Moon,
  ScrollText,
  Compass,
  Sparkles,
  Heart,
  Volume2,
  Copy,
  Check
} from "lucide-react";
import * as api from "../services/api";
import type { SurahMeta, Verse, Hadith } from "../types";
import PrayerTimesWidget from "../components/PrayerTimesWidget";
import { useAudio } from "../context/AudioContext";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { t, isArabic } = useLanguage();
  const [surahs, setSurahs] = useState<SurahMeta[]>([]);
  const [dailyVerse, setDailyVerse] = useState<Verse | null>(null);
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
  const [hijriDate, setHijriDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [copiedVerse, setCopiedVerse] = useState(false);
  const [copiedHadith, setCopiedHadith] = useState(false);

  const { playTrack, currentTrack, isPlaying } = useAudio();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [surahsData, randomAyah, randomHadith, hijri] = await Promise.all([
        api.getAllSurahs(),
        api.getRandomAyah(),
        api.getRandomHadith(),
        api.getTodayHijri(),
      ]);
      setSurahs(surahsData.slice(0, 10));
      setDailyVerse(randomAyah.verse);
      setDailyHadith(randomHadith);
      if (hijri?.hijri) {
        setHijriDate(`${hijri.hijri.day} ${hijri.hijri.month_name} ${hijri.hijri.year} AH`);
      }
    } catch (err) {
      console.warn("Home data loaded with fallbacks", err);
    } finally {
      setLoading(false);
    }
  }

  const handlePlayVerseAudio = () => {
    if (!dailyVerse) return;
    const audioUrl = dailyVerse.audio?.ayah_audio || "https://everyayah.com/data/Yasser_Ad-Dussary_128kbps/002255.mp3";
    playTrack({
      title: `${t.homeVerseOfDay} (${dailyVerse.verse_key})`,
      subtitle: isArabic ? "الشيخ ياسر الدوسري" : "Sheikh Yasser Al-Dosari",
      arabicTitle: "آية اليوم",
      src: audioUrl,
    });
  };

  const handlePlayRahman = () => {
    playTrack({
      title: "Surah Ar-Rahman (55)",
      subtitle: isArabic ? "الشيخ ياسر الدوسري" : "Sheikh Yasser Al-Dosari",
      arabicTitle: "سورة الرحمن",
      src: "https://server11.mp3quran.net/yasser/055.mp3",
    });
  };

  const copyToClipboard = (text: string, type: "verse" | "hadith") => {
    navigator.clipboard.writeText(text);
    if (type === "verse") {
      setCopiedVerse(true);
      setTimeout(() => setCopiedVerse(false), 2000);
    } else {
      setCopiedHadith(true);
      setTimeout(() => setCopiedHadith(false), 2000);
    }
  };

  const isRahmanPlaying = currentTrack?.title.includes("Ar-Rahman") && isPlaying;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[#1A5D3A] dark:border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium tracking-wide">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-32 sm:pb-28 space-y-12">
      {/* Hero Section */}
      <section className="pt-6 md:pt-12">
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Hero Left Content */}
          <motion.div
            className="md:col-span-7"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 dark:bg-emerald-950/70 text-[#1A5D3A] dark:text-emerald-300 text-xs font-semibold mb-4 border border-emerald-200 dark:border-emerald-800/40">
              <Moon className="w-3.5 h-3.5" />
              <span>{hijriDate || (isArabic ? "١٤ شوال ١٤٤٧ هـ" : "14 Shawwal 1447 AH")}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.25]">
              {t.homeHeroTitle1}{" "}
              <span className="text-[#1A5D3A] dark:text-emerald-400">{t.homeHeroTitleHighlight}</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-4 sm:mt-5 max-w-xl leading-relaxed">
              {t.homeHeroSubtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-6 sm:mt-8">
              <Link
                to="/quran"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#1A5D3A] dark:bg-emerald-600 text-white rounded-full font-semibold text-xs sm:text-sm hover:bg-[#13472d] dark:hover:bg-emerald-500 shadow-md shadow-emerald-900/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t.homeOpenQuran}</span>
              </Link>
              <Link
                to="/audio"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-gray-200 dark:border-slate-800 rounded-full font-semibold text-xs sm:text-sm hover:bg-gray-50 dark:hover:bg-slate-800 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
              >
                <Headphones className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.homeListenQaris}</span>
              </Link>
              <Link
                to="/qibla"
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/40 rounded-full font-semibold text-xs sm:text-sm hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
              >
                <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t.homeQiblaFinder}</span>
              </Link>
            </div>
          </motion.div>

          {/* Right Hero Graphic Card */}
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-emerald-900/20 dark:border-emerald-500/20 bg-gradient-to-br from-emerald-950 via-slate-900 to-[#0A2F1D] text-white p-6 md:p-8">
              {/* Arabesque background aura */}
              <div className="absolute top-0 right-0 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between h-full min-h-[280px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs uppercase tracking-widest text-amber-300/90 font-bold">
                      {isArabic ? "آية محكمة" : "Sacred Words"}
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <p className="font-['Amiri'] text-2xl md:text-3xl text-right leading-[2.2] text-amber-100">
                    أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
                  </p>
                  <p className="text-sm text-slate-300 italic mt-3 font-serif">
                    &ldquo;Unquestionably, by the remembrance of Allah hearts are assured.&rdquo;
                  </p>
                  <p className="text-xs text-emerald-400 font-semibold mt-2">
                    {isArabic ? "سورة الرعد (١٣:٢٨)" : "Surah Ar-Ra'd (13:28)"}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/10 mt-6 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{t.homeFeaturedRecitation}</span>
                  <button
                    onClick={handlePlayRahman}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-transform active:scale-95 shadow-md shadow-amber-400/20"
                  >
                    {isRahmanPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isRahmanPlaying ? t.homePlayingRahman : t.homePlayRahman}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Interactive Prayer Times Section */}
      <section>
        <PrayerTimesWidget />
      </section>

      {/* Daily Reflection Cards (Ayah & Hadith) */}
      <section className="grid md:grid-cols-2 gap-6">
        {/* Daily Verse */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#1A5D3A] dark:text-emerald-400 flex items-center justify-center">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A5D3A] dark:text-emerald-400">
                  {t.homeVerseOfDay}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayVerseAudio}
                  title={t.homeListenToVerse}
                  className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${dailyVerse?.arabic}\n\n"${dailyVerse?.translations?.sahih_international || Object.values(dailyVerse?.translations || {})[0] || ""}" — [Quran ${dailyVerse?.verse_key}]`,
                      "verse"
                    )
                  }
                  title={t.copy}
                  className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {copiedVerse ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {dailyVerse && (
              <div className="space-y-4">
                <p className="font-['Amiri'] text-2xl md:text-3xl text-right leading-[2.2] text-slate-900 dark:text-white">
                  {dailyVerse.arabic}
                </p>
                <p className="font-serif text-sm md:text-base text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  &ldquo;{dailyVerse.translations?.sahih_international || Object.values(dailyVerse.translations || {})[0] || ""}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              {dailyVerse?.verse_key}
            </span>
            <Link
              to={`/quran?surah=${dailyVerse?.verse_key.split(":")[0] || 1}`}
              className="text-xs font-semibold text-[#1A5D3A] dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              {isArabic ? "قراءة السورة كاملة" : "Read Full Surah"} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

        {/* Daily Hadith */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <ScrollText className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  {t.homeHadithOfDay}
                </span>
              </div>
              <button
                onClick={() =>
                  copyToClipboard(
                    `"${dailyHadith?.english}"\n\n— [${dailyHadith?.collection_name} ${dailyHadith?.hadithnumber}]`,
                    "hadith"
                  )
                }
                title={t.copy}
                className="p-2 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 text-slate-600 dark:text-slate-300 transition-colors"
              >
                {copiedHadith ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {dailyHadith && (
              <div className="space-y-4">
                {dailyHadith.arabic && (
                  <p className="font-['Amiri'] text-right text-lg md:text-xl text-slate-800 dark:text-slate-100 leading-relaxed">
                    {dailyHadith.arabic}
                  </p>
                )}
                <p className="font-serif text-sm md:text-base text-slate-600 dark:text-slate-300 italic leading-relaxed">
                  &ldquo;{dailyHadith.english}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                {dailyHadith?.collection_name} #{dailyHadith?.hadithnumber}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold">
                {dailyHadith?.grade || "Sahih"}
              </span>
            </div>
            <Link
              to="/hadith"
              className="text-xs font-semibold text-[#1A5D3A] dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              {isArabic ? "تصفح الأحاديث" : "Browse Hadith"} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Sanctuary Modules Quick Navigation */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.homeQuickAccess}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isArabic ? "أدوات مخصصة ومصادر موثوقة لتعزيز عبادتك اليومية" : "Dedicated tools and resources to enrich your daily worship"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { to: "/quran", label: t.navQuran, icon: BookOpen, desc: isArabic ? "١١٤ سورة وتفسير" : "114 Surahs & Tafsir", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50" },
            { to: "/audio", label: t.navAudio, icon: Headphones, desc: isArabic ? "١٥ قارئاً معتمداً" : "15 Global Qaris", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50" },
            { to: "/qibla", label: t.navQibla, icon: Compass, desc: isArabic ? "اتجاه الكعبة المشرفة" : "Kaaba Direction", color: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50" },
            { to: "/hadith", label: t.navHadith, icon: ScrollText, desc: isArabic ? "البخاري ومسلم والسنن" : "Bukhari & Muslim", color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50" },
            { to: "/zikr", label: t.navZikr, icon: Heart, desc: isArabic ? "تسبيح صوتي واهتزاز" : "Sound & Vibrations", color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50" },
            { to: "/names", label: t.navNames, icon: Sparkles, desc: isArabic ? "أسماء الله الحسنى" : "Asma ul Husna", color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/50" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group flex flex-col justify-between"
            >
              <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${item.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {item.label}
                </p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                  {item.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Surah List Preview */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isArabic ? "تصفح سور القرآن الكريم" : "Browse Surahs"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isArabic ? "وصول سريع لسور القرآن الكريم وقراءتها وتلاوتها" : "Quick access to opening and most recited chapters"}
            </p>
          </div>
          <Link
            to="/quran"
            className="text-xs font-semibold text-[#1A5D3A] dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
          >
            {isArabic ? "عرض جميع السور" : "View All"} <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden divide-y divide-gray-50 dark:divide-slate-800/60">
          {surahs.map((surah) => (
            <Link
              key={surah.number}
              to={`/quran?surah=${surah.number}`}
              className="flex items-center justify-between p-3.5 sm:p-4 hover:bg-emerald-50/50 dark:hover:bg-slate-800/60 transition-colors group gap-3"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/60 text-[#1A5D3A] dark:text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {surah.number}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {isArabic ? surah.name_arabic : surah.name_english}
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                    {surah.verses_count} {t.quranVersesCount} &middot;{" "}
                    {surah.revelation_place === "makkah" ? t.quranMeccan : t.quranMedinan}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-['Amiri'] text-lg sm:text-xl text-slate-900 dark:text-white block">
                  {surah.name_arabic}
                </span>
                <p className="text-[10px] sm:text-[11px] text-slate-400 hidden xs:block">{surah.name_translation}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

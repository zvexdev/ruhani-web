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
import FloatingSacredParticles from "../components/FloatingSacredParticles";
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
      type: "ayah",
      surahNumber: Number(dailyVerse.verse_key.split(":")[0]) || 2,
      ayahNumber: dailyVerse.ayah,
      reciterId: 1,
    });
  };

  const handlePlayRahman = () => {
    playTrack({
      title: "Surah Ar-Rahman (55)",
      subtitle: isArabic ? "الشيخ ياسر الدوسري" : "Sheikh Yasser Al-Dosari",
      arabicTitle: "سورة الرحمن",
      src: "https://server11.mp3quran.net/yasser/055.mp3",
      type: "surah",
      surahNumber: 55,
      reciterId: 1,
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
          <p className="text-xs text-neutral-400 font-medium tracking-wide">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-40 sm:pb-36 space-y-14">
      {/* Hero Section */}
      <section className="pt-4 sm:pt-8 md:pt-12 relative">
        <FloatingSacredParticles />
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-center relative z-10">
          {/* Hero Left Content */}
          <motion.div
            className="md:col-span-7"
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Hijri Calendar Date Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-[#1A5D3A] dark:text-emerald-300 text-xs font-semibold mb-5 border border-emerald-300/40 dark:border-emerald-700/40 shadow-sm">
              <Moon className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span>{hijriDate || (isArabic ? "١٤ شوال ١٤٤٧ هـ" : "14 Shawwal 1447 AH")}</span>
              <span className="w-1 h-1 rounded-full bg-emerald-500" />
              <span className="text-[11px] opacity-80">{isArabic ? "التقويم الهجري" : "Hijri Date"}</span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.25]">
              {t.homeHeroTitle1}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1A5D3A] via-emerald-600 to-emerald-500 dark:from-emerald-400 dark:via-emerald-300 dark:to-emerald-400">
                {t.homeHeroTitleHighlight}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 mt-4 sm:mt-5 max-w-xl leading-relaxed">
              {t.homeHeroSubtitle}
            </p>

            {/* Quick Sanctuary Pillars Badges */}
            <div className="flex flex-wrap items-center gap-2 mt-5 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="px-2.5 py-1 rounded-lg bg-gray-100/80 dark:bg-neutral-900 border border-gray-200/60 dark:border-neutral-800">
                {isArabic ? "١١٤ سورة وتفسير معتمد" : "114 Surahs & Tafsir"}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100/80 dark:bg-neutral-900 border border-gray-200/60 dark:border-neutral-800">
                {isArabic ? "١٥ قارئاً معتمداً" : "15 Global Reciters"}
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-gray-100/80 dark:bg-neutral-900 border border-gray-200/60 dark:border-neutral-800">
                {isArabic ? "مواقيت دقيقة فورية" : "Live Prayer Times"}
              </span>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-3.5 mt-7 sm:mt-8">
              <Link
                to="/quran"
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-[#1A5D3A] to-emerald-600 dark:from-emerald-600 dark:to-emerald-500 text-white rounded-full font-semibold text-xs sm:text-sm hover:from-[#13472d] hover:to-emerald-700 shadow-lg shadow-emerald-900/25 transition-all hover:scale-[1.02] active:scale-95"
              >
                <BookOpen className="w-4 h-4" />
                <span>{t.homeOpenQuran}</span>
              </Link>
              <Link
                to="/audio"
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 bg-white/90 dark:bg-neutral-900/90 text-neutral-900 dark:text-white border border-gray-200 dark:border-neutral-800 rounded-full font-semibold text-xs sm:text-sm hover:bg-gray-50 dark:hover:bg-neutral-800 shadow-sm transition-all hover:scale-[1.02] active:scale-95"
              >
                <Headphones className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{t.homeListenQaris}</span>
              </Link>
              <Link
                to="/qibla"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 bg-amber-50 dark:bg-neutral-900 text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-700/40 rounded-full font-semibold text-xs sm:text-sm hover:bg-amber-100 dark:hover:bg-neutral-800 transition-all hover:scale-[1.02] active:scale-95 shadow-sm"
              >
                <Compass className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>{t.homeQiblaFinder}</span>
              </Link>
            </div>
          </motion.div>

          {/* Right Hero Graphic Shrine Card */}
          <motion.div
            className="md:col-span-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 dark:border-amber-400/25 bg-gradient-to-br from-[#0a2316] via-[#04120b] to-black text-white p-6 md:p-8 manuscript-border">
              {/* Arabesque background aura */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col justify-between h-full min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isArabic ? "آية محكمة وقبس نور" : "Illuminated Sacred Words"}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20 font-bold">
                      {isArabic ? "سورة الرعد" : "Ar-Ra'd"}
                    </span>
                  </div>

                  {/* Quranic Ayah with illuminated brackets */}
                  <div className="my-4">
                    <p className="font-['Amiri'] text-2xl sm:text-3xl text-right leading-[2.3] text-amber-100 font-normal">
                      ﴿ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ ﴾
                    </p>
                    <p className="text-sm text-neutral-300 italic mt-3 font-serif leading-relaxed">
                      &ldquo;Unquestionably, by the remembrance of Allah hearts are assured.&rdquo;
                    </p>
                    <p className="text-xs text-emerald-400 font-semibold mt-2.5 flex items-center gap-1">
                      <span>{isArabic ? "سورة الرعد — الآية ٢٨" : "Surah Ar-Ra'd — Ayah 28"}</span>
                    </p>
                  </div>
                </div>

                {/* Audio Recitation Trigger with Animated Soundwave */}
                <div className="pt-5 border-t border-white/10 mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isRahmanPlaying ? (
                      <div className="flex items-end gap-1 h-5 px-1 text-amber-400">
                        <span className="w-1 bg-amber-400 rounded-full eq-bar-1" />
                        <span className="w-1 bg-amber-400 rounded-full eq-bar-2" />
                        <span className="w-1 bg-amber-400 rounded-full eq-bar-3" />
                        <span className="w-1 bg-amber-400 rounded-full eq-bar-4" />
                      </div>
                    ) : (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    )}
                    <span className="text-xs text-neutral-300 truncate max-w-[170px]">
                      {t.homeFeaturedRecitation}
                    </span>
                  </div>

                  <button
                    onClick={handlePlayRahman}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-neutral-950 font-bold text-xs transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-400/25 shrink-0"
                  >
                    {isRahmanPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
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
        {/* Daily Verse Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="spiritual-card spiritual-card-hover rounded-3xl p-6 md:p-8 shadow-sm relative flex flex-col justify-between manuscript-border"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-[#1A5D3A] dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A5D3A] dark:text-emerald-400">
                  {t.homeVerseOfDay}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayVerseAudio}
                  title={t.homeListenToVerse}
                  className="p-2 rounded-xl bg-emerald-50 dark:bg-neutral-900 hover:bg-emerald-100 dark:hover:bg-neutral-800 text-emerald-700 dark:text-emerald-300 transition-colors border border-emerald-200/60 dark:border-neutral-800"
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
                  className="p-2 rounded-xl bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors border border-gray-200/60 dark:border-neutral-800"
                >
                  {copiedVerse ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {dailyVerse && (
              <div className="space-y-4 my-2">
                <p className="font-['Amiri'] text-2xl md:text-3xl text-right leading-[2.3] text-neutral-900 dark:text-white">
                  ﴿ {dailyVerse.arabic} ﴾
                </p>
                <p className="font-serif text-sm md:text-base text-neutral-600 dark:text-neutral-300 italic leading-relaxed">
                  &ldquo;{dailyVerse.translations?.sahih_international || Object.values(dailyVerse.translations || {})[0] || ""}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/20">
              {dailyVerse?.verse_key}
            </span>
            <Link
              to={`/quran?surah=${dailyVerse?.verse_key.split(":")[0] || 1}`}
              className="text-xs font-semibold text-[#1A5D3A] dark:text-emerald-400 hover:underline flex items-center gap-1 group"
            >
              <span>{isArabic ? "قراءة السورة كاملة" : "Read Full Surah"}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Daily Hadith Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="spiritual-card spiritual-card-hover rounded-3xl p-6 md:p-8 shadow-sm relative flex flex-col justify-between manuscript-border"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <ScrollText className="w-4 h-4" />
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
                className="p-2 rounded-xl bg-gray-50 dark:bg-neutral-900 hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors border border-gray-200/60 dark:border-neutral-800"
              >
                {copiedHadith ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {dailyHadith && (
              <div className="space-y-4 my-2">
                {dailyHadith.arabic && (
                  <p className="font-['Amiri'] text-right text-lg md:text-xl text-neutral-900 dark:text-neutral-100 leading-relaxed font-normal">
                    «{dailyHadith.arabic}»
                  </p>
                )}
                <p className="font-serif text-sm md:text-base text-neutral-600 dark:text-neutral-300 italic leading-relaxed">
                  &ldquo;{dailyHadith.english}&rdquo;
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider bg-amber-50 dark:bg-neutral-900 px-2.5 py-1 rounded-md border border-amber-500/20">
                {dailyHadith?.collection_name} #{dailyHadith?.hadithnumber}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-500/20">
                {dailyHadith?.grade || "Sahih"}
              </span>
            </div>
            <Link
              to="/hadith"
              className="text-xs font-semibold text-[#1A5D3A] dark:text-emerald-400 hover:underline flex items-center gap-1 group"
            >
              <span>{isArabic ? "تصفح الأحاديث" : "Browse Hadith"}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Sanctuary Modules Bento Grid */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>{t.homeQuickAccess}</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {isArabic ? "أدوات مخصصة ومصادر موثوقة لتعزيز عبادتك اليومية" : "Dedicated tools and resources to enrich your daily worship"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {[
            { to: "/quran", label: t.navQuran, icon: BookOpen, desc: isArabic ? "١١٤ سورة وتفسير" : "114 Surahs & Tafsir", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/20" },
            { to: "/audio", label: t.navAudio, icon: Headphones, desc: isArabic ? "١٥ قارئاً معتمداً" : "15 Global Qaris", color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-neutral-900 border-amber-500/20" },
            { to: "/qibla", label: t.navQibla, icon: Compass, desc: isArabic ? "اتجاه الكعبة المشرفة" : "Kaaba Direction", color: "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-neutral-900 border-sky-500/20" },
            { to: "/hadith", label: t.navHadith, icon: ScrollText, desc: isArabic ? "البخاري ومسلم والسنن" : "Bukhari & Muslim", color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-neutral-900 border-indigo-500/20" },
            { to: "/zikr", label: t.navZikr, icon: Heart, desc: isArabic ? "تسبيح صوتي واهتزاز" : "Sound & Vibrations", color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-neutral-900 border-rose-500/20" },
            { to: "/names", label: t.navNames, icon: Sparkles, desc: isArabic ? "أسماء الله الحسنى" : "Asma ul Husna", color: "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-neutral-900 border-teal-500/20" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="spiritual-card spiritual-card-hover rounded-2xl p-4 sm:p-5 shadow-sm group flex flex-col justify-between"
            >
              <div className={`w-11 h-11 rounded-2xl ${item.color} border flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform shadow-sm`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {item.label}
                </p>
                <p className="text-[10px] sm:text-[11px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-1">
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
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>{isArabic ? "سور القرآن الكريم" : "Featured Surahs"}</span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {isArabic ? "وصول سريع لسور القرآن الكريم وقراءتها وتلاوتها" : "Quick access to opening and most recited chapters"}
            </p>
          </div>
          <Link
            to="/quran"
            className="text-xs font-semibold text-[#1A5D3A] dark:text-emerald-400 hover:underline flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-neutral-900 border border-emerald-500/20"
          >
            <span>{isArabic ? "عرض جميع السور (١١٤)" : "View All 114"}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="spiritual-card rounded-3xl shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-neutral-800">
          {surahs.map((surah) => (
            <Link
              key={surah.number}
              to={`/quran?surah=${surah.number}`}
              className="flex items-center justify-between p-4 sm:p-5 hover:bg-emerald-50/50 dark:hover:bg-neutral-900/60 transition-colors group gap-4"
            >
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                {/* Traditional 8-Point Star Number Badge */}
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-100/70 dark:bg-neutral-900 text-[#1A5D3A] dark:text-emerald-400 flex items-center justify-center text-xs font-extrabold shrink-0 border border-emerald-500/20 group-hover:scale-105 transition-transform shadow-sm">
                  {surah.number}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors truncate">
                    {isArabic ? surah.name_arabic : surah.name_english}
                  </p>
                  <p className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                    {surah.verses_count} {t.quranVersesCount} &middot;{" "}
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">
                      {surah.revelation_place === "makkah" ? (isArabic ? "مكيّة 🕋" : "Meccan 🕋") : (isArabic ? "مدنيّة 🕌" : "Medinan 🕌")}
                    </span>
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-['Amiri'] text-xl sm:text-2xl text-neutral-900 dark:text-white block group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  {surah.name_arabic}
                </span>
                <p className="text-[10px] sm:text-[11px] text-neutral-400 hidden xs:block">{surah.name_translation}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

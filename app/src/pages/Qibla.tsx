import { motion } from "framer-motion";
import { BookOpen, MapPin, Shield, Compass } from "lucide-react";
import QiblaCompass from "../components/QiblaCompass";
import FloatingSacredParticles from "../components/FloatingSacredParticles";
import { useLanguage } from "../context/LanguageContext";

export default function Qibla() {
  const { t, isArabic } = useLanguage();

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-40 sm:pb-36">
      {/* Page Header */}
      <div className="py-6 sm:py-8 text-center max-w-2xl mx-auto relative">
        <FloatingSacredParticles />
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-3">
          <Compass className="w-3.5 h-3.5 text-amber-500" />
          <span>{isArabic ? "الْقِبْلَةُ وَالْمَسْجِدُ الْحَرَامُ" : "Sacred Direction & Sanctuary"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          {t.qiblaTitle}
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 mt-2">
          {t.qiblaSubtitle}
        </p>
      </div>

      {/* Main Interactive Compass Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <QiblaCompass />
      </motion.div>

      {/* Educational & Quranic Context Cards */}
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="spiritual-card rounded-3xl p-6 sm:p-7 border transition-all hover:border-emerald-500/30 hover:shadow-lg text-start flex flex-col justify-between">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300/40 dark:border-emerald-800/40 text-[#1A5D3A] dark:text-emerald-300 flex items-center justify-center mb-4 shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white text-base mb-2">
              {isArabic ? "الأمر القرآني باستقبال القبلة" : "Quranic Command"}
            </h3>
            <p className="font-['Amiri'] text-right text-xl text-emerald-800 dark:text-emerald-300 mb-3 leading-relaxed">
              ﴿ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ ﴾
            </p>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-serif italic">
              {isArabic
                ? "«وَمِنْ حَيْثُ خَرَجْتَ فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ وَحَيْثُ مَا كُنتُمْ فَوَلُّوا وُجُوهَكُمْ شَطْرَهُ»"
                : "“Turn your face toward al-Masjid al-Haram. And wherever you [believers] are, turn your faces toward it [in prayer].”"}
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
            {isArabic ? "سورة البقرة (الآية ١٤٤)" : "Surah Al-Baqarah (2:144)"}
          </span>
        </div>

        <div className="spiritual-card rounded-3xl p-6 sm:p-7 border transition-all hover:border-amber-500/30 hover:shadow-lg text-start flex flex-col justify-between">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300/40 dark:border-amber-800/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-4 shadow-sm">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white text-base mb-2">
              {isArabic ? "البيت العتيق والكعبة المشرفة" : "The Sacred House"}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {isArabic
                ? "الكعبة المشرفة هي أول بيت وُضع للناس في بكة مباركاً وهدى للعالمين، بناها نبي الله إبراهيم وإسماعيل عليهما السلام في مكة المكرمة."
                : "The Kaaba is the first house of worship appointed for mankind, built by Prophet Ibrahim and his son Ismail (peace be upon them) in the valley of Makkah."}
            </p>
          </div>
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80 font-mono" dir="ltr">
            Coordinates: 21.4225° N, 39.8262° E
          </span>
        </div>

        <div className="spiritual-card rounded-3xl p-6 sm:p-7 border transition-all hover:border-emerald-500/30 hover:shadow-lg text-start flex flex-col justify-between">
          <div>
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300/40 dark:border-emerald-800/40 text-[#1A5D3A] dark:text-emerald-300 flex items-center justify-center mb-4 shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-neutral-900 dark:text-white text-base mb-2">
              {isArabic ? "إرشادات دقة البوصلة" : "Compass Tips"}
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              {isArabic
                ? "ضع جهازك بشكل أفقي ومسطح وابتعد عن الأجسام المعدنية أو الأغطية المغناطيسية لضمان دقة قراءة المستشعر."
                : "Keep your device flat and away from large metal objects, magnetic phone cases, and electronic equipment to ensure accurate magnetometer readings."}
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
            {isArabic ? "قم بمعايرة البوصلة بتحريك الهاتف على شكل رقم 8" : "Calibrate by moving in a figure-8"}
          </span>
        </div>
      </div>
    </div>
  );
}


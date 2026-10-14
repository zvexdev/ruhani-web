import { motion } from "framer-motion";
import { BookOpen, MapPin, Shield } from "lucide-react";
import QiblaCompass from "../components/QiblaCompass";

export default function Qibla() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-24">
      {/* Page Header */}
      <div className="py-6 md:py-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">
          Qibla Direction
        </h1>
        <p className="text-base text-gray-500 dark:text-gray-400 mt-2">
          Find the exact direction of the Holy Kaaba in Makkah from anywhere in the world.
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-[#1A5D3A] dark:text-emerald-400 flex items-center justify-center mb-4">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Quranic Command</h3>
          <p className="font-['Amiri'] text-right text-lg text-emerald-800 dark:text-emerald-300 mb-2">
            فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-serif italic">
            &ldquo;Turn your face toward al-Masjid al-Haram. And wherever you [believers] are, turn your faces toward it [in prayer].&rdquo;
          </p>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block mt-2">Surah Al-Baqarah (2:144)</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">The Sacred House</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            The Kaaba is the first house of worship appointed for mankind, built by Prophet Ibrahim (Abraham) and his son Ismail (peace be upon them) in the valley of Bakkah (Makkah).
          </p>
          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block mt-3">Coordinates: 21.4225° N, 39.8262° E</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Compass Tips</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
            Keep your device flat and away from large metal objects, magnetic phone cases, and electronic equipment to ensure accurate magnetometer readings.
          </p>
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block mt-3">Calibrate by moving in a figure-8</span>
        </div>
      </div>
    </div>
  );
}

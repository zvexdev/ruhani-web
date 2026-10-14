import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Headphones,
  ScrollText,
  Heart,
  Sparkles,
  Compass,
  Menu,
  X,
  Home,
  Sun,
  Moon,
  Scale,
  Languages
} from "lucide-react";
import { useState, useEffect } from "react";
import AudioPlayerBar from "./AudioPlayerBar";
import { useLanguage } from "../context/LanguageContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isArabic, toggleLanguage, t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("ruhani-theme") === "dark" ||
      (!("ruhani-theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  const [showLicenseModal, setShowLicenseModal] = useState(false);

  const navItems = [
    { path: "/", label: t.navHome, icon: Home },
    { path: "/quran", label: t.navQuran, icon: BookOpen },
    { path: "/audio", label: t.navAudio, icon: Headphones },
    { path: "/qibla", label: t.navQibla, icon: Compass },
    { path: "/hadith", label: t.navHadith, icon: ScrollText },
    { path: "/zikr", label: t.navZikr, icon: Heart },
    { path: "/names", label: t.navNames, icon: Sparkles },
  ];

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("ruhani-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("ruhani-theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Top Navigation Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#FDFCF7]/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-emerald-900/10 dark:border-emerald-500/10 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo / Sanctuary Brand */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1A5D3A] dark:bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 font-['Plus_Jakarta_Sans','Cairo']">
                {t.brandName}
                <span className="hidden sm:inline-block text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold tracking-normal font-['Amiri']">
                  {t.brandTagline}
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-1 rounded-full border border-gray-200/70 dark:border-slate-800 shadow-sm">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 bg-[#1A5D3A] dark:bg-emerald-600 rounded-full shadow-sm"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative flex items-center gap-1.5 z-10">
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Switcher (Arabic default, English toggle) */}
            <button
              onClick={toggleLanguage}
              title={isArabic ? "Switch to English" : "التبديل إلى العربية"}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border border-emerald-900/10 dark:border-emerald-500/20 bg-white/80 dark:bg-slate-900/80 hover:bg-emerald-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors text-xs font-bold shadow-sm"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isArabic ? "EN" : "عربي"}</span>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-full border border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#FDFCF7]/98 dark:bg-slate-950/98 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 overflow-hidden"
            >
              <nav className="px-4 py-4 space-y-1 max-w-[1440px] mx-auto">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-[#1A5D3A] text-white"
                          : "text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-900"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 flex-1">{children}</main>

      {/* Floating Audio Player */}
      <AudioPlayerBar />

      {/* Footer with UmmahAPI & Attribution */}
      <footer className="mt-auto border-t border-emerald-950/10 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50 backdrop-blur-md pt-12 pb-32 sm:pb-24 px-4 md:px-8">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Brand & Salutation */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#1A5D3A] dark:bg-emerald-600 flex items-center justify-center text-white">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">{t.brandName}</span>
                <span className="font-['Amiri'] text-emerald-700 dark:text-emerald-400 font-bold text-base">روحاني</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                {t.footerDescription}
              </p>
              <p className="font-['Amiri'] text-emerald-800 dark:text-emerald-300 text-base md:text-lg">
                {t.footerBismillah}
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                {t.footerSanctuarySections}
              </p>
              <ul className="space-y-2 text-sm">
                <li><Link to="/quran" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t.navQuran}</Link></li>
                <li><Link to="/audio" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t.navAudio}</Link></li>
                <li><Link to="/qibla" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t.navQibla}</Link></li>
                <li><Link to="/hadith" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t.navHadith}</Link></li>
                <li><Link to="/zikr" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t.navZikr}</Link></li>
                <li><Link to="/names" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">{t.navNames}</Link></li>
              </ul>
            </div>

            {/* Col 3: API Attribution & Open Source License */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                {t.footerProjectAndLicense}
              </p>
              <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <button
                  onClick={() => setShowLicenseModal(true)}
                  className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{t.footerMitLicense}</span>
                </button>

                {/* Explicit UmmahAPI Badge */}
                <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#1A5D3A] dark:text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>UmmahAPI</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {t.footerApiAttribution}
                  </p>
                </div>

                <p className="text-[11px] text-slate-400">
                  {t.footerFreeToUse}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar with "Made by zvex with love" */}
          <div className="pt-8 border-t border-gray-200/60 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <p className="flex items-center gap-1.5 font-medium">
              {t.footerMadeBy} <span className="text-[#1A5D3A] dark:text-emerald-400 font-bold">zvex</span> {t.footerForUmmah}{" "}
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            </p>

            <p>
              &copy; {new Date().getFullYear()} {t.brandName}. {t.footerCopyright}
            </p>
          </div>
        </div>
      </footer>

      {/* MIT License Modal */}
      <AnimatePresence>
        {showLicenseModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLicenseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">MIT License</h3>
                </div>
                <button
                  onClick={() => setShowLicenseModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="font-mono text-xs text-slate-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-950 p-4 rounded-xl leading-relaxed max-h-72 overflow-y-auto">
                <p className="font-semibold mb-2">Copyright (c) 2026 zvex</p>
                <p className="mb-2">
                  Permission is hereby granted, free of charge, to any person obtaining a copy
                  of this software and associated documentation files (the "Software"), to deal
                  in the Software without restriction, including without limitation the rights
                  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                  copies of the Software, and to permit persons to whom the Software is
                  furnished to do so, subject to the following conditions:
                </p>
                <p className="mb-2">
                  The above copyright notice and this permission notice shall be included in all
                  copies or substantial portions of the Software.
                </p>
                <p>
                  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
                </p>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowLicenseModal(false)}
                  className="px-5 py-2 bg-[#1A5D3A] text-white rounded-full text-xs font-semibold hover:bg-emerald-700 transition-colors"
                >
                  {t.done}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

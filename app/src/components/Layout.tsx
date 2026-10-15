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
  Languages,
  Github
} from "lucide-react";
import { useState, useEffect } from "react";
import AudioPlayerBar from "./AudioPlayerBar";
import { useLanguage } from "../context/LanguageContext";
import { useAudio } from "../context/AudioContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isArabic, toggleLanguage, t } = useLanguage();
  const { currentTrack } = useAudio();
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

  const [prevPathname, setPrevPathname] = useState(location.pathname);
  if (prevPathname !== location.pathname) {
    setPrevPathname(location.pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-black text-neutral-800 dark:text-neutral-100 flex flex-col transition-colors duration-300 overflow-x-hidden w-full">
      {/* Top Navigation Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-[#FDFCF7]/95 dark:bg-black/95 backdrop-blur-md border-b border-emerald-900/10 dark:border-white/10 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-3 sm:px-4 md:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-2">
          {/* Logo / Sanctuary Brand */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0 min-w-0">
            <img
              src="/logo.png"
              alt="Ruhani Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain drop-shadow-md group-hover:scale-105 transition-transform shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5 font-['Plus_Jakarta_Sans','Cairo'] truncate">
                {t.brandName}
                <span className="hidden md:inline-block text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold tracking-normal font-['Amiri'] shrink-0">
                  {t.brandTagline}
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-white/70 dark:bg-black/80 backdrop-blur-sm p-1 rounded-full border border-gray-200/70 dark:border-white/10 shadow-sm">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-white"
                      : "text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
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
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Language Switcher (Arabic default, English toggle) */}
            <button
              onClick={toggleLanguage}
              title={isArabic ? "Switch to English" : "التبديل إلى العربية"}
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-emerald-900/10 dark:border-emerald-500/20 bg-white/80 dark:bg-neutral-900/80 hover:bg-emerald-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors text-xs font-bold shadow-sm shrink-0"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{isArabic ? "EN" : "عربي"}</span>
            </button>

            {/* Dark / Light Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-1.5 sm:p-2 rounded-full border border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors shadow-sm shrink-0"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-neutral-700" />}
            </button>

            {/* GitHub Repository Link */}
            <a
              href="https://github.com/zvexdev/ruhani-web"
              target="_blank"
              rel="noopener noreferrer"
              title="GitHub Repository"
              className="hidden xs:flex p-1.5 sm:p-2 rounded-full border border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors shadow-sm items-center justify-center shrink-0"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-1.5 sm:p-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors shrink-0"
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
              className="lg:hidden bg-[#FDFCF7]/98 dark:bg-black/98 backdrop-blur-xl border-b border-gray-200 dark:border-neutral-800 overflow-hidden"
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
                          : "text-neutral-600 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-900"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <div className="pt-3 mt-2 border-t border-gray-200/60 dark:border-neutral-800/80 flex items-center justify-around text-xs">
                  <a
                    href="https://github.com/zvexdev/ruhani-web"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-900 font-semibold transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>GitHub</span>
                  </a>
                  <a
                    href="https://discord.gg/XTPc3QSM4B"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 py-2 px-3 rounded-lg text-[#5865F2] hover:bg-gray-100 dark:hover:bg-neutral-900 font-semibold transition-colors"
                  >
                    <span>Discord</span>
                  </a>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content Area with safe bottom padding to prevent player overlap */}
      <main className={`pt-20 flex-1 overflow-x-hidden ${currentTrack ? "pb-36 sm:pb-32" : "pb-16 sm:pb-12"}`}>{children}</main>

      {/* Floating Audio Player */}
      <AudioPlayerBar />

      {/* Footer with UmmahAPI & Attribution */}
      <footer className={`mt-auto border-t border-emerald-950/10 dark:border-white/10 bg-white/60 dark:bg-black backdrop-blur-md pt-12 px-4 md:px-8 ${currentTrack ? "pb-36 sm:pb-28" : "pb-16 sm:pb-12"}`}>
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            {/* Col 1: Brand & Salutation */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo.png"
                  alt="Ruhani"
                  className="w-8 h-8 object-contain drop-shadow-sm shrink-0"
                />
                <span className="font-bold text-lg text-neutral-900 dark:text-white">{t.brandName}</span>
                <span className="font-['Amiri'] text-emerald-700 dark:text-emerald-400 font-bold text-base">روحاني</span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md leading-relaxed">
                {t.footerDescription}
              </p>
              <p className="font-['Amiri'] text-emerald-800 dark:text-emerald-300 text-base md:text-lg">
                {t.footerBismillah}
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
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
              <p className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-3">
                {t.footerProjectAndLicense}
              </p>
              <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowLicenseModal(true)}
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.footerMitLicense}</span>
                  </button>

                  <a
                    href="https://github.com/zvexdev/ruhani-web"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-gray-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 transition-colors"
                  >
                    <Github className="w-3.5 h-3.5 text-neutral-900 dark:text-white" />
                    <span>GitHub</span>
                  </a>
                </div>

                {/* Explicit UmmahAPI Badge */}
                <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#1A5D3A] dark:text-emerald-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>UmmahAPI</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-300">
                    {t.footerApiAttribution}
                  </p>
                </div>

                <p className="text-[11px] text-neutral-400">
                  {t.footerFreeToUse}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar with "Made by zvex with love" & Discord Link */}
          <div className="pt-8 border-t border-gray-200/60 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <p className="flex items-center gap-1.5 font-medium">
              {t.footerMadeBy}{" "}
              <a
                href="https://discord.gg/XTPc3QSM4B"
                target="_blank"
                rel="noopener noreferrer"
                title="Join zvex Discord Server"
                className="text-[#1A5D3A] dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
              >
                zvex
              </a>{" "}
              {t.footerForUmmah}{" "}
              <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/zvexdev/ruhani-web"
                target="_blank"
                rel="noopener noreferrer"
                title="GitHub Repository"
                className="hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub</span>
              </a>
              <span>&bull;</span>
              <p>
                &copy; {new Date().getFullYear()} {t.brandName}. {t.footerCopyright}
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* MIT License Modal */}
      <AnimatePresence>
        {showLicenseModal && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLicenseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-black rounded-2xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-gray-200 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="font-bold text-lg text-neutral-900 dark:text-white">MIT License</h3>
                </div>
                <button
                  onClick={() => setShowLicenseModal(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-neutral-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="font-mono text-xs text-neutral-600 dark:text-neutral-300 bg-gray-50 dark:bg-neutral-950 p-4 rounded-xl leading-relaxed max-h-72 overflow-y-auto custom-scrollbar">
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

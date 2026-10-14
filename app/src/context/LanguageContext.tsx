import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, type Language, type Translations } from "../data/translations";

interface LanguageContextType {
  language: Language;
  isArabic: boolean;
  dir: "rtl" | "ltr";
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Arabic is the default language
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("ruhani-lang") as Language | null;
    return saved === "en" || saved === "ar" ? saved : "ar";
  });

  const isArabic = language === "ar";
  const dir = isArabic ? "rtl" : "ltr";
  const t = translations[language];

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    localStorage.setItem("ruhani-lang", language);
  }, [language, dir]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === "ar" ? "en" : "ar"));
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        isArabic,
        dir,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

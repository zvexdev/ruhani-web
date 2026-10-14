# Ruhani (روحاني) — Islamic Web Sanctuary

<div align="center">

<img src="app/public/logo.png" alt="Ruhani Logo" width="140" style="border-radius: 28px; box-shadow: 0 10px 30px rgba(26,93,58,0.3);" />

<br/><br/>

![Ruhani Banner](https://img.shields.io/badge/Language-Arabic%20(Default)%20%2F%20English-10b981?style=for-the-badge)
![Default Reciter](https://img.shields.io/badge/Default%20Qari-Sheikh%20Yasser%20Al--Dosari-amber?style=for-the-badge)
![Powered by](https://img.shields.io/badge/API-UmmahAPI-059669?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)

<br/>

**بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ**
<br/>
*«وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ»*

<br/>

An elegant, high-performance Islamic web application crafted with spiritual serenity, precision typography, and modern web architecture. Designed to provide a peaceful sanctuary for Muslims and seekers worldwide to read the Holy Quran, stream heart-stirring recitations from 15 esteemed Qaris, calculate exact astronomical prayer times, locate the Qibla, practice daily Adhkar with a tactile digital Tasbeeh, and reflect upon the 99 Beautiful Names of Allah.

<br/>

**Made with love by [zvex](https://github.com/zvexdev) for the Muslim Ummah.**

</div>

---

## 🌟 Key Highlights

- 🌐 **Arabic by Default with Instant English Toggle**: Native Right-to-Left (RTL) layout with authentic Arabic typography (`Cairo`, `Amiri`, `Scheherazade New`). Instant toggle to English with Left-to-Right (LTR) typography (`Plus Jakarta Sans`), persisted seamlessly in local storage.
- 📡 **Powered by UmmahAPI**: Backed by the official [UmmahAPI](https://ummahapi.com) for Islamic data, Quranic verses, prayer computations, and Hadith collections, paired with built-in offline fallbacks.
- 🎙️ **15 World-Class Qaris (Sheikh Yasser Al-Dosari by Default)**: High-definition streaming audio featuring Sheikh Yasser Al-Dosari as the sanctuary's default voice, along with 14 other world-renowned reciters.
- 📱 **Fluid Multi-Device Responsive Design**: Handcrafted for seamless usability across all screens — smartphones, tablets, laptops, and ultra-wide desktop monitors.
- 📴 **100% Offline-Resilient**: Complete offline datasets for all 114 Surahs, 99 Names of Allah, authentic Adhkar, and mathematical solar algorithms so you never see a broken screen.
- 🎨 **Serene Design System**: Supports both Midnight Oasis (Dark Mode) and Ivory Daylight (Light Mode) with subtle arabesque accents.

---

## 📖 Feature Tour

### 1. 📖 The Holy Quran (`/quran`)
- **Dual Reading Modes**:
  - **Mushaf Mode**: Continuous, authentic page reading format adorned with classic ayah end ornaments (`۝`).
  - **Verses Mode**: Detailed ayah-by-ayah breakdown featuring Arabic text, phonetic transliteration, multiple English translations (Sahih International, Pickthall, Yusuf Ali), one-click verse audio playback, and instant clipboard copy.
- **Dynamic Calligraphy Scaler**: Interactive slider to adjust Arabic font size from 20px to 44px for reading comfort.
- **Tafsir Drawer**: Instant access to verified interpretations (Tafsir as-Sa'di and Ibn Kathir) directly alongside any verse.
- **Instant Search**: Search the entire Quran in Arabic or English with instant match highlighting and navigation.
- **114 Surahs Directory**: Categorized by place of revelation (Makkah / Madinah) and ayah count.

### 2. 🎧 Quran Audio Streamer (`/audio`)
- **Default Reciter**: **Sheikh Yasser Al-Dosari** (إمام الحرم المكي الشريف) — renowned for soulful, emotive, and melodious recitation.
- **15 Distinguished Qaris**:
  1. **Sheikh Yasser Al-Dosari** *(Default)*
  2. **Sheikh Mishary Rashid Alafasy**
  3. **Sheikh Abdul Rahman Al-Sudais**
  4. **Sheikh Saud Al-Shuraim**
  5. **Sheikh Maher Al-Muaiqly**
  6. **Sheikh Abdul Basit Abdul Samad** (Murattal)
  7. **Sheikh Mahmoud Khalil Al-Husary**
  8. **Sheikh Mohamed Siddiq Al-Minshawi**
  9. **Sheikh Saad Al-Ghamdi**
  10. **Sheikh Abu Bakr Al-Shatri**
  11. **Sheikh Nasser Al-Qatami**
  12. **Sheikh Ali Al-Huthaify**
  13. **Sheikh Abdullah Basfar**
  14. **Sheikh Ahmad Al-Ajmy**
  15. **Sheikh Salah Al-Budair**
- **Persistent Bottom Player**: Global playback bar with continuous listening across all pages, 10s skip controls, playback speed selector (0.75x to 1.5x), and volume control.

### 3. ⏱️ Astronomical Prayer Times & Live Countdown
- **Solar Calculations**: Rigorous astronomical algorithms computing exact prayer times for Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha.
- **Live Countdown**: Real-time ticker counting down to the exact second of the upcoming prayer.
- **GPS & Worldwide Presets**: Instant one-click geolocation via browser GPS, plus instant presets for major Islamic hubs (Makkah, Madinah, Cairo, Jerusalem, Istanbul, London, New York, Kuala Lumpur).
- **Synthesized Athan Bell**: Gentle spiritual chime synthesized using the Web Audio API without requiring bulky external audio downloads.

### 4. 🧭 Interactive Qibla Compass (`/qibla`)
- **Kaaba Pointer**: Great-circle navigation targeting the Holy Kaaba in Makkah (21.4225° N, 39.8262° E).
- **Distance Calculation**: Exact distance to Makkah in kilometers.
- **Device Orientation API**: Automatically detects device heading on mobile devices with compass sensors.

### 5. 📿 Digital Tasbeeh & Authentic Adhkar (`/zikr`)
- **Tactile Bead Sound Design**: Web Audio API generates realistic wooden bead click acoustics on every tap.
- **Haptic Feedback**: Physical tactile vibration on mobile devices.
- **Target Counter**: Presets for 33, 99, 100, or custom goals with completed round tracking and celebration chimes.
- **Prophetic Adhkar**: Authentic supplications from Hisn al-Muslim for Morning, Evening, After Salah, and Before Sleep, complete with repeat counters, translations, and prophetic virtues.

### 6. ✨ 99 Names of Allah (`/names`)
- **Complete Dataset**: All 99 Asma ul Husna with verified Arabic calligraphy, transliteration, English meaning, and spiritual explanation.
- **Audio Pronunciation**: Speech synthesis pronunciation for each divine name.
- **Memorization Tracker**: Golden progress bar tracking memorized names, saved locally.

### 7. 📜 Hadith Collections (`/hadith`)
- **Major Compilations**: Sahih al-Bukhari, Sahih Muslim, Jami' at-Tirmidhi, Sunan Abi Dawud, Sunan an-Nasa'i, Sunan Ibn Majah, and 40 Hadith Nawawi.
- **Search & Filter**: Keyword search across thousands of authentic narrations.
- **Attribution & Grading**: Displays narrator chains, book volume, hadith number, and authenticity grade.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19 + TypeScript |
| **Build Tool & Bundler** | Vite 7 |
| **Styling & Design** | Tailwind CSS + CSS Variables |
| **Animation Library** | Framer Motion |
| **Icons** | Lucide React |
| **Audio Engine** | Web Audio API (Synthetic Sound Engine) + EveryAyah CDN |
| **Data API** | [UmmahAPI](https://ummahapi.com) |
| **Routing** | React Router DOM v7 |
| **Typography** | Google Fonts (*Cairo*, *Amiri*, *Plus Jakarta Sans*, *Inter*) |

---

## 📂 Repository Structure

```
ruhani-web/
├── app/
│   ├── src/
│   │   ├── components/            # UI components and interactive widgets
│   │   │   ├── Layout.tsx         # Header, footer, language switcher, mobile drawer
│   │   │   ├── AudioPlayerBar.tsx # Global audio player bar
│   │   │   ├── PrayerTimesWidget.tsx # Astronomical prayer calculations widget
│   │   │   └── QiblaCompass.tsx   # Interactive Qibla compass dial
│   │   ├── context/
│   │   │   ├── AudioContext.tsx   # Global audio streaming state
│   │   │   ├── LanguageContext.tsx# Bilingual i18n context (Arabic / English)
│   │   │   └── ThemeContext.tsx   # Dark / Light theme switcher
│   │   ├── data/
│   │   │   ├── translations.ts    # Comprehensive Arabic and English dictionary
│   │   │   ├── surahs.ts          # 114 Quran Surahs metadata
│   │   │   ├── reciters.ts        # 15 Qaris audio streams (Sheikh Yasser Al-Dosari default)
│   │   │   ├── namesOfAllah.ts    # 99 Names of Allah dataset
│   │   │   ├── adhkar.ts          # Verified morning/evening Adhkar
│   │   │   └── hadiths.ts         # Canonical Hadith collections
│   │   ├── lib/
│   │   │   ├── prayerTimes.ts     # Solar position equations and prayer times math
│   │   │   └── sound.ts           # Web Audio API procedural sound synthesizer
│   │   ├── pages/
│   │   │   ├── Home.tsx           # Home sanctuary landing page
│   │   │   ├── Quran.tsx          # Holy Quran reader (Mushaf and Verses mode)
│   │   │   ├── Audio.tsx          # Dedicated audio recitation player
│   │   │   ├── Qibla.tsx          # Qibla finder page
│   │   │   ├── Zikr.tsx           # Digital Tasbeeh & Adhkar
│   │   │   ├── Names.tsx          # 99 Names of Allah page
│   │   │   └── Hadith.tsx         # Hadith browser
│   │   ├── services/
│   │   │   └── api.ts             # UmmahAPI client with fallback handling
│   │   └── types/
│   │       └── index.ts           # TypeScript type definitions
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── LICENSE                        # MIT License
├── package.json                   # Root workspace scripts
└── README.md                      # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm`, `pnpm`, or `yarn`

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/zvexdev/ruhani-web.git
   cd ruhani-web
   ```

2. **Install dependencies:**
   ```bash
   cd app
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` (or `http://localhost:5173`).

4. **Build for production:**
   ```bash
   npm run build
   ```
   The production-ready artifacts will be generated in `app/dist`.

---

## 🌐 API Attribution

All Quranic data, prayer timings, and Hadith references are powered by:
- **[UmmahAPI](https://ummahapi.com)** — The developer-friendly, open API for Islamic applications.
- **[EveryAyah](https://everyayah.com)** — High-definition Quranic audio recitations.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🤲 Dedication & Continuous Charity

This project was built by **[zvex](https://github.com/zvexdev)** with love for the entire worldwide Muslim Ummah. All spiritual reward is dedicated solely to seeking the pleasure of Allah (*Subhanahu wa Ta'ala*).

*May Allah accept this effort, make it beneficial to all who use it, and count it as ongoing charity (Sadaqah Jariyah).*

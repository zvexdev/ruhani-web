# Ruhani (روحاني) — Modern Islamic Web Sanctuary

An elegant, fast, and feature-rich Islamic web application crafted with spiritual mindfulness and modern web technologies. Designed to provide a serene sanctuary for Muslims and seekers worldwide to read the Holy Quran, listen to renowned reciters, keep track of daily prayers, find the Qibla, practice daily Adhkar, and reflect on the 99 Names of Allah.

Made with love by **zvex** for the Ummah.

---

## ✨ Features

### 📖 Holy Quran Reader
- **114 Surahs Directory**: Browse chapters by revelation place (Makkah / Madinah) and verse count.
- **Two Reading Modes**:
  - **Verse by Verse**: Detailed view with Arabic text, transliteration, English translations (Sahih International, Pickthall, Yusuf Ali), one-click audio playback, and instant copy.
  - **Mushaf Reading Mode**: Continuous, authentic Quranic script with ayah end-ornaments (`۝`) for distraction-free reading.
- **Font Size Slider**: Seamlessly scale Arabic calligraphy between 20px and 44px for reading comfort.
- **Integrated Tafsir Drawer**: In-depth explanations and commentary (Tafsir as-Sa'di / Ibn Kathir) for any ayah with a single click.
- **Instant Quran Search**: Search any keyword across the entire Quran in Arabic or English with direct jump navigation.
- **Bookmarks**: Save verses to your personal bookmarks stored locally in your browser.

### ⏱️ Live Prayer Times & Athan
- **High-Precision Astronomical Calculations**: Mathematically accurate prayer timings for Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha.
- **Real-Time Countdown**: Live countdown clock ticking down to the exact second of the next upcoming prayer.
- **Global City Presets & GPS**: Instant presets for Makkah, Madinah, Cairo, Jerusalem, Istanbul, London, New York, Kuala Lumpur, and one-click GPS geolocation detection.
- **Synthesized Athan Bell**: Gentle spiritual prayer chime synthesized via the Web Audio API without needing external audio files.

### 🧭 Interactive Qibla Finder
- **Kaaba Direction Needle**: Real-time compass calculation pointing accurately to the Holy Kaaba in Makkah (21.4225° N, 39.8262° E).
- **Great-Circle Distance**: Displays exact distance to Makkah in kilometers.
- **Mobile Gyroscope Support**: Automatically aligns with your phone's magnetometer on mobile devices for true interactive pointing.

### 🎧 Global Audio Recitations & Floating Player
- **Renowned Qaris**: Stream recitations from Sheikh Mishary Rashid Alafasy, Abdul Rahman Al-Sudais, Abdul Basit Abdul Samad, Maher Al-Muaiqly, Saad Al-Ghamdi, and more.
- **Persistent Floating Player**: A sleek bottom player bar that stays active as you navigate across pages, with play/pause, seek scrubber, volume control, and active waveforms.
- **Verse Recitations**: Listen to individual ayahs or full chapter recitations on demand.

### 📿 Digital Tasbeeh & Verified Adhkar
- **Tactile Wooden Bead Clicks**: Web Audio API generates natural, satisfying tactile click feedback on each tap.
- **Haptic Vibration**: Physical vibration feedback on supported mobile devices.
- **Custom Goals & Rounds**: Quick presets for 33, 99, 100, or custom counts, with round tracking and completion chimes.
- **Verified Adhkar Checklist**: Authentic supplications from the Sunnah for Morning, Evening, After Salah, and Before Sleep with Arabic text, transliteration, translation, repeat counts, and prophetic virtues.
- **Daily Progress Bar**: Track your completed daily remembrance with saved browser state.

### ✨ 99 Names of Allah (Asma ul Husna)
- **Complete Verified Dataset**: All 99 divine names with verified Arabic calligraphy, English translations, and spiritual meanings.
- **Audio Pronunciation**: Built-in speech synthesis pronunciation for each divine name.
- **Memorization Tracker**: Track which names you have memorized with a golden progress bar and celebratory chime.
- **Filter & Search**: Search names by English, Arabic, meaning, or number.

### 📜 Hadith Collections
- **Major Hadith Books**: Sahih al-Bukhari, Sahih Muslim, Jami' at-Tirmidhi, Sunan Abi Dawud, Sunan an-Nasa'i, Sunan Ibn Majah, and the 40 Hadith of Imam an-Nawawi.
- **Searchable & Filterable**: Search authentic narrations by topic or browse by volume and page.
- **Bookmark & Copy**: Save your favorite hadiths and copy them with full attribution and grading.

### 🌙 Themes & Design System
- **Midnight Oasis (Dark Mode)**: Deep spiritual midnight slate and radiant emerald accents.
- **Ivory Daylight (Light Mode)**: Calming warm paper tones inspired by classic manuscripts.
- **Arabesque Aesthetics**: Subtle geometry patterns, celestial gold highlights, and typography powered by Google Fonts (*Plus Jakarta Sans*, *Amiri*, and *Scheherazade New*).
- **100% Offline-First Architecture**: Integrated fallback datasets for all 114 Surahs, 99 Names, authentic Adhkar, and mathematical prayer calculations ensure zero broken screens even without an internet connection.

---

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict type checking, zero `any` shortcuts)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + CSS Variables
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Audio**: Web Audio API (synthetic sound design) + EveryAyah / Quranicaudio CDN
- **Routing**: React Router DOM v7

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/zvexdev/ruhani-web.git
cd ruhani-web
```

2. Install dependencies:
```bash
cd app
npm install
```

3. Start the local development server:
```bash
npm run dev
```

4. Open your browser at `http://localhost:5173`.

### Production Build

To build the optimized static bundle:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 📁 Project Architecture

```
ruhani-web/
├── app/
│   ├── src/
│   │   ├── components/       # Reusable UI & Islamic widgets
│   │   │   ├── Layout.tsx    # Header, navigation, theme toggle, footer
│   │   │   ├── AudioPlayerBar.tsx # Persistent audio player
│   │   │   ├── PrayerTimesWidget.tsx # Live countdown & prayer card
│   │   │   └── QiblaCompass.tsx # Interactive compass dial & Kaaba pointer
│   │   ├── context/
│   │   │   └── AudioContext.tsx # Global audio state and player controls
│   │   ├── data/             # Offline datasets
│   │   │   ├── surahs.ts     # Complete 114 Surahs list
│   │   │   ├── namesOfAllah.ts # All 99 Names of Allah
│   │   │   ├── adhkar.ts     # Authentic Morning/Evening/Prayer Adhkar
│   │   │   └── hadiths.ts    # Curated canonical Hadith collection
│   │   ├── lib/              # Core utility modules
│   │   │   ├── sound.ts      # Web Audio API synthesizer for clicks & chimes
│   │   │   └── prayerTimes.ts # Astronomical solar equations & Qibla math
│   │   ├── pages/            # Application routes
│   │   │   ├── Home.tsx      # Landing sanctuary, daily ayah & hadith
│   │   │   ├── Quran.tsx     # Quran reader (Mushaf + Verse mode, Tafsir)
│   │   │   ├── Audio.tsx     # Full Surah audio streamer
│   │   │   ├── Qibla.tsx     # Dedicated Qibla finder page
│   │   │   ├── Hadith.tsx    # Hadith browser
│   │   │   ├── Zikr.tsx      # Digital Tasbeeh & Adhkar checklist
│   │   │   └── Names.tsx     # 99 Names of Allah & memorization journey
│   │   ├── services/
│   │   │   └── api.ts        # Resilient API client with offline fallbacks
│   │   └── types/
│   │       └── index.ts      # Strict TypeScript interfaces
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── LICENSE                   # MIT License
├── package.json              # Root project scripts
└── README.md
```

---

## 📜 License & Dedication

This project is open-source under the [MIT License](LICENSE).

Made by **zvex** with love for the worldwide Muslim Ummah. May Allah accept this work and make it a source of benefit and continuous charity (*Sadaqah Jariyah*).

import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from "react";
import { RECITERS_LIST, DEFAULT_RECITER, getSurahAudioUrl, getAyahAudioUrl } from "../data/reciters";
import { SURAHS_LIST } from "../data/surahs";
import { getCachedAudioUrl } from "../lib/audioCache";
import { type AyahTimestamp, findAyahSegmentAtMs, fetchSurahTimestamps } from "../lib/quranTimestamps";

export interface AudioTrack {
  title: string;
  subtitle?: string;
  arabicTitle?: string;
  src: string;
  type?: "surah" | "ayah" | "general";
  mode?: AudioPlaybackMode;
  surahNumber?: number;
  ayahNumber?: number;
  reciterId?: number;
  timestamps?: AyahTimestamp[];
  initialSeekTime?: number;
  onTrackEnded?: () => void;
}

export type AudioPlaybackMode = "SURAH" | "AYAH_FOLLOW";

export interface AyahSequenceParams {
  surahNumber: number;
  reciterId: number;
  startAyahIndex: number;
  verses: { ayah: number; verse_key: string }[];
  surahName?: string;
  reciterName?: string;
  arabicTitle?: string;
}

export type AudioLoopMode = "off" | "all" | "one";
export type SleepTimerOption = null | 15 | 30 | 45 | 60 | "endOfSurah";

interface AudioContextType {
  currentTrack: AudioTrack | null;
  activeVerseKey: string | null;
  playbackMode: AudioPlaybackMode;
  isPlaying: boolean;
  isLoadingTrack: boolean;
  hasPlaybackError: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  autoPlayNextSurah: boolean;
  loopMode: AudioLoopMode;
  sleepTimer: SleepTimerOption;
  sleepTimerSecondsRemaining: number | null;
  setActiveVerseKey: (key: string | null) => void;
  setPlaybackMode: (mode: AudioPlaybackMode) => void;
  playTrack: (track: AudioTrack) => void;
  playAyahSequence: (params: AyahSequenceParams) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skipSeconds: (delta: number) => void;
  setVolume: (vol: number) => void;
  setPlaybackRate: (rate: number) => void;
  setAutoPlayNextSurah: (val: boolean) => void;
  setLoopMode: (mode: AudioLoopMode) => void;
  setSleepTimer: (opt: SleepTimerOption) => void;
  playNextSurah: () => void;
  playPrevSurah: () => void;
  syncActiveSurah: (surahNumber: number, overrideReciterId?: number) => void;
  stop: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

// Background prefetch pipe helper to ensure seamless cache warming
const prefetchAyahAudio = (url: string) => {
  if (!url) return;
  try {
    fetch(url, { mode: "no-cors" }).catch(() => {});
    const preloader = new Audio();
    preloader.preload = "auto";
    preloader.src = url;
  } catch (e) {
    console.debug("Prefetch notice:", e);
  }
};

export function AudioProvider({ children }: { children: React.ReactNode }) {
  // Always default to Sheikh Yasser Al-Dosari (id: 1) or current URL/active surah
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(() => {
    try {
      // 1. Strict Active Surah Inheritance: Inspect window.location.search first
      let activeSurahNum: number | null = null;
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const paramSurah = Number(urlParams.get("surah"));
        if (paramSurah >= 1 && paramSurah <= 114) {
          activeSurahNum = paramSurah;
        }
      }

      // 2. Check localStorage
      const savedSurah = localStorage.getItem("ruhani-last-surah");
      const savedReciterId = localStorage.getItem("ruhani-favorite-reciter");
      const surahNum = activeSurahNum || (savedSurah ? Number(savedSurah) : 1);
      const reciterId = savedReciterId ? Number(savedReciterId) : DEFAULT_RECITER.id;
      const rMeta = RECITERS_LIST.find((r) => r.id === reciterId) || DEFAULT_RECITER;
      const sMeta = SURAHS_LIST.find((s) => s.number === surahNum);
      const audioUrl = getSurahAudioUrl(reciterId, surahNum);
      return {
        title: `Surah ${sMeta?.name_english || surahNum}`,
        subtitle: `Sheikh ${rMeta.name}`,
        arabicTitle: sMeta?.name_arabic,
        src: audioUrl,
        type: "surah",
        surahNumber: surahNum,
        reciterId: reciterId,
      };
    } catch (e) {
      console.debug("Failed restoring last audio track:", e);
      return null;
    }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [activeVerseKey, setActiveVerseKey] = useState<string | null>(null);

  // Sleep Timer state
  const [sleepTimer, setSleepTimerState] = useState<SleepTimerOption>(null);
  const [sleepTimerSecondsRemaining, setSleepTimerSecondsRemaining] = useState<number | null>(null);

  // Playback Rate state (Defaults to 1x)
  const [playbackRate, setPlaybackRateState] = useState(() => {
    try {
      const saved = localStorage.getItem("ruhani-playback-rate");
      return saved ? parseFloat(saved) : 1;
    } catch {
      return 1;
    }
  });

  // Volume state (Defaults to 0.85)
  const [volume, setVolumeState] = useState(() => {
    try {
      const saved = localStorage.getItem("ruhani-volume");
      return saved ? parseFloat(saved) : 0.85;
    } catch {
      return 0.85;
    }
  });

  // Continuous Surah Auto-Play (Defaults to true)
  const [autoPlayNextSurah, setAutoPlayNextSurahState] = useState(() => {
    try {
      return localStorage.getItem("ruhani-continuous-surah") !== "false";
    } catch {
      return true;
    }
  });

  // Loop Mode state
  const [loopMode, setLoopModeState] = useState<AudioLoopMode>(() => {
    try {
      const saved = localStorage.getItem("ruhani-loop-mode");
      if (saved === "off" || saved === "all" || saved === "one") return saved;
      return "all";
    } catch {
      return "all";
    }
  });

  // Explicit Playback Mode: 'SURAH' (Full continuous Surah listening) vs 'AYAH_FOLLOW' (Mushaf synchronized follow)
  const [playbackMode, setPlaybackModeState] = useState<AudioPlaybackMode>("SURAH");
  const playbackModeRef = useRef<AudioPlaybackMode>("SURAH");

  const setPlaybackMode = useCallback((mode: AudioPlaybackMode) => {
    setPlaybackModeState(mode);
    playbackModeRef.current = mode;
    if (mode === "SURAH") {
      ayahSequenceRef.current = null;
      activeVerseKeyRef.current = null;
      setActiveVerseKey(null);
      if (audioBRef.current) {
        audioBRef.current.pause();
        audioBRef.current.src = "";
      }
    }
  }, []);

  // Stable Refs for Audio Engine
  const audioARef = useRef<HTMLAudioElement | null>(null);
  const audioBRef = useRef<HTMLAudioElement | null>(null);
  const activeChannelRef = useRef<"A" | "B">("A");

  const playbackRateRef = useRef<number>(playbackRate);
  const volumeRef = useRef<number>(volume);
  const originalVolumeRef = useRef<number>(volume);

  const activeVerseKeyRef = useRef<string | null>(null);
  const currentTrackRef = useRef<AudioTrack | null>(currentTrack);
  const autoPlayNextRef = useRef<boolean>(autoPlayNextSurah);
  const loopModeRef = useRef<AudioLoopMode>(loopMode);
  const sleepTimerRef = useRef<SleepTimerOption>(null);

  // Method B Gapless Sequence state
  const ayahSequenceRef = useRef<AyahSequenceParams | null>(null);
  const currentAyahIndexRef = useRef<number>(0);
  const transitionedAyahIndexRef = useRef<number>(-1);

  // Callbacks refs for event listeners
  const playNextSurahRef = useRef<() => void>(() => {});

  // Sync state into refs
  useEffect(() => {
    playbackModeRef.current = playbackMode;
  }, [playbackMode]);

  useEffect(() => {
    activeVerseKeyRef.current = activeVerseKey;
  }, [activeVerseKey]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  useEffect(() => {
    autoPlayNextRef.current = autoPlayNextSurah;
  }, [autoPlayNextSurah]);

  useEffect(() => {
    loopModeRef.current = loopMode;
  }, [loopMode]);

  useEffect(() => {
    sleepTimerRef.current = sleepTimer;
  }, [sleepTimer]);

  useEffect(() => {
    volumeRef.current = volume;
    originalVolumeRef.current = volume;
  }, [volume]);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  // Helper to get active audio element
  const getActiveAudio = () => (activeChannelRef.current === "A" ? audioARef.current : audioBRef.current);

  // =========================================================================
  // AUDIO ELEMENT LIFECYCLE: Initialized once with [] to prevent any recreation
  // =========================================================================
  useEffect(() => {
    const audioA = new Audio();
    audioA.preload = "auto";
    const audioB = new Audio();
    audioB.preload = "auto";

    audioARef.current = audioA;
    audioBRef.current = audioB;

    const executeGaplessTransition = (channel: "A" | "B") => {
      if (activeChannelRef.current !== channel) return;
      if (transitionedAyahIndexRef.current === currentAyahIndexRef.current) return;
      transitionedAyahIndexRef.current = currentAyahIndexRef.current;

      const oldAudio = channel === "A" ? audioA : audioB;
      oldAudio.pause();

      const seq = ayahSequenceRef.current;
      if (playbackModeRef.current === "AYAH_FOLLOW" && seq && Array.isArray(seq.verses)) {
        const nextIdx = currentAyahIndexRef.current + 1;
        if (nextIdx < seq.verses.length) {
          const nextVerse = seq.verses[nextIdx];
          const nextKey = `${seq.surahNumber}:${nextVerse.ayah}`;
          currentAyahIndexRef.current = nextIdx;

          // Swap active channel to standby instantaneously
          const nextChannel = channel === "A" ? "B" : "A";
          activeChannelRef.current = nextChannel;
          const newActive = nextChannel === "A" ? audioA : audioB;
          const newStandby = nextChannel === "A" ? audioB : audioA;

          // Zero-latency UI handshake: Update active verse key synchronously so highlighting snaps in sync
          activeVerseKeyRef.current = nextKey;
          setActiveVerseKey(nextKey);

          // Zero-latency playback: Immediately call .play() on already buffered standby audio element
          newActive.playbackRate = playbackRateRef.current;
          newActive.volume = volumeRef.current;
          const playPromise = newActive.play();
          if (playPromise !== undefined) {
            playPromise.catch((err) => {
              if (err?.name === "AbortError") return;
              console.warn("Gapless transition play notice:", err);
            });
          }
          setIsPlaying(true);
          setCurrentTime(0);
          setDuration(newActive.duration || 0);

          // Update track metadata
          setCurrentTrack({
            title: `${seq.surahName || "Surah"} — Ayah ${nextVerse.ayah}`,
            subtitle: seq.reciterName,
            arabicTitle: `${seq.arabicTitle || ""} : ${nextVerse.ayah}`,
            src: newActive.src,
            type: "ayah",
            mode: "AYAH_FOLLOW",
            surahNumber: seq.surahNumber,
            ayahNumber: nextVerse.ayah,
            reciterId: seq.reciterId,
          });

          // Ultra-Early Preload Buffer: Immediately prime Ayah N+2 into the secondary standby channel
          if (nextIdx + 1 < seq.verses.length) {
            const futureVerse = seq.verses[nextIdx + 1];
            const futureUrl = getAyahAudioUrl(seq.reciterId, seq.surahNumber, futureVerse.ayah);
            newStandby.src = futureUrl;
            newStandby.preload = "auto";
            newStandby.playbackRate = playbackRateRef.current;
            newStandby.volume = volumeRef.current;
            newStandby.load();

            // Background Pre-fetch Pipe: Warm up Ayah N+3 in browser cache
            if (nextIdx + 2 < seq.verses.length) {
              const pipeVerse = seq.verses[nextIdx + 2];
              prefetchAyahAudio(getAyahAudioUrl(seq.reciterId, seq.surahNumber, pipeVerse.ayah));
            }
          } else {
            newStandby.src = "";
          }
        } else {
          // Surah finished
          ayahSequenceRef.current = null;
          if (autoPlayNextRef.current || loopModeRef.current === "all") {
            playNextSurahRef.current?.();
            return;
          }
          setIsPlaying(false);
        }
      }
    };

    const bindChannelEvents = (audio: HTMLAudioElement, channel: "A" | "B") => {
      const handleTimeUpdate = () => {
        if (activeChannelRef.current !== channel) return;
        setCurrentTime(audio.currentTime);

        const track = currentTrackRef.current;
        // Method A: Exact API Timestamps sync
        if (track?.timestamps && track.timestamps.length > 0) {
          const currentMs = audio.currentTime * 1000;
          const segment = findAyahSegmentAtMs(track.timestamps, currentMs);
          if (segment && segment.verse_key !== activeVerseKeyRef.current) {
            activeVerseKeyRef.current = segment.verse_key;
            setActiveVerseKey(segment.verse_key);
          }
        }

        // Method B: Ultra-Early Preload Buffer & Near-Ended Handshake (< 50ms)
        if (playbackModeRef.current === "AYAH_FOLLOW" && ayahSequenceRef.current) {
          const seq = ayahSequenceRef.current;
          const nextIdx = currentAyahIndexRef.current + 1;
          if (nextIdx < seq.verses.length) {
            const standby = channel === "A" ? audioB : audioA;
            const nextVerse = seq.verses[nextIdx];
            const nextUrl = getAyahAudioUrl(seq.reciterId, seq.surahNumber, nextVerse.ayah);

            // 1. Ultra-Early Preload Buffer:
            // Ensure standby has loaded nextUrl as soon as duration is known or currentTime >= duration - 1.5
            if (
              standby.src !== nextUrl &&
              (Number.isFinite(audio.duration) || audio.currentTime >= (audio.duration || 0) - 1.5)
            ) {
              standby.src = nextUrl;
              standby.preload = "auto";
              standby.playbackRate = playbackRateRef.current;
              standby.volume = volumeRef.current;
              standby.load();
            }

            // 2. Zero-Latency Handshake: Trigger within 50ms of termination
            if (
              Number.isFinite(audio.duration) &&
              audio.duration > 0.3 &&
              audio.currentTime >= audio.duration - 0.05
            ) {
              executeGaplessTransition(channel);
            }
          }
        }
      };

      const handleDurationChange = () => {
        if (activeChannelRef.current === channel) {
          setDuration(audio.duration || 0);
        }
      };

      const handleWaiting = () => {
        if (activeChannelRef.current === channel) {
          setIsLoadingTrack(true);
        }
      };

      const handleCanPlay = () => {
        if (activeChannelRef.current === channel) {
          setIsLoadingTrack(false);
        }
      };

      const handleEnded = () => {
        if (activeChannelRef.current !== channel) return;

        // 1. Sleep Timer "End of Surah" check
        if (sleepTimerRef.current === "endOfSurah") {
          setSleepTimerState(null);
          sleepTimerRef.current = null;
          setIsPlaying(false);
          return;
        }

        // 2. Ayah Follow Mode: Gapless Sequence Transition (Ayah N -> Ayah N+1 in 0ms)
        if (playbackModeRef.current === "AYAH_FOLLOW" && ayahSequenceRef.current) {
          executeGaplessTransition(channel);
          return;
        }

        // 3. Track-specific onTrackEnded callback
        const track = currentTrackRef.current;
        if (typeof track?.onTrackEnded === "function") {
          track.onTrackEnded();
          return;
        }

        // 4. Single-track repeat mode
        if (loopModeRef.current === "one") {
          audio.currentTime = 0;
          audio.play().catch(() => {});
          return;
        }

        // 5. Continuous Surah auto-play
        if (track?.surahNumber && (autoPlayNextRef.current || loopModeRef.current === "all")) {
          playNextSurahRef.current?.();
          return;
        }

        setIsPlaying(false);
      };

      const handleError = (e: Event) => {
        if (activeChannelRef.current === channel) {
          console.warn("Audio channel stream notice:", e);
          setIsPlaying(false);
          setIsLoadingTrack(false);
          setHasPlaybackError(true);
        }
      };

      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("durationchange", handleDurationChange);
      audio.addEventListener("waiting", handleWaiting);
      audio.addEventListener("canplay", handleCanPlay);
      audio.addEventListener("ended", handleEnded);
      audio.addEventListener("error", handleError);

      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("durationchange", handleDurationChange);
        audio.removeEventListener("waiting", handleWaiting);
        audio.removeEventListener("canplay", handleCanPlay);
        audio.removeEventListener("ended", handleEnded);
        audio.removeEventListener("error", handleError);
        audio.pause();
        audio.src = "";
      };
    };

    const cleanupA = bindChannelEvents(audioA, "A");
    const cleanupB = bindChannelEvents(audioB, "B");

    return () => {
      cleanupA();
      cleanupB();
    };
  }, []); // STRICTLY EMPTY ARRAY: Never destroy audio instances on state changes

  // =========================================================================
  // SLEEP TIMER COUNTDOWN & VOLUME FADE-OUT
  // =========================================================================
  useEffect(() => {
    if (sleepTimerSecondsRemaining === null || sleepTimerSecondsRemaining <= 0 || !isPlaying) return;

    const interval = setInterval(() => {
      setSleepTimerSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          const active = getActiveAudio();
          if (active) {
            active.pause();
            active.volume = originalVolumeRef.current;
          }
          setIsPlaying(false);
          setSleepTimerState(null);
          sleepTimerRef.current = null;
          return null;
        }

        const next = prev - 1;
        if (next <= 60) {
          const active = getActiveAudio();
          if (active) {
            const factor = Math.max(0.05, next / 60);
            active.volume = originalVolumeRef.current * factor;
          }
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerSecondsRemaining, isPlaying]);

  // =========================================================================
  // PLAYBACK RATE TOGGLE: Zero audio destruction, instant mutation in place
  // =========================================================================
  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    playbackRateRef.current = rate;
    try {
      localStorage.setItem("ruhani-playback-rate", String(rate));
    } catch (e) {
      console.debug("Failed saving playbackRate:", e);
    }
    // Directly mutate active & standby audio without pausing or recreating
    if (audioARef.current) {
      audioARef.current.playbackRate = rate;
    }
    if (audioBRef.current) {
      audioBRef.current.playbackRate = rate;
    }
  }, []);

  // =========================================================================
  // VOLUME CONTROL
  // =========================================================================
  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    originalVolumeRef.current = clamped;
    try {
      localStorage.setItem("ruhani-volume", String(clamped));
    } catch (e) {
      console.debug("Failed saving volume:", e);
    }
    if (audioARef.current) {
      audioARef.current.volume = clamped;
    }
    if (audioBRef.current) {
      audioBRef.current.volume = clamped;
    }
  }, []);

  // =========================================================================
  // SETTINGS & LOOP MODES
  // =========================================================================
  const setAutoPlayNextSurah = useCallback((val: boolean) => {
    setAutoPlayNextSurahState(val);
    autoPlayNextRef.current = val;
    try {
      localStorage.setItem("ruhani-continuous-surah", String(val));
    } catch (e) {
      console.debug("Failed saving autoPlayNextSurah:", e);
    }
  }, []);

  const setLoopMode = useCallback((mode: AudioLoopMode) => {
    setLoopModeState(mode);
    loopModeRef.current = mode;
    try {
      localStorage.setItem("ruhani-loop-mode", mode);
    } catch (e) {
      console.debug("Failed saving loopMode:", e);
    }
  }, []);

  const setSleepTimer = useCallback((opt: SleepTimerOption) => {
    setSleepTimerState(opt);
    sleepTimerRef.current = opt;
    if (typeof opt === "number") {
      setSleepTimerSecondsRemaining(opt * 60);
    } else {
      setSleepTimerSecondsRemaining(null);
    }
    const active = getActiveAudio();
    if (active) {
      active.volume = originalVolumeRef.current;
    }
  }, []);

  // =========================================================================
  // METHOD A: Verified Single Continuous Stream + API Timestamps
  // =========================================================================
  const playTrack = useCallback(async (track: AudioTrack) => {
    const determinedMode: AudioPlaybackMode =
      track.mode ||
      (track.timestamps && track.timestamps.length > 0
        ? "AYAH_FOLLOW"
        : track.type === "ayah"
        ? "AYAH_FOLLOW"
        : "SURAH");

    setPlaybackModeState(determinedMode);
    playbackModeRef.current = determinedMode;

    if (determinedMode === "SURAH") {
      ayahSequenceRef.current = null; // Clear Method B sequence mode completely
      activeVerseKeyRef.current = null;
      setActiveVerseKey(null);
    }

    activeChannelRef.current = "A";
    const activeAudio = audioARef.current;
    const standbyAudio = audioBRef.current;
    if (!activeAudio) return;

    if (standbyAudio) {
      standbyAudio.pause();
      standbyAudio.src = "";
    }

    setHasPlaybackError(false);
    setIsLoadingTrack(true);
    setCurrentTrack({ ...track, mode: determinedMode });
    currentTrackRef.current = { ...track, mode: determinedMode };

    if (track.timestamps && track.timestamps.length > 0) {
      const seekMs = (track.initialSeekTime || 0) * 1000;
      const segment = findAyahSegmentAtMs(track.timestamps, seekMs);
      const key = segment?.verse_key || track.timestamps[0].verse_key;
      activeVerseKeyRef.current = key;
      setActiveVerseKey(key);
    } else if (track.type === "ayah" && track.surahNumber && track.ayahNumber) {
      const key = `${track.surahNumber}:${track.ayahNumber}`;
      activeVerseKeyRef.current = key;
      setActiveVerseKey(key);
    } else {
      activeVerseKeyRef.current = null;
      setActiveVerseKey(null);
    }

    if (track.surahNumber) {
      try {
        localStorage.setItem("ruhani-last-surah", String(track.surahNumber));
        if (track.ayahNumber) {
          localStorage.setItem("ruhani-last-ayah", String(track.ayahNumber));
        }
      } catch (e) {
        console.debug("Failed saving last position:", e);
      }
    }

    const resolvedSrc = await getCachedAudioUrl(track.src);
    activeAudio.src = resolvedSrc;
    activeAudio.playbackRate = playbackRateRef.current;
    activeAudio.volume = volumeRef.current;
    activeAudio.load();

    if (track.initialSeekTime !== undefined && track.initialSeekTime > 0) {
      activeAudio.currentTime = track.initialSeekTime;
      setCurrentTime(track.initialSeekTime);
    }

    activeAudio
      .play()
      .then(() => {
        if (track.initialSeekTime !== undefined && track.initialSeekTime > 0 && activeAudio) {
          activeAudio.currentTime = track.initialSeekTime;
        }
        setIsPlaying(true);
        setIsLoadingTrack(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") {
          setIsLoadingTrack(false);
          return; // Expected browser interruption when new track is loaded
        }
        console.warn("Playback stream/autoplay notice:", err);
        setIsPlaying(false);
        setIsLoadingTrack(false);
        setHasPlaybackError(true);
      });
  }, []);

  // =========================================================================
  // METHOD B: Dual-Buffer Ping-Pong Gapless Ayah Sequence (e.g. Yasser Al-Dosari)
  // =========================================================================
  const playAyahSequence = useCallback((params: AyahSequenceParams) => {
    setPlaybackModeState("AYAH_FOLLOW");
    playbackModeRef.current = "AYAH_FOLLOW";
    ayahSequenceRef.current = params;
    currentAyahIndexRef.current = params.startAyahIndex;

    const currentVerse = params.verses[params.startAyahIndex];
    if (!currentVerse) return;

    const currentUrl = getAyahAudioUrl(params.reciterId, params.surahNumber, currentVerse.ayah);
    const verseKey = `${params.surahNumber}:${currentVerse.ayah}`;

    activeChannelRef.current = "A";
    const activeAudio = audioARef.current;
    const standbyAudio = audioBRef.current;
    if (!activeAudio || !standbyAudio) return;
    standbyAudio.pause();

    setHasPlaybackError(false);
    setIsLoadingTrack(true);

    // 1. Play active Ayah N
    activeAudio.src = currentUrl;
    activeAudio.playbackRate = playbackRateRef.current;
    activeAudio.volume = volumeRef.current;
    activeAudio.load();
    activeAudio
      .play()
      .then(() => {
        setIsPlaying(true);
        setIsLoadingTrack(false);
      })
      .catch((err) => {
        if (err?.name === "AbortError") {
          setIsLoadingTrack(false);
          return; // Expected browser interruption
        }
        console.warn("Ayah playback notice:", err);
        setIsPlaying(false);
        setIsLoadingTrack(false);
        setHasPlaybackError(true);
      });

    // Reset transition marker for new sequence
    transitionedAyahIndexRef.current = -1;

    // 2. Preload next Ayah N+1 into standby audio buffer
    if (params.startAyahIndex + 1 < params.verses.length) {
      const nextVerse = params.verses[params.startAyahIndex + 1];
      const nextUrl = getAyahAudioUrl(params.reciterId, params.surahNumber, nextVerse.ayah);
      standbyAudio.src = nextUrl;
      standbyAudio.preload = "auto";
      standbyAudio.playbackRate = playbackRateRef.current;
      standbyAudio.volume = volumeRef.current;
      standbyAudio.load();

      // Background Pre-fetch Pipe: Warm up Ayah N+2 in browser cache
      if (params.startAyahIndex + 2 < params.verses.length) {
        const pipeVerse = params.verses[params.startAyahIndex + 2];
        prefetchAyahAudio(getAyahAudioUrl(params.reciterId, params.surahNumber, pipeVerse.ayah));
      }
    } else {
      standbyAudio.src = "";
    }

    activeVerseKeyRef.current = verseKey;
    setActiveVerseKey(verseKey);

    setCurrentTrack({
      title: `${params.surahName || "Surah"} — Ayah ${currentVerse.ayah}`,
      subtitle: params.reciterName,
      arabicTitle: `${params.arabicTitle || ""} : ${currentVerse.ayah}`,
      src: currentUrl,
      type: "ayah",
      mode: "AYAH_FOLLOW",
      surahNumber: params.surahNumber,
      ayahNumber: currentVerse.ayah,
      reciterId: params.reciterId,
    });

    try {
      localStorage.setItem("ruhani-last-surah", String(params.surahNumber));
      localStorage.setItem("ruhani-last-ayah", String(currentVerse.ayah));
    } catch (e) {
      console.debug("Failed saving last position:", e);
    }
  }, []);

  // =========================================================================
  // CONTROLS: Toggle Play, Seek, Skip, Stop
  // =========================================================================
  const togglePlay = useCallback(() => {
    const active = getActiveAudio();
    if (!active) return;

    if (isPlaying) {
      active.pause();
      setIsPlaying(false);
    } else {
      if (!active.src && currentTrackRef.current) {
        let track = currentTrackRef.current;
        // Strict Active Surah Inheritance: URL parameter takes priority if present
        if (typeof window !== "undefined") {
          const urlParams = new URLSearchParams(window.location.search);
          const urlSurah = Number(urlParams.get("surah"));
          if (urlSurah >= 1 && urlSurah <= 114 && track.surahNumber !== urlSurah) {
            const sMeta = SURAHS_LIST.find((s) => s.number === urlSurah);
            const reciterId = track.reciterId || DEFAULT_RECITER.id;
            const rMeta = RECITERS_LIST.find((r) => r.id === reciterId) || DEFAULT_RECITER;
            track = {
              ...track,
              surahNumber: urlSurah,
              title: `Surah ${sMeta?.name_english || urlSurah}`,
              subtitle: `Sheikh ${rMeta.name}`,
              arabicTitle: sMeta?.name_arabic,
              src: getSurahAudioUrl(reciterId, urlSurah),
            };
            currentTrackRef.current = track;
            setCurrentTrack(track);
          }
        }

        const rMeta = RECITERS_LIST.find((r) => r.id === track.reciterId) || DEFAULT_RECITER;
        if (playbackModeRef.current === "AYAH_FOLLOW" && !rMeta.quranComId && track.surahNumber) {
          const sMeta = SURAHS_LIST.find((s) => s.number === track.surahNumber);
          const totalVerses = sMeta?.verses_count || 7;
          const verses = Array.from({ length: totalVerses }, (_, i) => ({
            ayah: i + 1,
            verse_key: `${track.surahNumber}:${i + 1}`,
          }));
          playAyahSequence({
            surahNumber: track.surahNumber,
            reciterId: rMeta.id,
            startAyahIndex: track.ayahNumber ? track.ayahNumber - 1 : 0,
            verses,
            surahName: sMeta?.name_english || `Surah ${track.surahNumber}`,
            reciterName: `Sheikh ${rMeta.name}`,
            arabicTitle: sMeta?.name_arabic,
          });
          return;
        }
        playTrack(track);
        return;
      }
      active.playbackRate = playbackRateRef.current;
      active
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasPlaybackError(false);
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          console.warn("Playback toggle error:", err);
          if (currentTrackRef.current) {
            playTrack(currentTrackRef.current);
          }
        });
    }
  }, [isPlaying, playTrack, playAyahSequence]);

  const seek = useCallback((time: number) => {
    const active = getActiveAudio();
    if (!active) return;
    active.currentTime = time;
    setCurrentTime(time);
  }, []);

  const skipSeconds = useCallback((delta: number) => {
    const active = getActiveAudio();
    if (!active) return;
    const newTime = Math.max(0, Math.min(active.duration || 0, active.currentTime + delta));
    active.currentTime = newTime;
    setCurrentTime(newTime);
  }, []);

  const stop = useCallback(() => {
    ayahSequenceRef.current = null;
    if (audioARef.current) {
      audioARef.current.pause();
      audioARef.current.currentTime = 0;
      audioARef.current.volume = originalVolumeRef.current;
    }
    if (audioBRef.current) {
      audioBRef.current.pause();
      audioBRef.current.currentTime = 0;
      audioBRef.current.volume = originalVolumeRef.current;
    }
    setIsPlaying(false);
    setIsLoadingTrack(false);
    setHasPlaybackError(false);
    setSleepTimerState(null);
    sleepTimerRef.current = null;
    setCurrentTrack(null);
    currentTrackRef.current = null;
    setActiveVerseKey(null);
    activeVerseKeyRef.current = null;
  }, []);

  // =========================================================================
  // SURAH NAVIGATION: Prev / Next
  // =========================================================================
  const playNextSurah = useCallback(async () => {
    const track = currentTrackRef.current;
    if (!track?.surahNumber) return;
    const currentNum = track.surahNumber;
    let nextNum: number;
    if (currentNum >= 114) {
      if (loopModeRef.current === "off") {
        stop();
        return;
      }
      nextNum = 1;
    } else {
      nextNum = currentNum + 1;
    }

    const reciterId = track.reciterId || DEFAULT_RECITER.id;
    const rMeta = RECITERS_LIST.find((r) => r.id === reciterId) || DEFAULT_RECITER;
    const sMeta = SURAHS_LIST.find((s) => s.number === nextNum);
    const mode = playbackModeRef.current;

    // 1. SURAH MODE: Continuous full-Surah MP3 stream (e.g. from Audio.tsx page)
    // Strictly preserve full-Surah MP3 playback. NEVER trigger Ayah sequence!
    if (mode === "SURAH") {
      ayahSequenceRef.current = null;
      activeVerseKeyRef.current = null;
      setActiveVerseKey(null);
      const audioUrl = getSurahAudioUrl(reciterId, nextNum);
      playTrack({
        title: `Surah ${sMeta?.name_english || nextNum}`,
        subtitle: `Sheikh ${rMeta.name}`,
        arabicTitle: sMeta?.name_arabic,
        src: audioUrl,
        type: "surah",
        mode: "SURAH",
        surahNumber: nextNum,
        reciterId,
      });
      return;
    }

    // 2. AYAH_FOLLOW MODE: Mushaf synchronized follow mode (from Quran.tsx)
    // Method B: Reciters without chapter timestamps (e.g. Sheikh Yasser Al-Dosari)
    if (!rMeta.quranComId) {
      const totalVerses = sMeta?.verses_count || 7;
      const verses = Array.from({ length: totalVerses }, (_, i) => ({
        ayah: i + 1,
        verse_key: `${nextNum}:${i + 1}`,
      }));
      playAyahSequence({
        surahNumber: nextNum,
        reciterId,
        startAyahIndex: 0,
        verses,
        surahName: sMeta?.name_english || `Surah ${nextNum}`,
        reciterName: `Sheikh ${rMeta.name}`,
        arabicTitle: sMeta?.name_arabic,
      });
      return;
    }

    // Method A: Reciters with Quran.com API timestamps
    const timestampsObj = await fetchSurahTimestamps(rMeta.quranComId, nextNum);
    if (timestampsObj && timestampsObj.timestamps.length > 0) {
      playTrack({
        title: `Surah ${sMeta?.name_english || nextNum}`,
        subtitle: `Sheikh ${rMeta.name}`,
        arabicTitle: sMeta?.name_arabic,
        src: timestampsObj.audioUrl,
        type: "surah",
        mode: "AYAH_FOLLOW",
        surahNumber: nextNum,
        reciterId,
        timestamps: timestampsObj.timestamps,
      });
    } else {
      const audioUrl = getSurahAudioUrl(reciterId, nextNum);
      playTrack({
        title: `Surah ${sMeta?.name_english || nextNum}`,
        subtitle: `Sheikh ${rMeta.name}`,
        arabicTitle: sMeta?.name_arabic,
        src: audioUrl,
        type: "surah",
        mode: "AYAH_FOLLOW",
        surahNumber: nextNum,
        reciterId,
      });
    }
  }, [playTrack, playAyahSequence, stop]);

  const playPrevSurah = useCallback(async () => {
    const track = currentTrackRef.current;
    if (!track?.surahNumber) return;
    const currentNum = track.surahNumber;
    let prevNum: number;
    if (currentNum <= 1) {
      prevNum = loopModeRef.current === "off" ? 1 : 114;
    } else {
      prevNum = currentNum - 1;
    }

    const reciterId = track.reciterId || DEFAULT_RECITER.id;
    const rMeta = RECITERS_LIST.find((r) => r.id === reciterId) || DEFAULT_RECITER;
    const sMeta = SURAHS_LIST.find((s) => s.number === prevNum);
    const mode = playbackModeRef.current;

    // 1. SURAH MODE: Continuous full-Surah MP3 stream
    if (mode === "SURAH") {
      ayahSequenceRef.current = null;
      activeVerseKeyRef.current = null;
      setActiveVerseKey(null);
      const audioUrl = getSurahAudioUrl(reciterId, prevNum);
      playTrack({
        title: `Surah ${sMeta?.name_english || prevNum}`,
        subtitle: `Sheikh ${rMeta.name}`,
        arabicTitle: sMeta?.name_arabic,
        src: audioUrl,
        type: "surah",
        mode: "SURAH",
        surahNumber: prevNum,
        reciterId,
      });
      return;
    }

    // 2. AYAH_FOLLOW MODE:
    if (!rMeta.quranComId) {
      const totalVerses = sMeta?.verses_count || 7;
      const verses = Array.from({ length: totalVerses }, (_, i) => ({
        ayah: i + 1,
        verse_key: `${prevNum}:${i + 1}`,
      }));
      playAyahSequence({
        surahNumber: prevNum,
        reciterId,
        startAyahIndex: 0,
        verses,
        surahName: sMeta?.name_english || `Surah ${prevNum}`,
        reciterName: `Sheikh ${rMeta.name}`,
        arabicTitle: sMeta?.name_arabic,
      });
      return;
    }

    // Method A: Reciters with Quran.com API timestamps
    const timestampsObj = await fetchSurahTimestamps(rMeta.quranComId, prevNum);
    if (timestampsObj && timestampsObj.timestamps.length > 0) {
      playTrack({
        title: `Surah ${sMeta?.name_english || prevNum}`,
        subtitle: `Sheikh ${rMeta.name}`,
        arabicTitle: sMeta?.name_arabic,
        src: timestampsObj.audioUrl,
        type: "surah",
        mode: "AYAH_FOLLOW",
        surahNumber: prevNum,
        reciterId,
        timestamps: timestampsObj.timestamps,
      });
    } else {
      const audioUrl = getSurahAudioUrl(reciterId, prevNum);
      playTrack({
        title: `Surah ${sMeta?.name_english || prevNum}`,
        subtitle: `Sheikh ${rMeta.name}`,
        arabicTitle: sMeta?.name_arabic,
        src: audioUrl,
        type: "surah",
        mode: "AYAH_FOLLOW",
        surahNumber: prevNum,
        reciterId,
      });
    }
  }, [playTrack, playAyahSequence, stop]);

  const syncActiveSurah = useCallback((surahNumber: number, overrideReciterId?: number) => {
    if (isPlaying) return; // Do not interrupt active playback
    if (!surahNumber || surahNumber < 1 || surahNumber > 114) return;

    setCurrentTrack((prev) => {
      const reciterId = overrideReciterId || prev?.reciterId || DEFAULT_RECITER.id;
      if (prev?.surahNumber === surahNumber && prev?.reciterId === reciterId && prev?.type === "surah") {
        return prev; // Do NOT update state if already in sync
      }
      const sMeta = SURAHS_LIST.find((s) => s.number === surahNumber);
      if (!sMeta) return prev;
      const rMeta = RECITERS_LIST.find((r) => r.id === reciterId) || DEFAULT_RECITER;
      const audioUrl = getSurahAudioUrl(reciterId, surahNumber);

      const updatedTrack: AudioTrack = {
        title: `Surah ${sMeta.name_english}`,
        subtitle: `Sheikh ${rMeta.name}`,
        arabicTitle: sMeta.name_arabic,
        src: audioUrl,
        type: "surah",
        surahNumber,
        reciterId,
      };

      currentTrackRef.current = updatedTrack;
      try {
        localStorage.setItem("ruhani-last-surah", String(surahNumber));
      } catch (e) {
        console.debug("Failed saving last surah:", e);
      }
      return updatedTrack;
    });
  }, [isPlaying]);

  useEffect(() => {
    playNextSurahRef.current = playNextSurah;
  }, [playNextSurah]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        activeVerseKey,
        playbackMode,
        isPlaying,
        isLoadingTrack,
        hasPlaybackError,
        currentTime,
        duration,
        volume,
        playbackRate,
        autoPlayNextSurah,
        loopMode,
        sleepTimer,
        sleepTimerSecondsRemaining,
        setActiveVerseKey,
        setPlaybackMode,
        playTrack,
        playAyahSequence,
        togglePlay,
        seek,
        skipSeconds,
        setVolume,
        setPlaybackRate,
        setAutoPlayNextSurah,
        setLoopMode,
        setSleepTimer,
        playNextSurah,
        playPrevSurah,
        syncActiveSurah,
        stop,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

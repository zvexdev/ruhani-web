import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Gauge,
  Music
} from "lucide-react";
import { useAudio } from "../context/AudioContext";

function formatSeconds(secs: number) {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

export default function AudioPlayerBar() {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    playbackRate,
    togglePlay,
    seek,
    skipSeconds,
    setVolume,
    setPlaybackRate,
    stop,
  } = useAudio();

  if (!currentTrack) return null;

  const cycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    setPlaybackRate(SPEED_OPTIONS[nextIndex]);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 120, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="fixed bottom-3 left-3 right-3 sm:bottom-5 sm:left-6 sm:right-6 max-w-4xl mx-auto z-50 select-none"
      >
        <div className="bg-slate-950/95 dark:bg-black/95 backdrop-blur-2xl text-white rounded-3xl p-3 sm:p-4 shadow-2xl border border-emerald-500/30 flex flex-col gap-2.5">
          {/* Main Controls Row */}
          <div className="flex items-center justify-between gap-3">
            {/* Track Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-600/25 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <Music className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-xs sm:text-sm truncate text-white">
                    {currentTrack.title}
                  </p>
                  {currentTrack.arabicTitle && (
                    <span className="font-['Amiri'] text-amber-300 text-xs sm:text-sm hidden sm:inline">
                      {currentTrack.arabicTitle}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-200/70 truncate">
                  {currentTrack.subtitle || "Sheikh Yasser Al-Dosari"}
                </p>
              </div>
            </div>

            {/* Middle Playback Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => skipSeconds(-10)}
                title="Rewind 10 seconds"
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlay}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-400/25 active:scale-95 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => skipSeconds(10)}
                title="Forward 10 seconds"
                className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Right Speed & Volume & Close */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Speed rate toggle */}
              <button
                onClick={cycleSpeed}
                title="Playback Speed"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] font-mono font-bold text-amber-300 transition-colors"
              >
                <Gauge className="w-3 h-3 hidden sm:inline" />
                <span>{playbackRate}x</span>
              </button>

              {/* Volume Slider (desktop/tablet) */}
              <div className="hidden md:flex items-center gap-1.5 pl-2">
                <button
                  onClick={() => setVolume(volume === 0 ? 0.85 : 0)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-16 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:rounded-full"
                />
              </div>

              {/* Close Button */}
              <button
                onClick={stop}
                className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="Close player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrubber Line */}
          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-slate-400 px-1">
            <span>{formatSeconds(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={(e) => seek(Number(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:rounded-full"
            />
            <span>{formatSeconds(duration)}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

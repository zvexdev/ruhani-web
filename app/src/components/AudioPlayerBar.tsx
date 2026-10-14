import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  X,
  Volume2,
  VolumeX,
  Music
} from "lucide-react";
import { useAudio } from "../context/AudioContext";

function formatSeconds(secs: number) {
  if (isNaN(secs) || secs < 0) return "0:00";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioPlayerBar() {
  const { currentTrack, isPlaying, currentTime, duration, volume, togglePlay, seek, setVolume, stop } = useAudio();

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="fixed bottom-4 left-4 right-4 md:left-8 md:right-8 max-w-4xl mx-auto z-50"
      >
        <div className="bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/30 flex flex-col md:flex-row items-center gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 w-full md:w-auto flex-1 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Music className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm truncate text-white">
                  {currentTrack.title}
                </p>
                {currentTrack.arabicTitle && (
                  <span className="font-['Amiri'] text-emerald-400 text-sm hidden sm:inline">
                    {currentTrack.arabicTitle}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 truncate">
                {currentTrack.subtitle || "Ruhani Recitation"}
              </p>
            </div>
          </div>

          {/* Player Controls & Scrubber */}
          <div className="flex flex-col items-center gap-1.5 w-full md:w-2/5">
            <div className="flex items-center gap-4">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center transition-transform active:scale-95 shadow-md shadow-emerald-500/30"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2 w-full text-[11px] text-slate-400 font-mono">
              <span>{formatSeconds(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="flex-1 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full"
              />
              <span>{formatSeconds(duration)}</span>
            </div>
          </div>

          {/* Volume & Close */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
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
                className="w-16 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
              />
            </div>

            <button
              onClick={stop}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

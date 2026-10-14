// Synthetic audio feedback for Tasbeeh and spiritual notifications using Web Audio API
// Requires no external audio files and works offline reliably across all browsers.

class SoundEffects {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Soft tactile wooden bead click for Dhikr / Tasbeeh
  playBeadClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch (_) {}
  }

  // Celebratory gentle resonance chime when reaching round/target completion (e.g. 33 or 100)
  playCompletionChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const freqs = [528, 660, 792]; // Peaceful spiritual chord frequencies
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.06);

        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.06);
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + index * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.06 + 0.9);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.06);
        osc.stop(ctx.currentTime + index * 0.06 + 0.9);
      });
    } catch (_) {}
  }

  // Soft prayer chime notification
  playAthanChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const freqs = [440, 554.37, 659.25, 880];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.15 + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 1.2);
      });
    } catch (_) {}
  }
}

export const sounds = new SoundEffects();
export const soundEffects = sounds;
